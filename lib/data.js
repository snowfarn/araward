import fs from 'fs';
import path from 'path';
import { Redis } from '@upstash/redis';

// ============================================================
// DATA LAYER — Uses Upstash Redis on Vercel, filesystem in dev
// ============================================================

const dataDir = path.join(process.cwd(), 'data');

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

// --- ASYNC Read/Write (Redis primary, filesystem fallback) ---
export async function readJSON(filename) {
  const r = getRedis();
  if (r) {
    try {
      const data = await r.get(redisKey(filename));
      if (data !== null && data !== undefined) {
        // Upstash auto-parses JSON, but handle string case
        return typeof data === 'string' ? JSON.parse(data) : data;
      }
      // Not in Redis yet — seed from filesystem
      const fileData = readFileJSON(filename);
      if (fileData !== null) {
        await r.set(redisKey(filename), JSON.stringify(fileData));
      }
      return fileData;
    } catch (e) {
      console.error(`[redis] Error reading ${filename}:`, e);
      return readFileJSON(filename);
    }
  }
  return readFileJSON(filename);
}

export async function writeJSON(filename, data) {
  const r = getRedis();
  if (r) {
    try {
      await r.set(redisKey(filename), JSON.stringify(data));
      return true;
    } catch (e) {
      console.error(`[redis] Error writing ${filename}:`, e);
      return false;
    }
  }
  return writeFileJSON(filename, data);
}

// --- Data accessors (all async) ---
export async function getSiteSettings() {
  return (await readJSON('site_settings.json')) || {};
}

export async function getRoles() {
  return (await readJSON('roles.json')) || [];
}

export async function getMembers() {
  return (await readJSON('members.json')) || [];
}

export async function getApplications() {
  return (await readJSON('applications.json')) || [];
}

export async function getMemberByIdOrSlug(identifier) {
  if (!identifier) return null;
  const decoded = decodeURIComponent(identifier).trim().toLowerCase();
  const members = await getMembers();
  return members.find(m =>
    m.id === identifier ||
    (m.slug && m.slug.toLowerCase() === decoded) ||
    (m.name && m.name.toLowerCase() === decoded)
  ) || null;
}

export async function incrementMemberViews(memberId) {
  try {
    const members = await getMembers();
    const index = members.findIndex(m => m.id === memberId);
    if (index !== -1) {
      members[index].views = (members[index].views || 0) + 1;
      await writeJSON('members.json', members);
      return members[index].views;
    }
  } catch (e) {
    console.error('Error incrementing views:', e);
  }
  return 0;
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
