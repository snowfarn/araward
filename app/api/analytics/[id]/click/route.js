import { NextResponse } from 'next/server';
import { recordContactClick } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing member identifier' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const platform = body.platform;

    if (!platform) {
      return NextResponse.json({ success: false, error: 'Missing platform' }, { status: 400 });
    }

    const recorded = await recordContactClick(id, platform);

    return NextResponse.json({
      success: recorded
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });
  } catch (error) {
    console.error('Error recording contact click:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
