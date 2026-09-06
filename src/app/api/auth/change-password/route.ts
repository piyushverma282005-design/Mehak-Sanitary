import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession, verifyPassword, hashPassword } from '@/lib/auth';
import { changePasswordSchema } from '@/lib/validations';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 });
  }

  const ip = getClientIp(request);
  const rateCheck = checkRateLimit(`change-password:${session.id}:${ip}`, { limit: 5, windowMs: 15 * 60 * 1000 });

  if (!rateCheck.success) {
    return NextResponse.json(
      { error: 'Too many password change attempts. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const validation = changePasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validation.data;

    // Fetch AdminUser record from database
    const adminUser = await prisma.adminUser.findUnique({
      where: { id: session.id },
    });

    if (!adminUser) {
      return NextResponse.json({ error: 'Admin account not found.' }, { status: 404 });
    }

    // Verify current password
    const isCurrentValid = await verifyPassword(currentPassword, adminUser.passwordHash);

    if (!isCurrentValid) {
      return NextResponse.json(
        { error: 'The current password you entered is incorrect.' },
        { status: 400 }
      );
    }

    // Hash new password & update database
    const newPasswordHash = await hashPassword(newPassword);

    await prisma.adminUser.update({
      where: { id: adminUser.id },
      data: { passwordHash: newPasswordHash },
    });

    console.log('[PASSWORD CHANGED SUCCESSFUL]', { adminId: adminUser.id, email: adminUser.email });

    return NextResponse.json({
      message: 'Password changed successfully. Your account is secured with your new password.',
    });
  } catch (error) {
    console.error('[CHANGE PASSWORD EXCEPTION]', error);
    return NextResponse.json(
      { error: 'An internal error occurred while changing your password.' },
      { status: 500 }
    );
  }
}
