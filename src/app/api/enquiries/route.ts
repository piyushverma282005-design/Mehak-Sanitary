import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { publicEnquirySchema } from '@/lib/validations';
import { getAdminSession } from '@/lib/auth';

// Public POST enquiry submission
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = publicEnquirySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Server validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Save lead directly to PostgreSQL database via Prisma
    const newEnquiry = await prisma.enquiry.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        city: data.city || null,
        companyName: data.companyName || null,
        businessType: data.businessType || null,
        enquiryType: data.enquiryType || 'General Enquiry',
        product: data.product || null,
        quantity: data.quantity || null,
        message: data.message,
        status: 'NEW',
      },
    });

    return NextResponse.json(
      { message: 'Enquiry submitted successfully', id: newEnquiry.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error submitting enquiry to Prisma/Neon:', error);
    return NextResponse.json(
      {
        error: 'Server error while saving enquiry. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      },
      { status: 500 }
    );
  }
}

// Protected GET enquiries list (Admin only)
export async function GET(request: Request) {
  const session = await getAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const businessType = searchParams.get('businessType');
    const enquiryType = searchParams.get('enquiryType');

    const whereClause: any = {};

    if (status && status !== 'all') {
      whereClause.status = status;
    }

    if (businessType && businessType !== 'all') {
      whereClause.businessType = businessType;
    }

    if (enquiryType && enquiryType !== 'all') {
      whereClause.enquiryType = enquiryType;
    }

    const enquiries = await prisma.enquiry.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(enquiries);
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    return NextResponse.json({ error: 'Failed to fetch enquiries' }, { status: 500 });
  }
}
