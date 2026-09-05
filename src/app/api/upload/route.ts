import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 });
  }

  try {
    const formData = await request.formData().catch(() => null);
    if (!formData) {
      return NextResponse.json({ error: 'Invalid form data payload.' }, { status: 400 });
    }

    const file = formData.get('file') as File | null;

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No image file uploaded.' }, { status: 400 });
    }

    // Validate MIME type
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (!validMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WEBP, and AVIF images are allowed.' },
        { status: 400 }
      );
    }

    // Validate File Size (Max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds maximum 5MB limit.' },
        { status: 400 }
      );
    }

    // Convert file buffer to persistent Data URI
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64Data}`;

    // Sanitize filename
    const sanitizeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueName = `${Date.now()}_${sanitizeName}`;

    console.log('[IMAGE UPLOAD SUCCESS]', {
      name: uniqueName,
      type: file.type,
      sizeBytes: file.size,
      dataUrlLength: dataUrl.length,
    });

    return NextResponse.json({ url: dataUrl, name: uniqueName }, { status: 201 });
  } catch (error: any) {
    console.error('[IMAGE UPLOAD ERROR]', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process and store uploaded image.' },
      { status: 500 }
    );
  }
}
