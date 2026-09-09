"use client";

/** Platform UI/config — not academy, staff, or person. */
export const PLATFORM_STORAGE_KEYS = [
  "preferred_language",
  "landing-theme",
  "academy-theme-mode",
] as const;

export const PLATFORM_COOKIE_NAMES = [
  "preferred_language",
  "gdpr_consent",
  "NEXT_LOCALE",
] as const;

export function isPlatformStorageKey(key: string): boolean {
  return (PLATFORM_STORAGE_KEYS as readonly string[]).includes(key);
}

export function isPlatformCookieName(
  name: string,
  tenantCookieNames: readonly string[],
): boolean {
  if ((PLATFORM_COOKIE_NAMES as readonly string[]).includes(name)) return true;
  return tenantCookieNames.includes(name);
}

export function wipeNonPlatformStorage(): void {
  if (typeof window === "undefined") return;
  for (const store of [window.localStorage, window.sessionStorage]) {
    try {
      for (const key of Object.keys(store)) {
        if (!isPlatformStorageKey(key)) store.removeItem(key);
      }
    } catch {
      // Storage can be blocked (private mode).
    }
  }
}

export function expireNonPlatformCookies(
  tenantCookieNames: readonly string[],
): void {
  if (typeof document === "undefined") return;
  const names = document.cookie
    .split(";")
    .map((part) => part.split("=")[0]?.trim())
    .filter((name): name is string => Boolean(name));
  for (const name of names) {
    if (isPlatformCookieName(name, tenantCookieNames)) continue;
    document.cookie = `${name}=; Max-Age=0; path=/`;
  }
}

export function wipeNonPlatformClient(
  tenantCookieNames: readonly string[],
): void {
  wipeNonPlatformStorage();
  expireNonPlatformCookies(tenantCookieNames);
}
