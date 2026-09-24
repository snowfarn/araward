import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { username } = resolvedParams;

    if (!username || typeof username !== 'string') {
      return NextResponse.json({ success: false, error: 'Username required' }, { status: 400 });
    }

    const cleanUsername = username.trim().replace(/^@/, '');

    // 1. Resolve Roblox Username to User ID
    const userRes = await fetch('https://users.roblox.com/v1/usernames/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usernames: [cleanUsername],
        excludeBannedUsers: false,
      }),
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!userRes.ok) {
      return NextResponse.json({
        success: false,
        name: cleanUsername,
        profileUrl: `https://www.roblox.com/search/users?keyword=${encodeURIComponent(cleanUsername)}`
      });
    }

    const userData = await userRes.json();
    const robloxUser = userData?.data?.[0];

    if (!robloxUser) {
      return NextResponse.json({
        success: false,
        name: cleanUsername,
        profileUrl: `https://www.roblox.com/search/users?keyword=${encodeURIComponent(cleanUsername)}`
      });
    }

    const userId = robloxUser.id;
    const displayName = robloxUser.displayName || robloxUser.name;
    const officialName = robloxUser.name;

    // 2. Fetch Circular Avatar Headshot Thumbnail
    let avatarUrl = null;
    try {
      const thumbRes = await fetch(
        `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=true`,
        { next: { revalidate: 3600 } }
      );
      if (thumbRes.ok) {
        const thumbData = await thumbRes.json();
        avatarUrl = thumbData?.data?.[0]?.imageUrl || null;
      }
    } catch {}

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        name: officialName,
        displayName: displayName,
        avatarUrl: avatarUrl,
        profileUrl: `https://www.roblox.com/users/${userId}/profile`
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
