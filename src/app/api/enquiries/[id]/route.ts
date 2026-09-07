import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { updateEnquiryStatusSchema } from '@/lib/validations';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Protected GET enquiry by id (Admin only)
export async function GET(request: Request, { params }: RouteParams) {
  const session = await getAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const enquiry = await prisma.enquiry.findUnique({
      where: { id },
    });

    if (!enquiry) {
      return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });
    }

    return NextResponse.json(enquiry);
  } catch (error) {
    console.error('Error fetching enquiry details:', error);
    return NextResponse.json({ error: 'Failed to fetch enquiry' }, { status: 500 });
  }
}

// Protected PATCH update enquiry status (Admin only)
export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await getAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const validation = updateEnquiryStatusSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid status', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const updatedEnquiry = await prisma.enquiry.update({
      where: { id },
      data: { status: validation.data.status },
    });

    return NextResponse.json(updatedEnquiry);
  } catch (error) {
    console.error('Error updating enquiry status:', error);
    return NextResponse.json({ error: 'Failed to update enquiry status' }, { status: 500 });
  }
}

// Protected DELETE enquiry (Admin only)
export async function DELETE(request: Request, { params }: RouteParams) {
  const session = await getAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.enquiry.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Enquiry deleted' });
  } catch (error) {
    console.error('Error deleting enquiry:', error);
    return NextResponse.json({ error: 'Failed to delete enquiry' }, { status: 500 });
  }
}
