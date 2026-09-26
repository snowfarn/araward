import { getSiteSettings, checkAndSyncPartners } from '@/lib/data';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const settings = await getSiteSettings();
    if (settings && Array.isArray(settings.partners)) {
      checkAndSyncPartners(settings).catch(() => {});
    }
    return NextResponse.json({
      success: true,
      partners: settings?.partners || [],
      syncedAt: Date.now()
    });
  } catch (err) {
    console.error('Failed to get partners:', err);
    return NextResponse.json({ success: false, partners: [] }, { status: 500 });
  }
}
