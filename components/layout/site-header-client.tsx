"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";

import { CircleUser, Menu, X } from "lucide-react";

import { logout } from "@/app/actions/auth";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/components/providers/auth-provider";
import {
  useAcademyContext,
  useStorePath,
} from "@/components/providers/store-provider";
import { CartIcon } from "@/components/cart/cart-icon";
import { useTranslation } from "@/lib/i18n/hooks";

interface SiteHeaderClientProps {
  displayName: string | null;
  isAuthenticated: boolean;
}

export function SiteHeaderClient({
  displayName,
  isAuthenticated: initialAuth,
}: SiteHeaderClientProps) {
  const router = useRouter();
  const { isAuthenticated, setAuthenticated } = useAuthContext();
  const { name: storeName } = useAcademyContext();
  const buildPath = useStorePath();
  const { t } = useTranslation();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: "/", label: t("navigation.home") },
    { href: "/courses", label: t("navigation.courses") },
    { href: "/articles", label: t("navigation.articles") },
  ];

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
          setError(result.error || t("auth.unableToLogout"));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t("auth.unableToLogout"));
        router.push(buildPath("/"));
        router.refresh();
      }
    });
  };

  const authStatus = isAuthenticated ?? initialAuth;

  return (
    <header
      className="sticky top-0 z-50 w-full border-b backdrop-blur-md transition-all"
      style={{
        backgroundColor:
          "color-mix(in srgb, var(--theme-background) 88%, transparent)",
        borderColor:
          "color-mix(in srgb, var(--theme-foreground, #0f172a) 10%, transparent)",
      }}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <Link
          href={buildPath("/")}
          className="flex items-center gap-3 transition-opacity hover:opacity-80"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--theme-primary)] text-[var(--theme-on-primary)] shadow-lg shadow-[var(--theme-primary)]/30 transition-all hover:scale-105">
            <span className="text-lg font-semibold">ES</span>
          </div>
          <div>
            <p
              className="text-lg font-semibold"
              style={{ color: "var(--theme-foreground)" }}
            >
              {storeName}
            </p>
            <p
              className="text-xs opacity-50"
              style={{ color: "var(--theme-foreground)" }}
            >
              {t("common.tagline")}
            </p>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={buildPath(item.href)}
              className={cn(
                "text-sm font-medium transition-all hover:opacity-100",
              )}
              style={{
                color:
                  "color-mix(in srgb, var(--theme-foreground) 82%, var(--theme-background))",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          {authStatus ? (
            <Link
              href={buildPath("/account")}
              className="flex max-w-[min(100vw-8rem,14rem)] items-center gap-2 rounded-full border py-1 pl-1 pr-3 transition-all hover:opacity-[0.92] md:max-w-none"
              style={{
                borderColor: "var(--theme-border-strong)",
                backgroundColor: "var(--theme-card-bg)",
                color: "var(--theme-foreground)",
              }}
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                style={{
                  backgroundColor:
                    "color-mix(in srgb, var(--theme-primary) 22%, var(--theme-background))",
                  color: "var(--theme-primary)",
                }}
                aria-hidden
              >
                <CircleUser className="h-5 w-5" strokeWidth={2} />
              </span>
              <span
                className="truncate text-sm font-medium"
                style={{ color: "var(--theme-foreground)" }}
              >
                {displayName || t("account.myCourses")}
              </span>
            </Link>
          ) : (
            <Link
              href={buildPath("/auth/login")}
              className="hidden h-10 items-center rounded-full bg-[var(--theme-primary)] px-5 text-sm font-semibold text-[var(--theme-on-primary)] shadow-lg shadow-[var(--theme-primary)]/30 transition-all hover:scale-105 hover:bg-[var(--theme-primary)]/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-primary)] md:inline-flex"
            >
              {t("auth.login")} / {t("auth.register")}
            </Link>
          )}
          <CartIcon isAuthenticated={authStatus} />
        </div>
        <button
          type="button"
          onClick={toggleMobile}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors hover:bg-surface md:hidden"
          style={{
            borderColor: "var(--theme-border-strong)",
            color: "var(--theme-foreground)",
          }}
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>
      {mobileOpen ? (
        <div className="md:hidden">
          <div
            className="border-t px-6 py-4"
            style={{
              backgroundColor: "var(--theme-background)",
              borderColor:
                "color-mix(in srgb, var(--theme-foreground, #0f172a) 12%, transparent)",
            }}
          >
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={buildPath(item.href)}
                  onClick={closeMobile}
                  className="text-base font-medium transition-opacity hover:opacity-80"
                  style={{ color: "var(--theme-foreground)" }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-6 flex flex-col gap-3">
              {authStatus ? (
                <>
                  <Link
                    href={buildPath("/account")}
                    onClick={closeMobile}
                    className="flex items-center gap-3 rounded-full border px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
                    style={{
                      borderColor: "var(--theme-border-strong)",
                      backgroundColor: "var(--theme-card-bg)",
                      color: "var(--theme-foreground)",
                    }}
                  >
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                      style={{
                        backgroundColor:
                          "color-mix(in srgb, var(--theme-primary) 22%, var(--theme-background))",
                        color: "var(--theme-primary)",
                      }}
                    >
                      <CircleUser className="h-5 w-5" strokeWidth={2} />
                    </span>
                    {displayName || t("account.myCourses")}
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                    disabled={pending}
                  >
                    {pending ? t("common.loading") : t("auth.logout")}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href={buildPath("/auth/login")}
                    onClick={closeMobile}
                    className="rounded-full bg-[var(--theme-primary)] px-5 py-2.5 text-center text-sm font-semibold text-[var(--theme-on-primary)] shadow-lg shadow-[var(--theme-primary)]/30 transition-all hover:scale-105 hover:bg-[var(--theme-primary)]/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-primary)]"
                  >
                    {t("auth.login")} / {t("auth.register")}
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
}
