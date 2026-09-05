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

    // Query if AdminUser exists for this email
    const adminUser = await prisma.adminUser.findUnique({
      where: { email: cleanEmail },
    });

    // To prevent email enumeration attacks, always respond with generic success message regardless of existence
    if (adminUser) {
      // Rate-limiting check: check if a reset token was requested in the last 60 seconds
      const recentToken = await prisma.passwordResetToken.findFirst({
        where: { email: cleanEmail },
        orderBy: { createdAt: 'desc' },
      });

      const ONE_MINUTE_MS = 60 * 1000;
      if (recentToken && (Date.now() - new Date(recentToken.createdAt).getTime() < ONE_MINUTE_MS)) {
        // Return generic success to prevent email spamming while maintaining non-enumeration security
        return NextResponse.json({
          success: true,
          message: 'If an administrator account exists with that email, a password reset link has been sent.',
        });
      }

      // Invalidate/delete any previous unused reset tokens for this email
      await prisma.passwordResetToken.deleteMany({
        where: { email: cleanEmail },
      });

      // Generate cryptographically secure 32-byte raw token
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes expiry

      // Save hashed token in DB
      await prisma.passwordResetToken.create({
        data: {
          email: cleanEmail,
          tokenHash,
          expiresAt,
        },
      });

      // Send email via Resend utility
      await sendPasswordResetEmail({
        toEmail: cleanEmail,
        resetToken: rawToken,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'If an administrator account exists with that email, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('[FORGOT PASSWORD API ERROR]', error);
    return NextResponse.json(
      { error: 'An internal error occurred while processing your request.' },
      { status: 500 }
    );
  }
}
