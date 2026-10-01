'use server';

import { cookies } from 'next/headers';
import { decodeJwt } from 'jose';
import { backendApiBaseUrl } from '@/lib/env';
import { logger } from '@/lib/logging/app-logger';
import { errorFields } from '@/lib/logging/error-fields';

/**
 * Check authentication status from SSR cookies
 * This avoids API calls and reduces server load
 */
export async function checkAuth(): Promise<{ isAuthenticated: boolean }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('jwt')?.value;

    if (!token) {
      return { isAuthenticated: false };
    }

    try {
      // Validate the JWT token by decoding it
      const payload = decodeJwt(token);
      // Check if token has required fields (profileId or userId) and is not expired
      const hasProfileId =
        payload.profileId &&
        (typeof payload.profileId === 'number' || typeof payload.profileId === 'string');
      const hasUserId =
        payload.userId &&
        (typeof payload.userId === 'number' || typeof payload.userId === 'string');
      const hasValidId = hasProfileId || hasUserId;
      const isExpired =
        payload.exp && typeof payload.exp === 'number' && payload.exp < Date.now() / 1000;

      if (hasValidId && !isExpired) {
        return { isAuthenticated: true };
      }
    } catch {
      // Token is invalid or expired
      return { isAuthenticated: false };
    }

    return { isAuthenticated: false };
  } catch {
    return { isAuthenticated: false };
  }
}

/**
 * Name + avatar for the site header. Session JWT is the auth truth — `/auth/me`
 * can 403 (e.g. pending legal consent) while the student is still signed in.
 * Fall back to `/profiles/:id` so the chip still shows their name.
 */
export async function getHeaderUser(): Promise<{
  displayName: string | null;
  avatarUrl: string | null;
}> {
  try {
    const { getSession } = await import('@/lib/auth/session');
    const session = await getSession();
    if (!session?.userId) {
      return { displayName: null, avatarUrl: null };
    }

    const { resolveAssetUrl } = await import('@/lib/utils');

    try {
      const { getCurrentUser } = await import('@/lib/api/server');
      const user = await getCurrentUser();
      if (user) {
        return {
          displayName: user.display_name || null,
          avatarUrl: resolveAssetUrl(user.avatar?.url),
        };
      }
    } catch {
      // Session stays valid when /auth/me is blocked (legal consent, etc.).
    }

    if (session.profileId) {
      const { getProfile } = await import('@/lib/api/account-server');
      const profile = await getProfile(String(session.profileId));
      return {
        displayName: profile?.display_name || null,
        avatarUrl: resolveAssetUrl(profile?.avatar?.url),
      };
    }

    return { displayName: null, avatarUrl: null };
  } catch {
    return { displayName: null, avatarUrl: null };
  }
}

const AUTH_COOKIES = ['jwt', 'refresh_token', 'csrf-token'];

/**
 * Server-side half of sign-out: it deletes the auth cookies this app owns and
 * asks the backend to revoke the refresh token. Cookies must be forwarded by
 * hand — a server fetch sends none of the browser's cookies on its own, so
 * `credentials: 'include'` here would be a no-op.
 */
export async function logout(): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join('; ');

    if (cookieStore.get('jwt') ?? cookieStore.get('refresh_token')) {
      try {
        await fetch(`${backendApiBaseUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Cookie: cookieHeader,
            'x-csrf-token': cookieStore.get('csrf-token')?.value ?? '',
          },
          cache: 'no-store',
          signal: AbortSignal.timeout(3000),
        });
      } catch (error) {
        // Cookie deletion below is the source of truth — backend call is best-effort
        logger.warn('Auth', 'BackendLogoutFailed', errorFields(error));
      }
    }

    for (const name of AUTH_COOKIES) cookieStore.delete(name);

    return { success: true };
  } catch (error) {
    logger.error('Auth', 'LogoutFailed', errorFields(error));
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Logout failed',
    };
  }
}
