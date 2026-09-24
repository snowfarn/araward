'use server';

import { writeJSON, readJSON } from './data';
import { revalidatePath } from 'next/cache';

// NOTE: Add authentication checks here later.

export async function updateSiteSettings(settings) {
  const success = writeJSON('site_settings.json', settings);
  if (success) {
    revalidatePath('/', 'layout');
    revalidatePath('/members', 'layout');
    revalidatePath('/secret-admin/dashboard', 'layout');
  }
  return success;
}

export async function updateRoles(roles) {
  const success = writeJSON('roles.json', roles);
  if (success) {
    revalidatePath('/');
    revalidatePath('/members');
  }
  return success;
}

export async function updateMembers(members) {
  const success = writeJSON('members.json', members);
  if (success) {
    revalidatePath('/members');
    revalidatePath('/dashboard');
  }
  return success;
}

export async function applyToGang(application) {
  const apps = readJSON('applications.json') || [];
  apps.push(application);
  return writeJSON('applications.json', apps);
}

export async function checkSlug(memberId, slug) {
  if (!slug) return { available: true };
  const clean = slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
  const members = readJSON('members.json') || [];
  const exists = members.some(m => 
    m.id !== memberId && 
    (
      (m.slug && m.slug.toLowerCase() === clean) ||
      (m.name && m.name.toLowerCase() === clean) ||
      m.id === clean
    )
  );
  return { available: !exists, cleanSlug: clean };
}

export async function banMember(memberId) {
  const members = readJSON('members.json') || [];
  const index = members.findIndex(m => m.id === memberId);
  if (index === -1) return { success: false, message: 'Member not found' };
  members[index].banned = true;
  members[index].bannedAt = new Date().toISOString();
  writeJSON('members.json', members);
  revalidatePath('/members');
  revalidatePath('/dashboard');
  revalidatePath(`/bio/${memberId}`);
  if (members[index].slug) revalidatePath(`/bio/${members[index].slug}`);
  return { success: true, member: members[index] };
}

export async function unbanMember(memberId) {
  const members = readJSON('members.json') || [];
  const index = members.findIndex(m => m.id === memberId);
  if (index === -1) return { success: false, message: 'Member not found' };
  members[index].banned = false;
  delete members[index].bannedAt;
  writeJSON('members.json', members);
  revalidatePath('/members');
  revalidatePath('/dashboard');
  revalidatePath(`/bio/${memberId}`);
  if (members[index].slug) revalidatePath(`/bio/${members[index].slug}`);
  return { success: true, member: members[index] };
}

export async function deleteMember(memberId) {
  const members = readJSON('members.json') || [];
  const target = members.find(m => m.id === memberId);
  const filtered = members.filter(m => m.id !== memberId);
  writeJSON('members.json', filtered);
  revalidatePath('/members');
  revalidatePath('/dashboard');
  if (target) {
    revalidatePath(`/bio/${memberId}`);
    if (target.slug) revalidatePath(`/bio/${target.slug}`);
  }
  return { success: true };
}

export async function updateMemberBio(memberId, bioData) {
  const members = readJSON('members.json') || [];
  const index = members.findIndex(m => m.id === memberId);
  if (index === -1) {
    return { success: false, message: 'Member not found' };
  }

  if (members[index].banned) {
    return { success: false, error: 'banned', message: 'บัญชีของคุณถูกระงับการใช้งาน ไม่สามารถแก้ไขข้อมูลได้' };
  }

  // Handle custom URL slug if provided
  if (bioData.slug !== undefined) {
    let cleanSlug = (bioData.slug || '').trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9_-]/g, '');
    if (cleanSlug) {
      const exists = members.some(m => 
        m.id !== memberId && 
        (
          (m.slug && m.slug.toLowerCase() === cleanSlug) ||
          (m.name && m.name.toLowerCase() === cleanSlug) ||
          m.id === cleanSlug
        )
      );
      if (exists) {
        return { 
          success: false, 
          error: 'slug_taken', 
          message: 'ชื่อที่อยู่นี้มีผู้ใช้งานแล้ว โปรดเลือกชื่ออื่น (This URL address is already taken)' 
        };
      }
      bioData.slug = cleanSlug;
    } else {
      bioData.slug = '';
    }
  }

  // Preserve existing member fields (like roleId, views) if not explicitly overwritten
  members[index] = { 
    ...members[index], 
    ...bioData,
    updatedAt: new Date().toISOString()
  };

  writeJSON('members.json', members);
  revalidatePath('/members');
  revalidatePath('/dashboard');
  revalidatePath(`/bio/${memberId}`);
  if (members[index].slug) {
    revalidatePath(`/bio/${members[index].slug}`);
  }
  return { success: true, member: members[index] };
}

export async function recordBioView(memberId) {
  const members = readJSON('members.json') || [];
  const index = members.findIndex(m => m.id === memberId);
  if (index !== -1) {
    members[index].views = (members[index].views || 0) + 1;
    writeJSON('members.json', members);
    return members[index].views;
  }
  return 0;
}

export async function updateApplications(applications) {
  const success = writeJSON('applications.json', applications);
  return success;
}
