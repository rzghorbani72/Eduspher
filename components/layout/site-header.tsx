"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";

import { Menu, X } from "lucide-react";

import { logout, checkAuth, getUserDisplayName } from "@/app/actions/auth";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/components/providers/auth-provider";
import { useSchoolContext, useSchoolPath } from "@/components/providers/school-provider";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/articles", label: "Articles" },
  { href: "/about", label: "About" },
];

export const SiteHeader = () => {
  const router = useRouter();
  const { isAuthenticated, setAuthenticated } = useAuthContext();
  const { name: schoolName } = useSchoolContext();
  const buildPath = useSchoolPath();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);

  // Check authentication status on mount using server action (checks SSR cookies)
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const { isAuthenticated } = await checkAuth();
        setAuthenticated(isAuthenticated);
        
        // If authenticated, fetch display name
        if (isAuthenticated) {
          try {
            const { displayName } = await getUserDisplayName();
            setDisplayName(displayName);
          } catch {
            // If fetching display name fails, just continue without it
          }
        }
      } catch {
        // If check fails, assume not authenticated
        setAuthenticated(false);
      }
    };

    verifyAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const toggleMobile = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const handleLogout = () => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await logout();
        if (result.success) {
          setAuthenticated(false);
          closeMobile();
          router.push(buildPath("/"));
          router.refresh();
        } else {
          setError(result.error || "Unable to logout");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to logout");
        // Fallback redirect if server action fails
        router.push(buildPath("/"));
        router.refresh();
      }
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/90 backdrop-blur-md transition-all dark:border-slate-800/80 dark:bg-slate-950/80">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <Link href={buildPath("/")} className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--theme-primary)] text-white shadow-lg shadow-[var(--theme-primary)]/30 transition-all hover:scale-105">
            <span className="text-lg font-semibold">ES</span>
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">{schoolName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Learn without limits</p>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={buildPath(item.href)}
              className={cn(
                "text-sm font-medium text-slate-600 transition-all hover:text-[var(--theme-primary)] dark:text-slate-300 dark:hover:text-[var(--theme-primary)]"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                href={buildPath("/account")}
                className="hidden text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-200 dark:hover:text-white md:block"
              >
                {displayName || "My Learning"}
              </Link>
              <Button
                variant="outline"
                size="sm"
                loading={pending}
                onClick={handleLogout}
                className="hidden md:inline-flex"
              >
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link
                href={buildPath("/auth/login")}
                className="hidden h-10 items-center rounded-full bg-[var(--theme-primary)] px-5 text-sm font-semibold text-white shadow-lg shadow-[var(--theme-primary)]/30 transition-all hover:scale-105 hover:bg-[var(--theme-primary)]/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-primary)] md:inline-flex"
              >
                Login / Sign up
              </Link>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={toggleMobile}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900 md:hidden"
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {mobileOpen ? (
        <div className="md:hidden">
          <div className="border-t border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-950">
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobile}
                  className="text-base font-medium text-slate-700 transition hover:text-slate-900 dark:text-slate-200 dark:hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-6 flex flex-col gap-3">
              {isAuthenticated ? (
                <>
                  <Link
                    href={buildPath("/account")}
                    onClick={closeMobile}
                    className="rounded-full border border-slate-200 px-5 py-2.5 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900"
                  >
                    {displayName || "My Learning"}
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                    disabled={pending}
                  >
                    {pending ? "Logging out..." : "Log out"}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href={buildPath("/auth/login")}
                    onClick={closeMobile}
                    className="rounded-full bg-[var(--theme-primary)] px-5 py-2.5 text-center text-sm font-semibold text-white shadow-lg shadow-[var(--theme-primary)]/30 transition-all hover:scale-105 hover:bg-[var(--theme-primary)]/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-primary)]"
                  >
                    Login / Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
      {error ? (
        <div className="border-t border-amber-200 bg-amber-50 px-6 py-2 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200">
          {error}
        </div>
      ) : null}
    </header>
  );
};

