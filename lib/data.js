import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');

// Read JSON
export const readJSON = (filename) => {
  try {
    const filePath = path.join(dataDir, filename);
    if (!fs.existsSync(filePath)) return null;
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return null;
  }
};

// Write JSON
export const writeJSON = (filename, data) => {
  try {
    const filePath = path.join(dataDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
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

