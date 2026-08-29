"use client";

import { logout as logoutRequest } from "@/lib/api/client";
import { logout as logoutAction } from "@/app/actions/auth";

/** UI preferences are not user data, so they survive sign-out. */
const KEEP_KEYS = ["preferred_language", "landing-theme", "academy-theme-mode"];

function wipeBrowserStorage(): void {
  for (const store of [window.localStorage, window.sessionStorage]) {
    try {
      for (const key of Object.keys(store)) {
        if (!KEEP_KEYS.includes(key)) store.removeItem(key);
      }
    } catch {
      // Storage can be blocked (private mode); the redirect below still applies.
    }
  }
}

/**
 * The one way to sign out. The browser call is what revokes the refresh token
 * and expires the auth cookies — a server action cannot, because it sends none
 * of the browser's cookies. The redirect is a full page load so the Next router
 * cache, which holds pages prefetched for the signed-in user, is dropped too.
 */
export async function signOut(redirectTo: string): Promise<void> {
  await logoutRequest().catch(() => undefined);
  await logoutAction().catch(() => undefined);

  if (typeof window === "undefined") return;

  wipeBrowserStorage();
  window.location.replace(redirectTo);
}
