import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'admin_session';
const JWT_SECRET = process.env.JWT_SECRET || 'mehak-sanitary-jwt-secret-fallback-key-2026';

/**
 * Edge-compatible JWT verification helper using Web Crypto API.
 * Validates HMAC-SHA256 signature and expiration without external Node modules.
 */
async function verifyAdminSessionEdge(token: string): Promise<boolean> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const [encodedHeader, encodedPayload, signatureBase64Url] = parts;
    const dataToSign = `${encodedHeader}.${encodedPayload}`;

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    let base64Sig = signatureBase64Url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64Sig.length % 4) {
      base64Sig += '=';
    }

    const sigBinary = atob(base64Sig);
    const sigBuf = new Uint8Array(sigBinary.length);
    for (let i = 0; i < sigBinary.length; i++) {
      sigBuf[i] = sigBinary.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify('HMAC', key, sigBuf, enc.encode(dataToSign));
    if (!isValid) return false;

    let base64Payload = encodedPayload.replace(/-/g, '+').replace(/_/g, '/');
    while (base64Payload.length % 4) {
      base64Payload += '=';
    }
    const payload = JSON.parse(atob(base64Payload));

    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      return false; // Token expired
    }

    return true;
  } catch {
    return false;
  }
}

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
      return NextResponse.redirect(loginUrl);
    }

    const isValid = await verifyAdminSessionEdge(token);
    if (!isValid) {
      const loginUrl = new URL('/admin/login', request.url);
      const response = NextResponse.redirect(loginUrl);
      // Clear invalid/expired cookie
      response.cookies.set(COOKIE_NAME, '', { maxAge: 0, path: '/' });
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
