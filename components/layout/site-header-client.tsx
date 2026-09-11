"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import { Menu, X } from "lucide-react";

import Link from "@/components/ui/link";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/components/providers/auth-provider";
import {
  useAcademyContext,
  useStorePath,
} from "@/components/providers/store-provider";
import { AccountMenuDropdown } from "@/components/layout/account-menu-dropdown";
import { NotificationBell } from "@/components/layout/notification-bell";
import { ThemeToggle } from "@/components/theme/theme-toggle-button";
import { useTranslation } from "@/lib/i18n/hooks";
import { getAdminPanelUrl } from "@/lib/admin-panel-url";
import { slugFromPathname } from "@/lib/academy-path";

interface SiteHeaderClientProps {
  displayName: string | null;
  avatarUrl: string | null;
  isAuthenticated: boolean;
  isPanelRoot: boolean;
  requestHost: string | null;
}

export function SiteHeaderClient({
  displayName,
  avatarUrl,
  isAuthenticated: initialAuth,
  isPanelRoot,
  requestHost,
}: SiteHeaderClientProps) {
  const { isAuthenticated } = useAuthContext();
  const { name: storeName, slug: storeSlug } = useAcademyContext();
  const pathname = usePathname();
  const pathSlug = slugFromPathname(pathname);
  const onAcademySite = Boolean(pathSlug ?? storeSlug);
  const buildPath = useStorePath();
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const adminLoginUrl = getAdminPanelUrl("/login", requestHost);

  const showPanelNav = isPanelRoot && !onAcademySite;

  const navItems = useMemo(
    () =>
      showPanelNav
        ? [{ href: "/pricing", label: t("footer.pricing") }]
        : [
            { href: "/", label: t("navigation.home") },
            { href: "/courses", label: t("navigation.courses") },
            { href: "/bundles", label: t("navigation.bundles") },
            { href: "/roadmap", label: t("navigation.roadmap") },
            { href: "/about", label: t("navigation.aboutAcademy") },
          ],
    [showPanelNav, t],
  );

  const toggleMobile = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const authStatus = isAuthenticated ?? initialAuth;
  const accountLabel = displayName || t("account.profile");

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
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <span
            className="text-xl font-black"
            style={{ color: "var(--theme-foreground)" }}
          >
            {storeName}
          </span>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--theme-primary) text-(--theme-on-primary) shadow-lg shadow-(--theme-primary)/30 transition-transform hover:scale-105">
            <span className="text-base font-black">
              {storeName?.charAt(0) || "A"}
            </span>
          </span>
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
          <ThemeToggle className="flex h-10 w-10 items-center justify-center rounded-full border border-(--theme-border-color) text-(--theme-foreground) transition-colors hover:bg-(--theme-surface)" />
          {showPanelNav ? (
            <a
              href={adminLoginUrl}
              className="hidden h-10 items-center rounded-full border px-5 text-sm font-semibold transition-all hover:opacity-90 md:inline-flex"
              style={{
                borderColor: "var(--theme-border-strong)",
                color: "var(--theme-foreground)",
              }}
            >
              {t("panel.managerLogin")}
            </a>
          ) : authStatus ? (
            <AccountMenuDropdown
              displayName={accountLabel}
              avatarUrl={avatarUrl}
              className="hidden sm:block"
            />
          ) : (
            <Link
              href={buildPath("/auth/login")}
              className="hidden h-10 items-center rounded-full bg-[var(--theme-primary)] px-5 text-sm font-semibold text-[var(--theme-on-primary)] shadow-lg shadow-[var(--theme-primary)]/30 transition-all hover:scale-105 hover:bg-[var(--theme-primary)]/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-primary)] md:inline-flex"
            >
              {t("auth.login")} / {t("auth.register")}
            </Link>
          )}
          {!showPanelNav ? (
            <NotificationBell isAuthenticated={authStatus} />
          ) : null}
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
              {showPanelNav ? (
                <a
                  href={adminLoginUrl}
                  onClick={closeMobile}
                  className="inline-flex w-full items-center justify-center rounded-full border px-5 py-2.5 text-sm font-semibold"
                  style={{
                    borderColor: "var(--theme-border-strong)",
                    color: "var(--theme-foreground)",
                  }}
                >
                  {t("panel.managerLogin")}
                </a>
              ) : authStatus ? (
                <AccountMenuDropdown
                  displayName={accountLabel}
                  avatarUrl={avatarUrl}
                  inline
                />
              ) : (
                <Link
                  href={buildPath("/auth/login")}
                  onClick={closeMobile}
                  className="rounded-full bg-[var(--theme-primary)] px-5 py-2.5 text-center text-sm font-semibold text-[var(--theme-on-primary)] shadow-lg shadow-[var(--theme-primary)]/30 transition-all hover:scale-105 hover:bg-[var(--theme-primary)]/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-primary)]"
                >
                  {t("auth.login")} / {t("auth.register")}
                </Link>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
