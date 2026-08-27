import type { Metadata } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AccountSidebar } from "@/components/account/account-sidebar";
import { getProfile } from "@/lib/api/account-server";
import { getAcademyBySlug, getCurrentAcademy, getCurrentUser } from "@/lib/api/server";
import { getSession } from "@/lib/auth/session";
import { NOINDEX_ROBOTS } from "@/lib/seo/crawl-policy";
import { getAcademyContext } from "@/lib/store-context";
import { buildAcademyPath } from "@/lib/utils";

export const metadata: Metadata = {
  robots: NOINDEX_ROBOTS,
};

/**
 * The single auth boundary for every /account route.
 *
 * `proxy.ts` already blocks unauthenticated requests at the edge, but the JWT it
 * checks can expire between the edge check and the render, so the guard is
 * repeated here. Both send the visitor to login carrying `?redirect=`, so they
 * land back on the page they asked for.
 */
export default async function AccountLayout({ children }: { children: ReactNode }) {
  const academyContext = await getAcademyContext();
  const slugForPaths = academyContext.isSubdomain ? null : academyContext.slug;
  const buildPath = (path: string) => buildAcademyPath(slugForPaths, path);

  // proxy.ts sets x-url-pathname to the path *after* the academy-slug rewrite,
  // so it is always the bare route ("/account/profile"). Re-adding the slug
  // gives the browser-visible URL, which is what login must return us to.
  const headerStore = await headers();
  const currentPath = headerStore.get("x-url-pathname") ?? "/account";
  const returnTo = buildPath(currentPath);

  const session = await getSession();
  if (!session?.profileId) {
    redirect(`${buildPath("/auth/login")}?redirect=${encodeURIComponent(returnTo)}`);
  }

  // A failing /auth/me does NOT mean "signed out" — pending legal consent 403s
  // it too. Redirecting on that would ping-pong: this layout sends you to login,
  // and the edge sends an authenticated visitor straight back out again.
  const [user, profile, academy] = await Promise.all([
    getCurrentUser().catch(() => null),
    getProfile(String(session.profileId)),
    getCurrentAcademy()
      .catch(() => null)
      .then((found) =>
        found ?? (academyContext.slug ? getAcademyBySlug(academyContext.slug).catch(() => null) : null),
      ),
  ]);

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
        <div className="w-full lg:w-64 lg:shrink-0">
          <AccountSidebar
            displayName={profile?.display_name || user?.display_name || ""}
            contact={user?.email ?? user?.phone_number}
            avatarUrl={profile?.avatar?.url ?? null}
            roleLabel={profile?.role_label ?? user?.role}
            isVerified={Boolean(user?.email_confirmed || user?.phone_confirmed)}
            academyName={academy?.name ?? academyContext.name}
            currentPath={currentPath}
            basePath={buildPath("/account")}
          />
        </div>
        <div className="min-w-0 flex-1 space-y-6">{children}</div>
      </div>
    </div>
  );
}
