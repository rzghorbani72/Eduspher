'use client';

import { logout as logoutRequest } from '@/lib/api/client';
import { logout as logoutAction } from '@/app/actions/auth';
import { env } from '@/lib/env';
import { wipeNonPlatformClient } from '@/lib/wipe-non-platform-storage';

/**
 * The one way to sign out. The browser call is what revokes the refresh token
 * and expires the auth cookies — a server action cannot, because it sends none
 * of the browser's cookies. The redirect is a full page load so the Next router
 * cache, which holds pages prefetched for the signed-in user, is dropped too.
 */
export async function signOut(redirectTo: string): Promise<void> {
  await logoutRequest().catch(() => undefined);
  await logoutAction().catch(() => undefined);

  if (typeof window === 'undefined') return;

  wipeNonPlatformClient([env.academyIdCookie, env.academySlugCookie, env.academyNameCookie]);
  window.location.replace(redirectTo);
}
