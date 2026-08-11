"use client";

import { usePathname } from "next/navigation";

interface MainContainerProps {
  /** Server-known, path-independent full-width cases (platform root, sample preview). */
  fullWidth: boolean;
  /** Browser paths that render the academy home template (full-bleed). */
  homePaths: readonly string[];
  children: React.ReactNode;
}

const normalize = (path: string) => path.replace(/\/+$/, "") || "/";

// The root layout is NOT re-rendered on client-side navigation, so a width
// decision made from request headers there goes stale and the next page renders
// in the previous page's container. Deciding from usePathname keeps every soft
// navigation as wide as a full page load.
export function MainContainer({ fullWidth, homePaths, children }: MainContainerProps) {
  const pathname = normalize(usePathname());
  const isFullBleed =
    fullWidth ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/preview") ||
    homePaths.includes(pathname);

  if (isFullBleed) return <>{children}</>;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      {children}
    </div>
  );
}
