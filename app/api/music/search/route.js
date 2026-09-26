import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || !query.trim()) {
      return NextResponse.json({ results: [] });
    }

    const cleanQuery = query.trim();

    // 1. Search iTunes API for tracks (supports Thai, English, international)
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(cleanQuery)}&entity=song&limit=12`;
    const itunesRes = await fetch(itunesUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      cache: 'no-store'
    });

    let results = [];
    if (itunesRes.ok) {
      const data = await itunesRes.json();
      if (data.results && Array.isArray(data.results)) {
        results = data.results.map(item => {
          const artwork = item.artworkUrl100 
            ? item.artworkUrl100.replace('100x100bb', '600x600bb') 
            : null;
          return {
            id: String(item.trackId),
            title: item.trackName,
            artist: item.artistName,
            album: item.collectionName,
            cover: artwork,
            previewUrl: item.previewUrl,
            duration: Math.round((item.trackTimeMillis || 0) / 1000),
            trackViewUrl: item.trackViewUrl,
          };
        });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error('Music search error:', err);
    return NextResponse.json({ success: false, error: 'Search failed', results: [] }, { status: 500 });
  }
}
