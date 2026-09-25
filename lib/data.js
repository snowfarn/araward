import fs from 'fs';
import path from 'path';
import { cache } from 'react';
import { Redis } from '@upstash/redis';

// ============================================================
// DATA LAYER — Uses Upstash Redis on Vercel, filesystem in dev
// Optimized with in-memory caching and React request deduplication
// ============================================================

const dataDir = path.join(process.cwd(), 'data');

// --- In-Memory Cache (reduces repeated Redis round-trips for rapid page loads) ---
const memoryCache = new Map();
const CACHE_TTL_MS = 15000; // 15 seconds TTL

export function invalidateCache(filename) {
  if (filename) {
    memoryCache.delete(filename);
  } else {
    memoryCache.clear();
  }
}

// --- Redis Setup ---
let redis = null;
function getRedis() {
  if (!redis) {
    const url = process.env.STORAGE_REST_API_URL || 
                process.env.STORAGE_URL || 
                process.env.UPSTASH_REDIS_REST_URL || 
                process.env.KV_REST_API_URL ||
                process.env.REDIS_URL;
    const token = process.env.STORAGE_REST_API_TOKEN || 
                  process.env.STORAGE_TOKEN || 
                  process.env.UPSTASH_REDIS_REST_TOKEN || 
                  process.env.KV_REST_API_TOKEN ||
                  process.env.REDIS_TOKEN;
    if (url && token) {
      redis = new Redis({ url, token });
    }
  }
  return redis;
}

// --- Filesystem helpers (local dev fallback) ---
function readFileJSON(filename) {
  try {
    const filePath = path.join(dataDir, filename);
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.error(`[fs] Error reading ${filename}:`, e);
    return null;
  }
}

function writeFileJSON(filename, data) {
  try {
    const filePath = path.join(dataDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error(`[fs] Error writing ${filename}:`, e);
    return false;
  }
}

// --- Key for Redis (e.g. "members.json" -> "data:members") ---
function redisKey(filename) {
  return `data:${filename.replace('.json', '')}`;
}

// --- ASYNC Read/Write (Redis primary, filesystem fallback, with memory cache) ---
export async function readJSON(filename, forceFresh = false) {
  // Check memory cache first
  if (!forceFresh) {
    const cached = memoryCache.get(filename);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      return cached.data;
    }
  }

  const r = getRedis();
  if (r) {
    try {
      const data = await r.get(redisKey(filename));
      if (data !== null && data !== undefined) {
        // Upstash auto-parses JSON, but handle string case
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        memoryCache.set(filename, { data: parsed, timestamp: Date.now() });
        return parsed;
      }
      // Not in Redis yet — seed from filesystem
      const fileData = readFileJSON(filename);
      if (fileData !== null) {
        await r.set(redisKey(filename), JSON.stringify(fileData));
        memoryCache.set(filename, { data: fileData, timestamp: Date.now() });
      }
      return fileData;
    } catch (e) {
      if (e?.digest === 'DYNAMIC_SERVER_USAGE') {
        throw e;
      }
      console.error(`[redis] Error reading ${filename}:`, e);
      const fileData = readFileJSON(filename);
      if (fileData !== null) {
        memoryCache.set(filename, { data: fileData, timestamp: Date.now() });
      }
      return fileData;
    }
  }

  const fileData = readFileJSON(filename);
  if (fileData !== null) {
    memoryCache.set(filename, { data: fileData, timestamp: Date.now() });
  }
  return fileData;
}

export async function writeJSON(filename, data) {
  // Update memory cache immediately so subsequent reads reflect this write with 0ms delay
  memoryCache.set(filename, { data, timestamp: Date.now() });

  const r = getRedis();
  if (r) {
    try {
      await r.set(redisKey(filename), JSON.stringify(data));
      // In background, also sync filesystem if not on readonly
      try {
        writeFileJSON(filename, data);
      } catch {}
      return true;
    } catch (e) {
      console.error(`[redis] Error writing ${filename}:`, e);
      return writeFileJSON(filename, data);
    }
  }
  return writeFileJSON(filename, data);
}

