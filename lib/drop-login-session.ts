"use client";

import { logout } from "@/lib/api/client";
import { env } from "@/lib/env";
import { wipeNonPlatformClient } from "@/lib/wipe-non-platform-storage";

function tenantCookieNames(): readonly string[] {
  return [env.academyIdCookie, env.academySlugCookie, env.academyNameCookie];
}

/**
 * Drop leftover HttpOnly cookies and person/staff storage. Platform
 * language/theme and this site's academy tenant cookies stay.
 */
export async function resetAnonymousAuthClient(): Promise<void> {
  wipeNonPlatformClient(tenantCookieNames());
  await logout().catch(() => undefined);
  const { logout: clearAppCookies } = await import("@/app/actions/auth");
  await clearAppCookies().catch(() => undefined);
  wipeNonPlatformClient(tenantCookieNames());
}
