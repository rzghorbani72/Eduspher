"use client";

import Link from "@/components/ui/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Calendar, History, Receipt, Settings, Home, LifeBuoy } from "lucide-react";
import { useTranslation } from "@/lib/i18n/hooks";
import { useStorePath } from "@/components/providers/store-provider";
import { cn } from "@/lib/utils";

interface AccountSidebarProps {
  displayName: string;
  email?: string | null;
  isVerified?: boolean;
  role?: string;
}

export function AccountSidebar({ displayName, email, isVerified, role }: AccountSidebarProps) {
  const { t } = useTranslation();
  const buildPath = useStorePath();
  const pathname = usePathname();

  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const navItems = [
    { href: buildPath("/account"), label: t("account.myCourses") || "دوره‌های من", icon: GraduationCap, key: "courses" },
    { href: buildPath("/account?tab=classes"), label: t("account.myClasses") || "کلاس‌های من", icon: Calendar, key: "classes" },
    { href: buildPath("/account?tab=history"), label: t("account.pastSessions") || "جلسات گذشته", icon: History, key: "history" },
    { href: buildPath("/account?tab=transactions"), label: t("account.transactions") || "تراکنش‌ها", icon: Receipt, key: "transactions" },
    { href: buildPath("/account?tab=settings"), label: t("account.settings") || "تنظیمات", icon: Settings, key: "settings" },
    { href: buildPath("/account/support"), label: t("support.title"), icon: LifeBuoy, key: "support" },
  ];

  return (
    <aside className="flex flex-col gap-4 w-full">
      {/* Avatar & info */}
      <div className="flex flex-col items-center gap-3 rounded-xl border border-theme bg-card p-5 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--theme-primary)] text-2xl font-bold text-[var(--theme-on-primary)] shadow-lg shadow-[var(--theme-primary)]/30">
          {initials}
        </div>
        <div className="space-y-0.5">
          <p className="font-semibold text-[var(--theme-foreground)]">{displayName}</p>
          {email && <p className="text-xs text-muted break-all">{email}</p>}
          {role && (
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                isVerified
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-surface text-muted"
              )}
            >
              {isVerified ? "✓ " : ""}{role}
            </span>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.key === "courses"
              ? pathname === buildPath("/account") || pathname.endsWith("/account")
              : pathname.includes(`tab=${item.key}`);

          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] font-semibold"
                  : "text-muted hover:bg-surface hover:text-foreground"
              )}
            >
              <Icon size={16} className="shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Back to home */}
      <Link
        href={buildPath("/")}
        className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm text-muted hover:text-foreground transition-colors"
      >
        <Home size={16} className="shrink-0" />
        {t("account.backToHome") || "← بازگشت به خانه"}
      </Link>
    </aside>
  );
}
