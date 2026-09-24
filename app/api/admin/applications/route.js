import { NextResponse } from 'next/server';
import { readJSON, writeJSON } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const apps = readJSON('applications.json') || [];
    const members = readJSON('members.json') || [];
    const memberIds = new Set(members.map(m => m.id));
    
    // CRITICAL: Filter out anyone who is already a member
    const pendingApps = apps.filter(a => !memberIds.has(a.id));
    
    // If there were stale entries, clean them up
    if (pendingApps.length !== apps.length) {
      writeJSON('applications.json', pendingApps);
    }

    return NextResponse.json({
      success: true,
      applications: pendingApps,
      count: pendingApps.length
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

    // Always read fresh data
    const apps = readJSON('applications.json') || [];
    const members = readJSON('members.json') || [];
    const roles = readJSON('roles.json') || [];

    if (action === 'approve') {
      const targetApp = appData || apps.find(a => a.id === appId);
      if (!targetApp) {
        return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
      }

      // CRITICAL: Check if already a member - prevent duplicates
      const alreadyMember = members.some(m => m.id === targetApp.id);
      if (!alreadyMember) {
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

      // Always remove from applications (even if already member)
      const updatedApps = apps.filter(a => a.id !== targetApp.id);
      writeJSON('applications.json', updatedApps);

      // Return updated members too
      return NextResponse.json({
        success: true,
        message: alreadyMember ? 'Already a member, cleaned up application' : 'Application approved successfully',
        applications: updatedApps,
        members: members
      });
    }

    if (action === 'reject') {
      const updatedApps = apps.filter(a => a.id !== appId);
      writeJSON('applications.json', updatedApps);

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
