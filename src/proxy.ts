import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJwtEdge } from '@/lib/jwtEdge';

const COOKIE_NAME = 'admin_session';
const JWT_SECRET = process.env.JWT_SECRET || 'mehak-sanitary-jwt-secret-fallback-key-2026';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Intercept all /admin routes
  if (pathname.startsWith('/admin')) {
    // Public admin authentication pages exempt from session requirement
    if (
      pathname === '/admin/login' ||
      pathname === '/admin/forgot-password' ||
      pathname === '/admin/reset-password'
    ) {
      return NextResponse.next();
    }

    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const session = await verifyJwtEdge(token, JWT_SECRET);

    if (!session) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(loginUrl);
      // Clear invalid/expired cookie
      response.cookies.delete(COOKIE_NAME);
      return response;
    }
  }

  return NextResponse.next();
}

export async function middleware(request: NextRequest) {
  return proxy(request);
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
