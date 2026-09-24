import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  return handleSync(userId);
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  return handleSync(body.userId);
}

async function handleSync(requestedUserId) {
  try {
    const session = await getServerSession(authOptions);
    const targetUserId = requestedUserId || session?.user?.id || '1471173112409096269';

    if (!targetUserId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
    }

    let syncedData = {
      discordId: targetUserId,
      username: session?.user?.name || '',
      displayName: '',
      avatar: session?.user?.image || '',
      statusText: '',
      badge: '',
      discordStatus: 'online',
      guildCount: 0,
      guilds: [],
      syncedAt: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      hasGuildScope: Boolean(session?.user?.accessToken)
    };

    // 1. Fetch from Lanyard API (Real-time gateway presence, custom status, activity, primary guild tag)
    try {
      const lanyardRes = await fetch(`https://api.lanyard.rest/v1/users/${targetUserId}`, {
        cache: 'no-store'
      });
      if (lanyardRes.ok) {
        const lanyardJson = await lanyardRes.json();
        const d = lanyardJson?.data;
        if (d) {
          const user = d.discord_user;
          if (user) {
            syncedData.username = user.username || user.global_name || syncedData.username;
            syncedData.displayName = user.display_name || user.global_name || user.username;
            if (user.avatar) {
              const ext = user.avatar.startsWith('a_') ? 'gif' : 'png';
              syncedData.avatar = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=256`;
            }
            if (user.primary_guild?.tag) {
              syncedData.badge = user.primary_guild.tag;
            }
            if (user.primary_guild?.badge && user.primary_guild?.identity_guild_id) {
              syncedData.badgeIcon = `https://cdn.discordapp.com/clan-badges/${user.primary_guild.identity_guild_id}/${user.primary_guild.badge}.png`;
            }
          }

          syncedData.discordStatus = d.discord_status || 'online';

          // Extract live custom status / Note / Spotify / Game activity
          const customStatus = d.activities?.find(a => a.type === 4)?.state;
          const spotify = d.spotify ? `Listening to ${d.spotify.song}` : null;
          const game = d.activities?.find(a => a.type === 0)?.name ? `Playing ${d.activities.find(a => a.type === 0).name}` : null;

          syncedData.statusText = customStatus || spotify || game || user.global_name || user.username || '';
          syncedData.note = customStatus || user.global_name || user.username || '';
        }
      }
    } catch (e) {
      console.error('Lanyard sync error:', e);
    }

    // 2. If access token available from session, check Discord Guilds API (identify + guilds scope)
    if (session?.user?.accessToken) {
      try {
        const guildRes = await fetch('https://discord.com/api/users/@me/guilds', {
          headers: { Authorization: `Bearer ${session.user.accessToken}` },
          cache: 'no-store'
        });
        if (guildRes.ok) {
          const guilds = await guildRes.json();
          if (Array.isArray(guilds)) {
            syncedData.guildCount = guilds.length;
            syncedData.guilds = guilds.slice(0, 10).map(g => ({
              id: g.id,
              name: g.name,
              icon: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png` : null
            }));
            // If badge is still empty, use user's first guild name or acronym
            if (!syncedData.badge && guilds.length > 0) {
              syncedData.badge = guilds[0].name.substring(0, 8).toUpperCase();
            }
            if (!syncedData.badgeIcon && guilds.length > 0 && guilds[0].icon) {
              syncedData.badgeIcon = `https://cdn.discordapp.com/icons/${guilds[0].id}/${guilds[0].icon}.png`;
            }
          }
        }
      } catch (e) {
        console.error('Discord guilds error:', e);
      }
    }

    // Fallback badge & icon
    if (!syncedData.badge) {
      syncedData.badge = '25ms';
    }
    if (!syncedData.badgeIcon) {
      // Default to user's clan badge
      syncedData.badgeIcon = 'https://cdn.discordapp.com/clan-badges/1306714913539887237/eac3e8b8d6774cd33d8cd27fd7c0a2ff.png';
    }

    return NextResponse.json({
      success: true,
      data: syncedData
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
