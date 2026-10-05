'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { formatDateTime } from '@/components/courses/curriculum/format';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';

type PublicSession = {
  starts_at: string;
  ends_at: string;
};

interface PublicGroupSessionsProps {
  sessions?: readonly PublicSession[];
  timezone?: string;
}

/** Upcoming meeting dates on the course page, folded by default. Join links stay off this list. */
export function PublicGroupSessions({ sessions, timezone }: PublicGroupSessionsProps) {
  const { t, language } = useTranslation();
  const [open, setOpen] = useState(false);
  if (!sessions?.length) return null;

  return (
    <div className="mt-2.5">
      <button
        type="button"
        aria-expanded={open}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        className="cd-class-ink inline-flex items-center gap-1 text-[13px] font-semibold"
      >
        {t('courses.groupUpcomingSessions')}
        <ChevronDown
          className={cn('size-3.5 transition-transform', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>
      {open ? (
        <ol className="mt-2 flex flex-wrap gap-1.5">
          {sessions.map((session) => (
            <li key={session.starts_at} className="cd-class-chip cd-price">
              {formatDateTime(session.starts_at, language, timezone)}
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}
