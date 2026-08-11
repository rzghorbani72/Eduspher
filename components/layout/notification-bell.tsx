"use client";

import useSWR from "swr";
import { Bell } from "lucide-react";

import Link from "@/components/ui/link";
import { useStorePath } from "@/components/providers/store-provider";
import { getUnreadNotificationCount } from "@/lib/api/client";
import { useTranslation } from "@/lib/i18n/hooks";

/** Polls at a minute — notifications are not time-critical enough to stream. */
const REFRESH_MS = 60_000;

export function NotificationBell({ isAuthenticated }: { isAuthenticated: boolean }) {
  const { t } = useTranslation();
  const buildPath = useStorePath();

  const { data } = useSWR(
    isAuthenticated ? "notifications-unread-count" : null,
    async () => (await getUnreadNotificationCount())?.data?.count ?? 0,
    { refreshInterval: REFRESH_MS, revalidateOnFocus: true },
  );

  if (!isAuthenticated) return null;

  const count = data ?? 0;

  return (
    <Link
      href={buildPath("/account/notifications")}
      aria-label={t("notifications.openNotifications")}
      className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-theme text-(--theme-foreground) transition-colors hover:bg-surface"
    >
      <Bell className="h-5 w-5" aria-hidden="true" />
      {count > 0 ? (
        <span className="absolute -top-0.5 -end-0.5 inline-flex min-w-5 items-center justify-center rounded-full bg-(--theme-primary) px-1 text-[11px] font-bold text-(--theme-on-primary)">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
