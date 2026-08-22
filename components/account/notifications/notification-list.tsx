"use client";

import { useState } from "react";
import { BellOff, CheckCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationRow,
} from "@/lib/api/client";
import type { LanguageCode } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/hooks";
import { useLocaleFormat } from "@/hooks/use-locale-digits";
import { cn, formatDate } from "@/lib/utils";

interface NotificationListProps {
  initialItems: NotificationRow[];
  language: LanguageCode;
}

/**
 * Server-rendered first paint, then read-state is updated locally so marking one
 * as read does not re-fetch the whole list.
 */
export function NotificationList({
  initialItems,
  language,
}: NotificationListProps) {
  const { t } = useTranslation();
  const format = useLocaleFormat();
  const [items, setItems] = useState(initialItems);
  const [busy, setBusy] = useState(false);

  const unreadCount = items.filter((item) => !item.is_read).length;

  async function handleMarkRead(id: string) {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, is_read: true } : item,
      ),
    );
    await markNotificationRead(id).catch(() => undefined);
  }

  async function handleMarkAll() {
    setBusy(true);
    setItems((current) => current.map((item) => ({ ...item, is_read: true })));
    await markAllNotificationsRead().catch(() => undefined);
    setBusy(false);
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<BellOff className="size-7" aria-hidden="true" />}
        title={t("notifications.empty")}
      />
    );
  }

  return (
    <div className="space-y-4">
      {unreadCount > 0 ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted">
            {format.number(unreadCount)} {t("notifications.unread")}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleMarkAll}
            disabled={busy}
          >
            <CheckCheck className="me-2 size-4" />
            {t("notifications.markAllRead")}
          </Button>
        </div>
      ) : null}

      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className={cn(
              "rounded-xl border p-4 transition",
              item.is_read
                ? "border-theme bg-card"
                : "border-(--theme-primary)/40 bg-(--theme-primary)/5",
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-(--theme-foreground)">
                  {item.title}
                </p>
                <p className="mt-1 text-sm text-muted">{item.message}</p>
                <p className="mt-1 text-xs text-muted">
                  {formatDate(item.created_at, language, true)}
                </p>
              </div>
              {!item.is_read ? (
                <button
                  type="button"
                  onClick={() => handleMarkRead(item.id)}
                  className="shrink-0 text-xs font-semibold text-(--theme-primary-ink) hover:underline"
                >
                  {t("notifications.markRead")}
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
