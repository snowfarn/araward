import { getSiteSettings } from "@/lib/data";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const settings = await getSiteSettings();
    if (settings?.logoUrl) {
      const url = settings.logoUrl;
      // If absolute URL, redirect directly
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return NextResponse.redirect(url, {
          status: 307,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          }
        });
      }
      // If relative URL (e.g. /uploads/...), redirect with origin
      const origin = request.nextUrl.origin || 'http://localhost:3000';
      return NextResponse.redirect(`${origin}${url.startsWith('/') ? '' : '/'}${url}`, {
        status: 307,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      });
    }
  } catch (e) {
    console.error('[favicon.ico] Error fetching dynamic favicon:', e);
  }

  // Fallback to static default favicon
  const fallbackPath = path.join(process.cwd(), 'public', 'default-favicon.ico');
  if (fs.existsSync(fallbackPath)) {
    const buffer = fs.readFileSync(fallbackPath);
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/x-icon',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }

  return new NextResponse(null, { status: 404 });
}
