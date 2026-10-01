import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { jwtVerify, decodeJwt, type JWTPayload } from 'jose';
import { logger } from '@/lib/logging/app-logger';

export let jwtSecretWarningLogged = false;

export function getAdminFrameAncestors(): string {
  const origins = new Set<string>(["'self'"]);
  const candidates = [
    process.env.NEXT_PUBLIC_ADMIN_PANEL_URL,
    process.env.ADMIN_PANEL_URL,
    'http://localhost:4000',
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      origins.add(new URL(candidate).origin);
    } catch {
      // ignore invalid URL values
    }
  }

  if (process.env.NODE_ENV === 'development') {
    for (const origin of [
      'http://localhost:4000',
      'http://127.0.0.1:4000',
      'http://0.0.0.0:4000',
    ]) {
      origins.add(origin);
    }
  }

  return Array.from(origins).join(' ');
}

/** Apex marketing site may iframe published academy homes (samples section). */
export function getMarketingFrameAncestors(): string {
  const origins = new Set<string>(["'self'"]);
  for (const candidate of [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXT_PUBLIC_IR_DOMAIN,
    process.env.NEXT_PUBLIC_COM_DOMAIN,
    'http://localhost:5000',
    'http://127.0.0.1:5000',
  ]) {
    if (!candidate) continue;
    try {
      origins.add(new URL(candidate).origin);
    } catch {
      // ignore invalid URL values
    }
  }
  return Array.from(origins).join(' ');
}

export function shouldApplyPreviewEmbed(request: NextRequest, isAcademyHome: boolean): boolean {
  const { pathname, searchParams } = request.nextUrl;
  if (searchParams.has('preview') || searchParams.get('embed') === '1') {
    return true;
  }
  return pathname === '/' || isAcademyHome;
}

export function applyPreviewEmbedRequest(
  request: NextRequest,
  requestHeaders: Headers,
): { preview: string | null; embed: boolean } {
  const preview = request.nextUrl.searchParams.get('preview');
  const embed = request.nextUrl.searchParams.get('embed') === '1';
  const sample = request.nextUrl.searchParams.get('sample') === '1';

  if (preview) {
    requestHeaders.set('x-preview-token', preview);
  }
  if (embed) {
    requestHeaders.set('x-embed-mode', '1');
  }
  if (sample) {
    requestHeaders.set('x-preview-sample', '1');
  }

  return { preview, embed };
}

export function applyFrameAncestors(
  response: NextResponse,
  opts: { embed: boolean; allowMarketing: boolean },
): void {
  const frameAncestors = opts.embed
    ? getAdminFrameAncestors()
    : opts.allowMarketing
      ? getMarketingFrameAncestors()
      : "'none'";
  response.headers.set('Content-Security-Policy', `frame-ancestors ${frameAncestors}`);
}

export function applyPreviewEmbedResponse(
  response: NextResponse,
  preview: string | null,
  embed: boolean,
  allowMarketing: boolean,
): void {
  if (preview) {
    response.cookies.set('preview_token', preview, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 15,
      path: '/',
    });
  }
  if (embed) {
    response.cookies.set('embed_mode', '1', {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60,
      path: '/',
    });
  }

  applyFrameAncestors(response, { embed, allowMarketing });
}

/**
 * Verify JWT token signature and decode payload
 * Uses jose library for secure JWT verification in Edge runtime
 */
export async function verifyJWT(
  token: string,
): Promise<{ valid: boolean; payload: JWTPayload | null }> {
  try {
    const secret = process.env.JWT_SECRET;

    // In development or if no secret, fall back to decode-only with expiry check
    if (!secret) {
      if (process.env.NODE_ENV === 'development' && !jwtSecretWarningLogged) {
        jwtSecretWarningLogged = true;
        logger.warn('Auth', 'JwtSecretMissing');
      }
      const payload = decodeJwt(token);
      // At minimum, check expiration
      const isExpired =
        payload.exp && typeof payload.exp === 'number' && payload.exp < Date.now() / 1000;
      if (isExpired) {
        return { valid: false, payload: null };
      }
      return { valid: true, payload };
    }

    // Verify the token signature using the secret
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ['HS256'],
    });

    return { valid: true, payload };
  } catch {
    // Token verification failed (invalid signature, expired, malformed)
    return { valid: false, payload: null };
  }
}
