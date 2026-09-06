// Edge-compatible JWT verification using standard Web Crypto API (crypto.subtle)
// Works seamlessly in Next.js Middleware, V8 isolates, Edge Runtime, and Node.js

export interface EdgeAdminPayload {
  id: string;
  email: string;
  exp?: number;
  iat?: number;
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return atob(base64);
}

function base64UrlToUint8Array(str: string): Uint8Array {
  const decoded = base64UrlDecode(str);
  const result = new Uint8Array(decoded.length);
  for (let i = 0; i < decoded.length; i++) {
    result[i] = decoded.charCodeAt(i);
  }
  return result;
}

export async function verifyJwtEdge(
  token: string,
  secret: string
): Promise<EdgeAdminPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;

    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signature = base64UrlToUint8Array(signatureB64);
    const data = encoder.encode(`${headerB64}.${payloadB64}`);

    const isValid = await crypto.subtle.verify(
      'HMAC',
      cryptoKey,
      signature.buffer as ArrayBuffer,
      data.buffer as ArrayBuffer
    );
    if (!isValid) return null;

    const payloadJson = base64UrlDecode(payloadB64);
    const payload = JSON.parse(payloadJson) as EdgeAdminPayload;

    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}
