"use client";

import { useTransition } from "react";

import { AppImage } from "@/components/ui/app-image";
import {
  Award,
  BadgeCheck,
  BookOpenCheck,
  Bell,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  Home,
  LifeBuoy,
  LogOut,
  Receipt,
  Repeat,
  UserRound,
  UserRoundCheck,
} from "lucide-react";

import Link from "@/components/ui/link";
import { useLocaleFormat } from "@/hooks/use-locale-digits";
import { roleLabel } from "@/lib/account-labels";
import { useTranslation } from "@/lib/i18n/hooks";
import { signOut } from "@/lib/sign-out";
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
      {
        segment: "/courses",
        labelKey: "account.myCourses",
        icon: GraduationCap,
      },
      {
        segment: "/progress",
        labelKey: "account.myProgress",
        icon: BookOpenCheck,
      },
      {
        segment: "/assignments",
        labelKey: "account.myWork",
        icon: ClipboardList,
      },
      { segment: "/results", labelKey: "account.results", icon: CheckCircle2 },
      {
        segment: "/certificates",
        labelKey: "account.certificates",
        icon: Award,
      },
      {
        segment: "/classes",
        labelKey: "account.myClasses",
        icon: CalendarClock,
      },
      {
        segment: "/tutoring",
        labelKey: "account.privateTutoring",
        icon: UserRoundCheck,
      },
    ],
  },
  {
    titleKey: "account.navBilling",
    items: [
      {
        segment: "/transactions",
        labelKey: "account.transactions",
        icon: Receipt,
      },
      {
        segment: "/subscriptions",
        labelKey: "account.subscriptions",
        icon: Repeat,
      },
    ],
  },
  {
    titleKey: "account.navAccount",
    items: [
      { segment: "/profile", labelKey: "account.profile", icon: UserRound },
      {
        segment: "/notifications",
        labelKey: "notifications.title",
        icon: Bell,
      },
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
  roleLabel: rawRole,
  isVerified,
  academyName,
  currentPath,
  basePath,
}: AccountSidebarProps) {
  const { t } = useTranslation();
  const format = useLocaleFormat();
  const homePath = basePath.replace(/\/account$/, "") || "/";
  const role = roleLabel(rawRole, t);
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await signOut(homePath);
    });
  };

  return (
    <aside className="flex w-full flex-col gap-4 lg:sticky lg:top-24">
      <div className="flex items-center gap-3 rounded-xl border border-theme bg-card p-4 text-start lg:flex-col lg:p-5 lg:text-center">
        {avatarUrl ? (
          <AppImage
            src={avatarUrl}
            alt={displayName}
            preset="avatar"
            width={64}
            height={64}
            sizes="64px"
            className="h-12 w-12 shrink-0 rounded-full object-cover shadow-lg lg:h-16 lg:w-16"
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-(--theme-primary) text-xl font-bold text-(--theme-on-primary) shadow-lg shadow-(--theme-primary)/30 lg:h-16 lg:w-16 lg:text-2xl">
            {initialsOf(displayName)}
          </div>
        )}
        <div className="flex min-w-0 flex-col gap-1 lg:items-center lg:gap-1.5">
          <p className="font-semibold text-(--theme-foreground)">
            {displayName}
          </p>
          {contact ? (
            <p className="text-xs break-all text-muted" dir="ltr">
              {format.digits(contact)}
            </p>
          ) : null}
          {academyName ? (
            <p className="hidden text-xs text-muted lg:block">{academyName}</p>
          ) : null}
          {role ? (
            <span className="inline-flex w-fit items-center gap-1 rounded-full lg:mt-1 bg-(--theme-primary)/15 px-2.5 py-1 text-xs font-semibold text-(--theme-primary-ink)">
              {isVerified ? (
                <BadgeCheck
                  className="size-3.5 shrink-0"
                  aria-label={t("account.verified")}
                />
              ) : null}
              {role}
            </span>
          ) : null}
        </div>
      </div>

      <nav className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:gap-4 lg:overflow-visible lg:px-0 lg:pb-0">
        {NAV_SECTIONS.map((section) => (
          <div
            key={section.titleKey}
            className="flex shrink-0 gap-2 lg:flex-col lg:gap-1"
          >
            <p className="hidden px-4 pb-1 text-xs font-semibold text-muted lg:block">
              {t(section.titleKey)}
            </p>
            <div className="flex gap-2 lg:flex-col lg:gap-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const href = `${basePath}${item.segment}`;
                const isActive = currentPath.startsWith(
                  `/account${item.segment}`,
                );
                return (
                  <Link
                    key={item.segment}
                    href={href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex shrink-0 items-center gap-2 rounded-full border border-theme px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors lg:gap-3 lg:rounded-lg lg:border-0 lg:px-4 lg:py-2.5",
                      isActive
                        ? "border-transparent bg-(--theme-primary) font-semibold text-(--theme-on-primary) shadow-sm shadow-(--theme-primary)/30"
                        : "text-muted hover:bg-surface hover:text-foreground",
                    )}
                  >
                    <Icon size={16} className="shrink-0" />
                    <span className="truncate">{t(item.labelKey)}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <Link
        href={homePath}
        className="hidden items-center gap-2 rounded-lg px-4 py-2.5 text-sm text-muted transition-colors hover:text-foreground lg:flex"
      >
        <Home size={16} className="shrink-0" />
        {t("account.backToHome")}
      </Link>

      <button
        type="button"
        onClick={handleLogout}
        disabled={isPending}
        className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60 lg:gap-3"
      >
        <LogOut size={16} className="shrink-0" />
        {isPending ? t("common.loading") : t("auth.logout")}
      </button>
    </aside>
  );
}
