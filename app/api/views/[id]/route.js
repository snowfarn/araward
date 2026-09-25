import { NextResponse } from 'next/server';
import { incrementMemberViews, getMemberViews } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing member identifier' }, { status: 400 });
    }

    const newViews = await incrementMemberViews(id);

    return NextResponse.json({
      success: true,
      views: newViews
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });
  } catch (error) {
    console.error('Error incrementing views via API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing member identifier' }, { status: 400 });
    }

    const views = await getMemberViews(id);

    return NextResponse.json({
      success: true,
      views
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });
  } catch (error) {
    console.error('Error getting views via API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
