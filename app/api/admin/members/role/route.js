import { NextResponse } from 'next/server';
import { readJSON, writeJSON } from '@/lib/data';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request) {
  try {
    const body = await request.json();
    const { memberId, roleId } = body;

    if (!memberId || !roleId) {
      return NextResponse.json(
        { success: false, error: 'ข้อมูลไม่ครบถ้วน (Missing memberId or roleId)' }, 
        { status: 400 }
      );
    }

    // Always read fresh members
    const members = (await readJSON('members.json', true)) || [];
    const index = members.findIndex(m => m.id === memberId);
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบสมาชิกนี้ในระบบ (Member not found)' }, 
        { status: 404 }
      );
    }

    // Update role and timestamp
    members[index].roleId = roleId;
    members[index].updatedAt = new Date().toISOString();

    const success = await writeJSON('members.json', members);
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'บันทึกข้อมูลไม่สำเร็จ (Database write failed)' }, 
        { status: 500 }
      );
    }

    // Instant multi-path revalidation
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/members');
      revalidatePath('/dashboard');
      revalidatePath('/secret-admin/dashboard');
      revalidatePath(`/bio/${memberId}`);
      if (members[index].slug) {
        revalidatePath(`/bio/${members[index].slug}`);
      }
    } catch (revErr) {
      console.warn('Revalidation warning:', revErr);
    }

    return NextResponse.json({
      success: true,
      message: 'อัปเดตยศและตำแหน่งสมาชิกสำเร็จ',
      member: members[index],
      members: members
    });
  } catch (error) {
    console.error('Error updating member role:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
