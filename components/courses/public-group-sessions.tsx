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

/** Upcoming meeting dates for a signed-in student. Join links stay off this list. */
export function PublicGroupSessions({ sessions, timezone }: PublicGroupSessionsProps) {
  const { t, language } = useTranslation();
  if (!sessions?.length) return null;

  return (
    <div className="space-y-1.5">
      <p className="text-muted text-xs font-semibold">{t('courses.groupUpcomingSessions')}</p>
      <ol className="space-y-1">
        {sessions.map((session) => (
          <li key={session.starts_at} className="text-sm text-(--theme-foreground)">
            {formatDateTime(session.starts_at, language, timezone)}
          </li>
        ))}
      </ol>
    </div>
  );
}
