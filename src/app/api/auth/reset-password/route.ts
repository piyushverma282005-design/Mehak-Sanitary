import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

// GET: Validate password reset token state (valid/invalid/expired/used)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { valid: false, error: 'Password reset token is missing.' },
        { status: 400 }
      );
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const tokenRecord = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!tokenRecord || tokenRecord.used || new Date() > tokenRecord.expiresAt) {
      return NextResponse.json(
        { valid: false, error: 'This password reset link is invalid, expired, or has already been used.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('[VERIFY RESET TOKEN API ERROR]', error);
    return NextResponse.json(
      { valid: false, error: 'Failed to verify reset token.' },
      { status: 500 }
    );
  }
}

// POST: Execute password reset
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { token, newPassword } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Password reset token is missing or invalid.' },
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    // Compute SHA-256 hash of incoming raw token
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find token record in database
    const tokenRecord = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!tokenRecord || tokenRecord.used || new Date() > tokenRecord.expiresAt) {
      return NextResponse.json(
        { error: 'This password reset link is invalid, expired, or has already been used. Please request a new one.' },
        { status: 400 }
      );
    }

    // Verify AdminUser exists
    const adminUser = await prisma.adminUser.findUnique({
      where: { email: tokenRecord.email },
    });

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Administrator account no longer exists.' },
        { status: 400 }
      );
    }

    // Hash new password using bcrypt
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Update admin user's password hash in database
    await prisma.adminUser.update({
      where: { id: adminUser.id },
      data: { passwordHash: newPasswordHash },
    });

    // Mark reset token as used to prevent reuse
    await prisma.passwordResetToken.update({
      where: { id: tokenRecord.id },
      data: { used: true },
    });

    // Build response and clear active admin_session cookie
    const response = NextResponse.json({
      success: true,
      message: 'Your password has been reset successfully.',
    });

    response.cookies.set('admin_session', '', {
      httpOnly: true,
      expires: new Date(0),
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[RESET PASSWORD API ERROR]', error);
    return NextResponse.json(
      { error: 'An internal error occurred while resetting your password.' },
      { status: 500 }
    );
  }
}
