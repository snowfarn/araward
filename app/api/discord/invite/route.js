import { NextResponse } from 'next/server';

function extractInviteCode(input) {
  if (!input) return '';
  let str = input.trim();
  // Strip enclosing quotes or angle brackets
  str = str.replace(/^[<"']+|[>"']+$/g, '');
  
  // Match discord.gg/xxx or discord.com/invite/xxx
  const urlMatch = str.match(/(?:discord\.gg\/|discord(?:app)?\.com\/invite\/)([a-zA-Z0-9_-]+)/i);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1];
  }
  // Match generic /invite/xxx path
  if (str.includes('/invite/')) {
    const parts = str.split('/invite/')[1]?.split(/[?#&/]/);
    if (parts && parts[0]) return parts[0];
  }
  // Fallback: clean out query parameters and take last segment
  const clean = str.split(/[?#&]/)[0].replace(/^https?:\/\//i, '').split('/').filter(Boolean).pop() || '';
  return clean.trim();
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawInput = searchParams.get('code') || searchParams.get('url');

    if (!rawInput) {
      return NextResponse.json({ success: false, error: 'Missing code or url parameter' }, { status: 400 });
    }

    const code = extractInviteCode(rawInput);
    if (!code) {
      return NextResponse.json({ success: false, error: 'Invalid invite code or URL' }, { status: 400 });
    }

    // Call Discord's public invites API
    const res = await fetch(`https://discord.com/api/v10/invites/${encodeURIComponent(code)}?with_counts=true&with_expiration=true`, {
      headers: {
        'User-Agent': 'GangBio/1.0',
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return NextResponse.json({ 
        success: false,
        found: false, 
        error: errData.message || 'Discord invite expired or server not found' 
      }, { status: 404 });
    }

    const data = await res.json();
    const guild = data.guild;

    if (!guild) {
      return NextResponse.json({ success: false, found: false, error: 'Not a server invite' }, { status: 400 });
    }

    // Construct high-res asset URLs
    const iconExt = guild.icon?.startsWith('a_') ? 'gif' : 'png';
    const bannerExt = guild.banner?.startsWith('a_') ? 'gif' : 'png';
    const splashExt = guild.splash?.startsWith('a_') ? 'gif' : 'png';

    const iconUrl = guild.icon 
      ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${iconExt}?size=256` 
      : null;
    
    const bannerUrl = guild.banner 
      ? `https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.${bannerExt}?size=1024` 
      : (guild.splash ? `https://cdn.discordapp.com/splashes/${guild.id}/${guild.splash}.${splashExt}?size=1024` : null);

    const serverData = {
      code: data.code || code,
      guildId: guild.id,
      name: guild.name,
      description: guild.description || '',
      icon: iconUrl,
      banner: bannerUrl,
      memberCount: data.approximate_member_count || 0,
      presenceCount: data.approximate_presence_count || 0,
      vanityUrlCode: guild.vanity_url_code || data.code || code,
      features: guild.features || [],
      verificationLevel: guild.verification_level,
      inviteUrl: `https://discord.gg/${data.code || code}`
    };

    return NextResponse.json({
      success: true,
      found: true,
      data: serverData,
      ...serverData
    });
  } catch (err) {
    console.error('Discord invite fetch error:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch Discord server invite' }, { status: 500 });
  }
}
