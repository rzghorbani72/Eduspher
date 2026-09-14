'use client';

import { Bell } from 'lucide-react';

import Link from '@/components/ui/link';
import { useStorePath } from '@/components/providers/store-provider';
import { getUnreadNotificationCount } from '@/lib/api/client';
import { useTranslation } from '@/lib/i18n/hooks';
import { useApiQuery } from '@/hooks/use-api-query';
import { queryKeys } from '@/lib/query/keys';

/** Polls at a minute — notifications are not time-critical enough to stream. */
const REFRESH_MS = 60_000;

export function NotificationBell({ isAuthenticated }: { isAuthenticated: boolean }) {
  const { t } = useTranslation();
  const buildPath = useStorePath();

  const { data, error } = useApiQuery<number>({
    queryKey: queryKeys.notifications(),
    queryFn: async (signal) => (await getUnreadNotificationCount({ signal }))?.data?.count ?? 0,
    enabled: isAuthenticated,
    refetchInterval: REFRESH_MS,
  });

  // Hide rather than show a wrong count when the badge cannot be read.
  if (error) return null;

  if (!isAuthenticated) return null;

  const count = data ?? 0;

  return (
    <Link
      href={buildPath('/account/notifications')}
      aria-label={t('notifications.openNotifications')}
      className="border-theme hover:bg-surface relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-(--theme-foreground) transition-colors"
    >
      <Bell className="h-5 w-5" aria-hidden="true" />
      {count > 0 ? (
        <span className="absolute -end-0.5 -top-0.5 inline-flex min-w-5 items-center justify-center rounded-full bg-(--theme-primary) px-1 text-[11px] font-bold text-(--theme-on-primary)">
          {count > 99 ? '99+' : count}
        </span>
      ) : null}
    </Link>
  );
}
