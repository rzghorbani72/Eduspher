import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function getAdminFrameAncestors(): string {
  const adminUrl =
    process.env.NEXT_PUBLIC_ADMIN_PANEL_URL ||
    process.env.ADMIN_PANEL_URL ||
    'http://localhost:4000';
  try {
    return new URL(adminUrl).origin;
  } catch {
    return 'http://localhost:4000';
  }
}

export function middleware(request: NextRequest) {
  const preview = request.nextUrl.searchParams.get('preview');
  const embed = request.nextUrl.searchParams.get('embed') === '1';
  const requestHeaders = new Headers(request.headers);

  if (preview) {
    requestHeaders.set('x-preview-token', preview);
  }
  if (embed) {
    requestHeaders.set('x-embed-mode', '1');
  }

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  if (preview) {
    response.cookies.set('preview_token', preview, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 15,
      path: '/',
    });
  }

  const adminOrigin = getAdminFrameAncestors();
  const frameAncestors = embed
    ? `'self' ${adminOrigin}`
    : "'self'";

  response.headers.set(
    'Content-Security-Policy',
    `frame-ancestors ${frameAncestors}`
  );

  if (embed) {
    response.cookies.set('embed_mode', '1', {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60,
      path: '/',
    });
  }

  return response;
}

export const config = {
  matcher: ['/s/:path*', '/'],
};
