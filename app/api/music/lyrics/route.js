import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const track = searchParams.get('track');
    const artist = searchParams.get('artist');
    const q = searchParams.get('q');

    let lyricsData = null;

    // 1. Try exact match with track & artist
    if (track && artist) {
      try {
        const getUrl = `https://lrclib.net/api/get?track_name=${encodeURIComponent(track.trim())}&artist_name=${encodeURIComponent(artist.trim())}`;
        const res = await fetch(getUrl, {
          headers: { 'User-Agent': 'GangBio/1.0' },
          cache: 'no-store'
        });
        if (res.ok) {
          lyricsData = await res.json();
        }
      } catch (e) {
        console.error('LRCLIB get error:', e);
      }
    }

    // 2. If not found or only query provided, try LRCLIB search
    if (!lyricsData || (!lyricsData.plainLyrics && !lyricsData.syncedLyrics)) {
      const searchQuery = q || (track ? `${track} ${artist || ''}` : '');
      if (searchQuery.trim()) {
        try {
          const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(searchQuery.trim())}`;
          const res = await fetch(searchUrl, {
            headers: { 'User-Agent': 'GangBio/1.0' },
            cache: 'no-store'
          });
          if (res.ok) {
            const list = await res.json();
            if (Array.isArray(list) && list.length > 0) {
              // Find item with lyrics
              lyricsData = list.find(item => item.syncedLyrics || item.plainLyrics) || list[0];
            }
          }
        } catch (e) {
          console.error('LRCLIB search error:', e);
        }
      }
    }

    if (!lyricsData || (!lyricsData.plainLyrics && !lyricsData.syncedLyrics)) {
      return NextResponse.json({ 
        found: false, 
        message: 'No lyrics found for this track' 
      });
    }

    return NextResponse.json({
      found: true,
      trackName: lyricsData.trackName,
      artistName: lyricsData.artistName,
      plainLyrics: lyricsData.plainLyrics || '',
      syncedLyrics: lyricsData.syncedLyrics || '',
      instrumental: lyricsData.instrumental || false
    });
  } catch (err) {
    console.error('Lyrics API error:', err);
    return NextResponse.json({ error: 'Failed to fetch lyrics' }, { status: 500 });
  }
}