// --- Data accessors (cached per-request via React cache) ---
export const getSiteSettings = cache(async () => {
  return (await readJSON('site_settings.json')) || {};
});

export const getRoles = cache(async () => {
  return (await readJSON('roles.json')) || [];
});

export const getMembers = cache(async () => {
  const members = (await readJSON('members.json')) || [];
  const r = getRedis();
  if (r && Array.isArray(members) && members.length > 0) {
    try {
      const keys = members.map(m => `views:${m.id}`);
      const viewsList = await r.mget(...keys);
      if (Array.isArray(viewsList)) {
        viewsList.forEach((val, idx) => {
          if (val !== null && val !== undefined && members[idx]) {
            const num = parseInt(val, 10);
            if (!isNaN(num) && num > (members[idx].views || 0)) {
              members[idx].views = num;
            }
          }
        });
      }
    } catch {
      // Non-fatal, fallback to base member views
    }
  }
  return members;
});

export const getApplications = cache(async () => {
  return (await readJSON('applications.json')) || [];
});

export const getMemberByIdOrSlug = cache(async (identifier) => {
  if (!identifier) return null;
  let decoded = String(identifier).trim().toLowerCase();
  try {
    decoded = decodeURIComponent(identifier).trim().toLowerCase();
  } catch {}
  const members = (await getMembers()) || [];
  return members.find(m =>
    m && (
      m.id === identifier ||
      (m.slug && m.slug.toLowerCase() === decoded) ||
      (m.name && m.name.toLowerCase() === decoded)
    )
  ) || null;
});

// --- Lightweight, ultra-fast Redis atomic view counter ---
export async function incrementMemberViews(memberId) {
  if (!memberId) return 0;
  const r = getRedis();
  const viewKey = `views:${memberId}`;

  if (r) {
    try {
      const exists = await r.exists(viewKey);
      if (!exists) {
        // Seed from members base view count
        const members = (await readJSON('members.json')) || [];
        const m = members.find(item => item && (item.id === memberId || item.slug === memberId));
        const base = m?.views || 0;
        await r.set(viewKey, base);
      }
      const newCount = await r.incr(viewKey);

      // Update in-memory member views cache if loaded
      const cached = memoryCache.get('members.json');
      if (cached?.data && Array.isArray(cached.data)) {
        const target = cached.data.find(item => item && (item.id === memberId || item.slug === memberId));
        if (target) {
          target.views = newCount;
        }
      }
      return newCount;
    } catch (e) {
      console.error(`[redis] Error incrementing views for ${memberId}:`, e);
    }
  }

  // Local filesystem fallback
  try {
    const members = readFileJSON('members.json') || [];
    const index = members.findIndex(m => m && (m.id === memberId || m.slug === memberId));
    if (index !== -1) {
      members[index].views = (members[index].views || 0) + 1;
      writeFileJSON('members.json', members);
      return members[index].views;
    }
  } catch (e) {
    console.error('Error writing fallback views:', e);
  }
  return 0;
}

export async function getMemberViews(memberId) {
  if (!memberId) return 0;
  const r = getRedis();
  const viewKey = `views:${memberId}`;

  if (r) {
    try {
      const val = await r.get(viewKey);
      if (val !== null && val !== undefined) {
        return parseInt(val, 10) || 0;
      }
    } catch (e) {
      console.error(`[redis] Error reading views for ${memberId}:`, e);
    }
  }

  // Fallback to member.views from members.json
  const members = (await getMembers()) || [];
  const m = members.find(item => item && (item.id === memberId || item.slug === memberId));
  return m?.views || 0;
}

export async function isSlugAvailable(memberId, slug) {
  if (!slug) return true;
  const cleanSlug = slug.trim().toLowerCase();
  const members = await getMembers();
  const conflict = members.find(m =>
    m.id !== memberId &&
    (
      (m.slug && m.slug.toLowerCase() === cleanSlug) ||
      (m.name && m.name.toLowerCase() === cleanSlug) ||
      m.id === cleanSlug
    )
  );
  return !conflict;
}

