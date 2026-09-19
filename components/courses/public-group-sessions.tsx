'use client';

import { formatDateTime } from '@/components/courses/curriculum/format';
import { useTranslation } from '@/lib/i18n/hooks';

type PublicSession = {
  starts_at: string;
  ends_at: string;
};

interface PublicGroupSessionsProps {
  sessions?: readonly PublicSession[];
  timezone?: string;
}

/** Upcoming meeting dates on the course page. Join links stay off this list. */
export function PublicGroupSessions({ sessions, timezone }: PublicGroupSessionsProps) {
  const { t, language } = useTranslation();
  if (!sessions?.length) return null;

  return (
    <div className="space-y-1.5">
      <p className="text-muted text-xs font-semibold">{t('courses.groupUpcomingSessions')}</p>
      <ol className="flex flex-wrap gap-1.5">
        {sessions.map((session) => (
          <li
            key={session.starts_at}
            className="bg-surface cd-price rounded-lg px-2 py-1 text-xs text-(--theme-foreground)"
          >
            {formatDateTime(session.starts_at, language, timezone)}
          </li>
        ))}
      </ol>
    </div>
  );
}
