import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { deleteUploadFile, cleanOrphanUploads } from '@/lib/data';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const oldUrl = formData.get('oldUrl');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Vercel serverless function has a 4.5MB limit
    if (buffer.length > 4.5 * 1024 * 1024) {
      return NextResponse.json({ error: 'ไฟล์มีขนาดใหญ่เกินไป (จำกัดไม่เกิน 4MB)' }, { status: 400 });
    }

    const mimeType = file.type || 'image/png';
    let fileUrl = null;
    const isVercel = !!process.env.VERCEL;

    // In local dev, save to public/uploads
    if (!isVercel) {
      try {
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const ext = path.extname(file.name) || '';
        const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
        const fileName = `${Date.now()}_${baseName}${ext}`;
        const filePath = path.join(uploadsDir, fileName);

        fs.writeFileSync(filePath, buffer);
        fileUrl = `/uploads/${fileName}`;

        // If replacing an old uploaded file, delete the old unused file immediately
        if (oldUrl && typeof oldUrl === 'string' && oldUrl.startsWith('/uploads/')) {
          deleteUploadFile(oldUrl).catch(() => {});
        }

        // Background orphan cleanup so storage stays clean
        cleanOrphanUploads().catch(() => {});
      } catch (fsErr) {
        console.warn('Filesystem write failed, falling back to data URL:', fsErr.message);
      }
    }

    // On Vercel (read-only filesystem) or fallback: use Base64 Data URL
    if (!fileUrl) {
      fileUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
    }

    return NextResponse.json({ 
      success: true, 
      url: fileUrl,
      fileName: file.name 
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}

// Explicit DELETE handler for removing an uploaded file
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get('url');
    if (!fileUrl) {
      return NextResponse.json({ error: 'URL required' }, { status: 400 });
    }
    const deleted = await deleteUploadFile(fileUrl);
    await cleanOrphanUploads().catch(() => {});
    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

