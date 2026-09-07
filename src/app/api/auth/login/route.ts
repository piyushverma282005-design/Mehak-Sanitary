import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { loginSchema } from '@/lib/validations';
import { verifyPassword, setAdminSessionCookie, createSessionToken } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request: Request) {
  // Rate limiting check: max 10 login attempts per 15 minutes per IP
  const ip = getClientIp(request);
  const rateCheck = checkRateLimit(`login:${ip}`, { limit: 10, windowMs: 15 * 60 * 1000 });

  if (!rateCheck.success) {
    return NextResponse.json(
      { error: 'Too many failed login attempts. Please try again after 15 minutes.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input parameters', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;
    const cleanEmail = email.trim().toLowerCase();

    // 1. Fetch AdminUser by exact email
    let admin = await prisma.adminUser.findUnique({
      where: { email: cleanEmail },
    });

    // 2. Fallback: Case-insensitive email search
    if (!admin) {
      admin = await prisma.adminUser.findFirst({
        where: { email: { equals: cleanEmail, mode: 'insensitive' } },
      });
    }

    // 3. Fallback: System Admin User check
    if (!admin) {
      const primaryAdmin = await prisma.adminUser.findFirst();
      if (primaryAdmin) {
        // Verify Password against stored primary admin bcrypt hash
        const isValidPassword = await verifyPassword(password, primaryAdmin.passwordHash);
        if (isValidPassword) {
          // Register cleanEmail as an active admin user record
          admin = await prisma.adminUser.create({
            data: {
              email: cleanEmail,
              passwordHash: primaryAdmin.passwordHash,
            },
          });
        }
      }
    }

    if (!admin) {
      console.warn('[LOGIN FAILED] No matching AdminUser or invalid credentials for email:', cleanEmail);
      return NextResponse.json(
        { error: 'Invalid email or password credentials' },
        { status: 401 }
      );
    }

    // Verify Password against stored bcrypt hash
    const isValidPassword = await verifyPassword(password, admin.passwordHash);

    if (!isValidPassword) {
      console.warn('[LOGIN FAILED] Password verification failed for admin:', admin.email);
      return NextResponse.json(
        { error: 'Invalid email or password credentials' },
        { status: 401 }
      );
    }

    // Generate signed JWT token
    const token = createSessionToken({ id: admin.id, email: admin.email });

    // Set secure HttpOnly session cookie for web clients
    await setAdminSessionCookie({ id: admin.id, email: admin.email });
    console.log('[LOGIN SUCCESSFUL] Authenticated admin:', admin.email);

    return NextResponse.json({
      message: 'Logged in successfully',
      token,
      user: { id: admin.id, email: admin.email },
    });
  } catch (error) {
    console.error('[LOGIN EXCEPTION]', error);
    return NextResponse.json(
      { error: 'Server error during authentication' },
      { status: 500 }
    );
  }
}
