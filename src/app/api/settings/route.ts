import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { businessSettingsSchema } from '@/lib/validations';
import { getBusinessSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Public GET website settings
export async function GET() {
  try {
    const settings = await getBusinessSettings();
    return NextResponse.json(settings, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (error) {
    console.error('Error fetching settings API:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// Protected PUT update website settings (Admin only)
export async function PUT(request: Request) {
  const session = await getAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized. Admin login required.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = businessSettingsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    const updated = await prisma.businessSettings.upsert({
      where: { id: 'global' },
      update: {
        name: data.name,
        brand: data.brand,
        tagline: data.tagline,
        description: data.description,
        phonePrimary: data.phonePrimary,
        phoneSecondary: data.phoneSecondary || null,
        phoneTertiary: data.phoneTertiary || null,
        whatsapp: data.whatsapp,
        email: data.email,
        emailSecondary: data.emailSecondary || null,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        country: data.country,
        googleMapsUrl: data.googleMapsUrl || null,
        mapEmbedUrl: data.mapEmbedUrl || null,
        instagramUrl: data.instagramUrl || null,
        facebookUrl: data.facebookUrl || null,
        youtubeUrl: data.youtubeUrl || null,
      },
      create: {
        id: 'global',
        name: data.name,
        brand: data.brand,
        tagline: data.tagline,
        description: data.description,
        phonePrimary: data.phonePrimary,
        phoneSecondary: data.phoneSecondary || null,
        phoneTertiary: data.phoneTertiary || null,
        whatsapp: data.whatsapp,
        email: data.email,
        emailSecondary: data.emailSecondary || null,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        country: data.country,
        googleMapsUrl: data.googleMapsUrl || null,
        mapEmbedUrl: data.mapEmbedUrl || null,
        instagramUrl: data.instagramUrl || null,
        facebookUrl: data.facebookUrl || null,
        youtubeUrl: data.youtubeUrl || null,
      },
    });

    // Revalidate Edge CDN cache and static pages
    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath('/about');
    revalidatePath('/contact');
    revalidatePath('/dealer-enquiry');
    revalidatePath('/admin/settings');
    revalidatePath('/api/settings');

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to save business settings.' },
      { status: 500 }
    );
  }
}
