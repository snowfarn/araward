import { NextResponse } from 'next/server';
import { getApplications, getMembers, getRoles, readJSON, writeJSON } from '@/lib/data';
import { revalidatePath } from 'next/cache';

export async function GET() {
  try {
    const apps = getApplications();
    return NextResponse.json({
      success: true,
      applications: apps,
      count: apps.length
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, appId, appData } = body;

    const apps = readJSON('applications.json') || [];
    const members = readJSON('members.json') || [];
    const roles = readJSON('roles.json') || [];

    if (action === 'approve') {
      const targetApp = appData || apps.find(a => a.id === appId);
      if (!targetApp) {
        return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
      }

      // Check if already in members
      if (!members.some(m => m.id === targetApp.id)) {
        const cleanSlug = (targetApp.name || '').toLowerCase().replace(/[^a-z0-9_-]/g, '') || targetApp.id;
        const newMember = {
          id: targetApp.id,
          name: targetApp.name || 'Member',
          slug: cleanSlug,
          avatar: targetApp.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png',
          roleId: roles[0]?.id || 'member',
          accessory: 'none',
          bio: 'New Syndicate Member',
          particleType: 'snow',
          particleColor: '#ffffff',
          cursorEffect: 'sparkle_trail',
          primaryColor: '#ff2a44',
          textColor: '#ffffff',
          cardStyle: 'glass',
          discordId: targetApp.id,
          discordUsername: targetApp.username || targetApp.name,
          discordStatusText: '',
          discordBadge: 'MEMBER',
          views: 0,
          socials: {},
          createdAt: new Date().toISOString()
        };
        members.push(newMember);
        writeJSON('members.json', members);
      }

      // Remove from applications
      const updatedApps = apps.filter(a => a.id !== targetApp.id);
      writeJSON('applications.json', updatedApps);

      revalidatePath('/secret-admin/dashboard');
      revalidatePath('/dashboard');
      revalidatePath('/members');

      return NextResponse.json({
        success: true,
        message: 'Application approved successfully',
        applications: updatedApps
      });
    }

    if (action === 'reject') {
      const updatedApps = apps.filter(a => a.id !== appId);
      writeJSON('applications.json', updatedApps);

      revalidatePath('/secret-admin/dashboard');
      revalidatePath('/dashboard');

      return NextResponse.json({
        success: true,
        message: 'Application rejected',
        applications: updatedApps
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
