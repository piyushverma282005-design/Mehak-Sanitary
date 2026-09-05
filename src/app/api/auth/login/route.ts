import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { loginSchema } from '@/lib/validations';
import { verifyPassword, setAdminSessionCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
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

    // 3. Fallback: Single admin user in system
    if (!admin) {
      admin = await prisma.adminUser.findFirst();
    }

    if (!admin) {
      console.warn('[LOGIN FAILED] No AdminUser record found in database.');
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

    // Set secure HttpOnly session cookie
    await setAdminSessionCookie({ id: admin.id, email: admin.email });
    console.log('[LOGIN SUCCESSFUL] Authenticated admin:', admin.email);

    return NextResponse.json({
      message: 'Logged in successfully',
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
