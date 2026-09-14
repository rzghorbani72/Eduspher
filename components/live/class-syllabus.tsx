'use client';

import { CheckCircle2, Circle } from 'lucide-react';

import { EmptyState } from '@/components/ui/empty-state';
import type { CourseTopic, MyTutoringGroupSession } from '@/lib/api/account-types';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn, formatDate, formatNumber } from '@/lib/utils';

interface ClassSyllabusProps {
  topics: CourseTopic[];
  sessions: MyTutoringGroupSession[];
}

/** The syllabus as a checklist: the teacher ticks a topic by holding its meeting. */
export function ClassSyllabus({ topics, sessions }: ClassSyllabusProps) {
  const { t, language } = useTranslation();
  if (!topics.length) return <EmptyState compact title={t('live.noTopics')} />;

  const done = topics.filter((topic) => topic.covered).length;
  const dateOf = (sessionId: string | null) => {
    const session = sessions.find((row) => row.id === sessionId);
    return session ? formatDate(session.starts_at, language) : null;
  };

  return (
    <div className="space-y-4">
      <p className="text-muted text-xs">
        {t('live.topicsProgress')
          .replace('{done}', formatNumber(done, language))
          .replace('{total}', formatNumber(topics.length, language))}
      </p>
      <ol className="space-y-3">
        {topics.map((topic) => {
          const coveredOn = topic.covered ? dateOf(topic.covered_session_id) : null;
          return (
            <li key={topic.id} className="flex gap-3">
              <span
                className={cn(
                  'mt-0.5 shrink-0',
                  topic.covered ? 'text-(--theme-primary)' : 'text-muted',
                )}
              >
                {topic.covered ? (
                  <CheckCircle2 className="size-5" aria-hidden="true" />
                ) : (
                  <Circle className="size-5" aria-hidden="true" />
                )}
              </span>
              <span className="min-w-0">
                <span
                  className={cn(
                    'block text-sm font-medium',
                    topic.covered && 'text-muted line-through',
                  )}
                >
                  {topic.title}
                </span>
                {topic.description ? (
                  <span className="text-muted mt-0.5 block text-xs">{topic.description}</span>
                ) : null}
                {coveredOn ? (
                  <span className="mt-0.5 block text-xs text-(--theme-primary)">
                    {t('live.coveredIn').replace('{date}', coveredOn)}
                  </span>
                ) : null}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
