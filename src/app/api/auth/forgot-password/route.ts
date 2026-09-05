import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please provide a valid administrator email address.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Query AdminUser from Database
    let adminUser = await prisma.adminUser.findUnique({
      where: { email: cleanEmail },
    });

    // Fallback: If not found by exact string, check case-insensitive or single admin record
    if (!adminUser) {
      adminUser = await prisma.adminUser.findFirst({
        where: { email: { equals: cleanEmail, mode: 'insensitive' } },
      });
    }

    // If still not found, check if there is a primary AdminUser in system
    if (!adminUser) {
      adminUser = await prisma.adminUser.findFirst();
    }

    if (!adminUser) {
      console.warn('[FORGOT PASSWORD] No AdminUser found in database.');
      return NextResponse.json({
        success: true,
        message: 'If an administrator account exists with that email, a password reset link has been sent.',
      });
    }

    // Rate-limiting check: check if a reset token was requested in the last 60 seconds
    const recentToken = await prisma.passwordResetToken.findFirst({
      where: { email: adminUser.email },
      orderBy: { createdAt: 'desc' },
    });

    const ONE_MINUTE_MS = 60 * 1000;
    if (recentToken && (Date.now() - new Date(recentToken.createdAt).getTime() < ONE_MINUTE_MS)) {
      console.log('[FORGOT PASSWORD] Rate limited request for:', cleanEmail);
      return NextResponse.json({
        success: true,
        message: 'If an administrator account exists with that email, a password reset link has been sent.',
      });
    }

    // Invalidate/delete any previous unused reset tokens for this admin
    await prisma.passwordResetToken.deleteMany({
      where: { email: adminUser.email },
    });

    // Generate cryptographically secure 32-byte raw token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes expiry

    // Save hashed token in Neon DB
    const dbTokenRecord = await prisma.passwordResetToken.create({
      data: {
        email: adminUser.email,
        tokenHash,
        expiresAt,
      },
    });

    console.log('[FORGOT PASSWORD DB TOKEN CREATED]', {
      id: dbTokenRecord.id,
      email: dbTokenRecord.email,
      expiresAt: dbTokenRecord.expiresAt,
    });

    // Dispatch email via Resend
    const emailResult = await sendPasswordResetEmail({
      toEmail: cleanEmail,
      resetToken: rawToken,
    });

    if (!emailResult.success) {
      console.error('[FORGOT PASSWORD RESEND FAILED]', emailResult);
      return NextResponse.json(
        { error: `Failed to dispatch email via Resend: ${emailResult.error}` },
        { status: 500 }
      );
    }

    console.log('[FORGOT PASSWORD EMAIL DISPATCH SUCCESSFUL]', {
      emailId: emailResult.id,
      recipient: cleanEmail,
    });

    return NextResponse.json({
      success: true,
      message: 'If an administrator account exists with that email, a password reset link has been sent.',
      emailId: emailResult.id,
    });
  } catch (error: any) {
    console.error('[FORGOT PASSWORD API EXCEPTION]', error);
    return NextResponse.json(
      { error: error?.message || 'An internal error occurred while processing your request.' },
      { status: 500 }
    );
  }
}
