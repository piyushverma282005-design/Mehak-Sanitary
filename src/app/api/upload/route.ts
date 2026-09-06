import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';

function isValidImageMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 12) return false;

  // JPEG: FF D8 FF
  if (mimeType === 'image/jpeg') {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  // PNG: 89 50 4E 47
  if (mimeType === 'image/png') {
    return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  }

  // WEBP: RIFF ... WEBP
  if (mimeType === 'image/webp') {
    const isRiff = buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46;
    const isWebp = buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;
    return isRiff && isWebp;
  }

  // AVIF: ftyp at offset 4
  if (mimeType === 'image/avif') {
    return buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x70;
  }

  return false;
}

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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate Binary Magic Bytes Signature
    if (!isValidImageMagicBytes(buffer, file.type)) {
      return NextResponse.json(
        { error: 'File signature check failed. Uploaded binary content does not match image headers.' },
        { status: 400 }
      );
    }

    // Convert file buffer to persistent Data URI
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
      { error: 'Failed to process and store uploaded image.' },
      { status: 500 }
    );
  }
}
