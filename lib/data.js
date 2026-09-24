import fs from 'fs';
import path from 'path';

// On Vercel, the build output (data/) is read-only.
// We use /tmp as a writable layer: copy from data/ on first read, then read/write from /tmp.
const sourceDataDir = path.join(process.cwd(), 'data');
const isVercel = !!process.env.VERCEL;
const writableDataDir = isVercel ? '/tmp/data' : sourceDataDir;

// Ensure writable directory exists on Vercel
if (isVercel) {
  try {
    if (!fs.existsSync(writableDataDir)) {
      fs.mkdirSync(writableDataDir, { recursive: true });
    }
  } catch (e) {
    console.error('Failed to create writable data dir:', e);
  }
}

// Copy a file from source (read-only) to writable dir if it doesn't exist yet
function ensureWritableCopy(filename) {
  if (!isVercel) return; // In dev, source IS the writable dir
  const writablePath = path.join(writableDataDir, filename);
  if (!fs.existsSync(writablePath)) {
    const sourcePath = path.join(sourceDataDir, filename);
    try {
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, writablePath);
      }
    } catch (e) {
      console.error(`Failed to copy ${filename} to writable dir:`, e);
    }
  }
}

// Read JSON — reads from writable dir (falls back to source)
export const readJSON = (filename) => {
  try {
    ensureWritableCopy(filename);
    const filePath = path.join(writableDataDir, filename);
    if (!fs.existsSync(filePath)) {
      // Fallback: try source dir directly
      const sourcePath = path.join(sourceDataDir, filename);
      if (!fs.existsSync(sourcePath)) return null;
      const data = fs.readFileSync(sourcePath, 'utf8');
      return JSON.parse(data);
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return null;
  }
};

// Write JSON — always writes to writable dir
export const writeJSON = (filename, data) => {
  try {
    // Ensure writable dir exists
    if (!fs.existsSync(writableDataDir)) {
      fs.mkdirSync(writableDataDir, { recursive: true });
    }
    const filePath = path.join(writableDataDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`[data] Successfully wrote ${filename} (${JSON.stringify(data).length} bytes)`);
    return true;
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    return false;
  }
};

export const getSiteSettings = () => readJSON('site_settings.json') || {};
export const getRoles = () => readJSON('roles.json') || [];
export const getMembers = () => readJSON('members.json') || [];
export const getApplications = () => readJSON('applications.json') || [];

// Lookup member by ID or custom URL slug (or name fallback)
export const getMemberByIdOrSlug = (identifier) => {
  if (!identifier) return null;
  const decoded = decodeURIComponent(identifier).trim().toLowerCase();
  const members = getMembers();
  return members.find(m => 
    m.id === identifier ||
    (m.slug && m.slug.toLowerCase() === decoded) ||
    (m.name && m.name.toLowerCase() === decoded)
  ) || null;
};

// Increment view counter for a member
export const incrementMemberViews = (memberId) => {
  try {
    const members = getMembers();
    const index = members.findIndex(m => m.id === memberId);
    if (index !== -1) {
      members[index].views = (members[index].views || 0) + 1;
      writeJSON('members.json', members);
      return members[index].views;
    }
  } catch (e) {
    console.error('Error incrementing views:', e);
  }
  return 0;
};

// Validate whether a custom URL slug is available
export const isSlugAvailable = (memberId, slug) => {
  if (!slug) return true;
  const cleanSlug = slug.trim().toLowerCase();
  const members = getMembers();
  const conflict = members.find(m => 
    m.id !== memberId && 
    (
      (m.slug && m.slug.toLowerCase() === cleanSlug) ||
      (m.name && m.name.toLowerCase() === cleanSlug) ||
      m.id === cleanSlug
    )
  );
  return !conflict;
};
