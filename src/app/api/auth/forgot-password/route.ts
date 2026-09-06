import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request: Request) {
  // Rate limiting check: max 5 reset requests per 15 minutes per IP
  const ip = getClientIp(request);
  const rateCheck = checkRateLimit(`forgot-password:${ip}`, { limit: 5, windowMs: 15 * 60 * 1000 });

  if (!rateCheck.success) {
    return NextResponse.json({
      success: true,
      message: 'If an administrator account exists with that email, a password reset link has been sent.',
    });
  }

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

    // Query AdminUser from Database by exact email or case-insensitive email match
    let adminUser = await prisma.adminUser.findUnique({
      where: { email: cleanEmail },
    });

    if (!adminUser) {
      adminUser = await prisma.adminUser.findFirst({
        where: { email: { equals: cleanEmail, mode: 'insensitive' } },
      });
    }

    // Fallback: If any primary admin user exists in database
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

    const targetEmail = cleanEmail;

    // Invalidate/delete any previous unused reset tokens for this admin target email
    await prisma.passwordResetToken.deleteMany({
      where: { email: targetEmail },
    });

    // Generate cryptographically secure 32-byte raw token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes expiry

    // Save hashed token in Neon DB
    const dbTokenRecord = await prisma.passwordResetToken.create({
      data: {
        email: targetEmail,
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
      toEmail: targetEmail,
      resetToken: rawToken,
    });

    if (!emailResult.success) {
      console.error('[FORGOT PASSWORD RESEND FAILED]', emailResult);
      if (emailResult.error === 'RESEND_API_KEY_MISSING') {
        return NextResponse.json(
          { error: 'Email service configuration (RESEND_API_KEY) is missing on server.' },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: `Failed to dispatch email: ${emailResult.error}` },
        { status: 500 }
      );
    }

    console.log('[FORGOT PASSWORD EMAIL DISPATCH SUCCESSFUL]', {
      emailId: emailResult.id,
      recipient: targetEmail,
    });

    return NextResponse.json({
      success: true,
      message: 'A password reset link has been sent to your administrator email address.',
    });
  } catch (error: any) {
    console.error('[FORGOT PASSWORD API EXCEPTION]', error);
    return NextResponse.json(
      { error: 'An internal error occurred while processing your password reset request.' },
      { status: 500 }
    );
  }
}
