import { NextResponse } from 'next/server';
import { getMemberAnalytics } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing member identifier' }, { status: 400 });
    }

    const analytics = await getMemberAnalytics(id);

    return NextResponse.json({
      success: true,
      data: analytics
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });
  } catch (error) {
    console.error('Error getting member analytics:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
