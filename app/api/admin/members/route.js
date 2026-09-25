import { NextResponse } from 'next/server';
import { readJSON } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const members = (await readJSON('members.json', true)) || [];
    return NextResponse.json({
      success: true,
      members,
      count: members.length
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
