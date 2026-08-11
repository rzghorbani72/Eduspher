"use client";

import Image from "next/image";
import {
  BookOpenCheck,
  Bell,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  Home,
  LifeBuoy,
  Receipt,
  Repeat,
  UserRound,
  UserRoundCheck,
} from "lucide-react";

import Link from "@/components/ui/link";
import { useTranslation } from "@/lib/i18n/hooks";
import { cn } from "@/lib/utils";

interface AccountSidebarProps {
  displayName: string;
  contact?: string | null;
  avatarUrl?: string | null;
  roleLabel?: string | null;
  isVerified?: boolean;
  academyName?: string | null;
  /** Bare route after the academy-slug rewrite, e.g. "/account/profile". */
  currentPath: string;
  /** Academy-aware "/account" prefix; every nav href is built from it. */
  basePath: string;
}

const NAV_SECTIONS = [
  {
    titleKey: "account.navLearning",
    items: [
      { segment: "/courses", labelKey: "account.myCourses", icon: GraduationCap },
      { segment: "/progress", labelKey: "account.myProgress", icon: BookOpenCheck },
      { segment: "/assignments", labelKey: "account.myWork", icon: ClipboardList },
      { segment: "/results", labelKey: "account.results", icon: CheckCircle2 },
      { segment: "/classes", labelKey: "account.myClasses", icon: CalendarClock },
      { segment: "/tutoring", labelKey: "account.privateTutoring", icon: UserRoundCheck },
    ],
  },
  {
    titleKey: "account.navBilling",
    items: [
      { segment: "/transactions", labelKey: "account.transactions", icon: Receipt },
      { segment: "/subscriptions", labelKey: "account.subscriptions", icon: Repeat },
    ],
  },
  {
    titleKey: "account.navAccount",
    items: [
      { segment: "/profile", labelKey: "account.profile", icon: UserRound },
      { segment: "/notifications", labelKey: "notifications.title", icon: Bell },
      { segment: "/support", labelKey: "support.title", icon: LifeBuoy },
    ],
  },
] as const;

const initialsOf = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export function AccountSidebar({
  displayName,
  contact,
  avatarUrl,
  roleLabel,
  isVerified,
  academyName,
  currentPath,
  basePath,
}: AccountSidebarProps) {
  const { t } = useTranslation();
  const homePath = basePath.replace(/\/account$/, "") || "/";

  return (
    <aside className="flex w-full flex-col gap-4">
      <div className="flex flex-col items-center gap-3 rounded-xl border border-theme bg-card p-5 text-center">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={displayName}
            width={64}
            height={64}
            unoptimized
            className="h-16 w-16 rounded-full object-cover shadow-lg"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-(--theme-primary) text-2xl font-bold text-(--theme-on-primary) shadow-lg shadow-(--theme-primary)/30">
            {initialsOf(displayName)}
          </div>
        )}
        <div className="space-y-0.5">
          <p className="font-semibold text-(--theme-foreground)">{displayName}</p>
          {contact ? <p className="text-xs break-all text-muted">{contact}</p> : null}
          {academyName ? <p className="text-xs text-muted">{academyName}</p> : null}
          {roleLabel ? (
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                isVerified
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-surface text-muted",
              )}
            >
              {isVerified ? "✓ " : ""}
              {roleLabel}
            </span>
          ) : null}
        </div>
      </div>

      <nav className="flex flex-col gap-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.titleKey} className="flex flex-col gap-1">
            <p className="px-4 pb-1 text-xs font-semibold tracking-wide text-muted uppercase">
              {t(section.titleKey)}
            </p>
            {section.items.map((item) => {
              const Icon = item.icon;
              const href = `${basePath}${item.segment}`;
              const isActive = currentPath.startsWith(`/account${item.segment}`);
              return (
                <Link
                  key={item.segment}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-(--theme-primary)/10 font-semibold text-(--theme-primary)"
                      : "text-muted hover:bg-surface hover:text-foreground",
                  )}
                >
                  <Icon size={16} className="shrink-0" />
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <Link
        href={homePath}
        className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        <Home size={16} className="shrink-0" />
        {t("account.backToHome")}
      </Link>
    </aside>
  );
}
