import type { NextRequest, NextResponse } from 'next/server';
import { refreshSession, verifyJWT, withCookie } from '../proxy-helpers';

export type Session = {
  readonly isAuthenticated: boolean;
  /** Backend Set-Cookie headers from a refresh; authoritative over the request jwt. */
  readonly refreshedSetCookies: readonly string[];
  readonly dropRefreshCookie: boolean;
  /**
   * The refresh could not prove the session dead (network blip / backend 5xx).
   * The visitor must not be bounced to login over that, only over a rejection.
   */
  readonly refreshUnavailable: boolean;
};

const isIdClaim = (value: unknown) =>
  Boolean(value) && (typeof value === 'number' || typeof value === 'string');

async function hasValidAccessToken(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('jwt')?.value;
  if (!token) return false;
  const { valid, payload } = await verifyJWT(token);
  return Boolean(valid && payload && (isIdClaim(payload.profileId) || isIdClaim(payload.userId)));
}

/**
 * An expired access token with a live refresh token is renewed here, so the
 * visitor stays logged in for the full refresh-token lifetime (~7 days).
 */
export async function resolveSession(
  request: NextRequest,
  requestHeaders: Headers,
): Promise<Session> {
  const loggedOut = {
    refreshedSetCookies: [],
    dropRefreshCookie: false,
    refreshUnavailable: false,
  };
  if (await hasValidAccessToken(request)) return { isAuthenticated: true, ...loggedOut };

  const refreshed = await refreshSession(request);
  if (refreshed.status === 'refreshed') {
    // Server components read request cookies, so this render must see the new token.
    requestHeaders.set('cookie', withCookie(request.headers.get('cookie'), 'jwt', refreshed.jwt));
    return { ...loggedOut, isAuthenticated: true, refreshedSetCookies: refreshed.setCookies };
  }
  if (refreshed.status === 'invalid') {
    return {
      ...loggedOut,
      isAuthenticated: false,
      dropRefreshCookie: Boolean(request.cookies.get('refresh_token')?.value),
    };
  }
  return { ...loggedOut, isAuthenticated: false, refreshUnavailable: true };
}

/** Auth cookies are decided once and copied onto whichever response we return. */
export function applySessionCookies(response: NextResponse, session: Session) {
  for (const cookie of session.refreshedSetCookies) {
    response.headers.append('set-cookie', cookie);
  }
  if (session.dropRefreshCookie) {
    response.cookies.set('refresh_token', '', { path: '/', maxAge: 0 });
  }
}
