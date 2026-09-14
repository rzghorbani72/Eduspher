'use client';

import { useMemo } from 'react';
import { CalendarClock, Radio, Repeat } from 'lucide-react';

import { useTranslation } from '@/lib/i18n/hooks';
import { cn, toPersianDigits } from '@/lib/utils';
import type { CurriculumSeasonView } from '@/lib/courses/curriculum';
import { liveStateAt } from '@/lib/courses/curriculum';
import {
  formatDateTime,
  formatLiveRepeat,
  formatMinutes,
} from '@/components/courses/curriculum/format';
import { EmptyState } from '@/components/ui/empty-state';
import { useNow } from '@/lib/hooks/use-now';

interface CourseLiveScheduleProps {
  seasons: CurriculumSeasonView[];
}

/**
 * The live timetable a manager sells the course on. Join links are never in the
 * public payload — the student gets one from the lesson page after buying.
 */
export function CourseLiveSchedule({ seasons }: CourseLiveScheduleProps) {
  const { t, language } = useTranslation();
  const now = useNow();

  const sessions = useMemo(
    () =>
      seasons
        .flatMap((season) =>
          season.lessons
            .filter((lesson) => lesson.live !== null)
            .map((lesson) => ({ lesson, seasonTitle: season.title })),
        )
        .sort(
          (a, b) =>
            new Date(a.lesson.live!.startsAt).getTime() -
            new Date(b.lesson.live!.startsAt).getTime(),
        ),
    [seasons],
  );

  if (sessions.length === 0) {
    return (
      <EmptyState
        title={t('courses.noLiveSessions')}
        description={t('courses.noLiveSessionsDescription')}
      />
    );
  }

  return (
    <section className="animate-in fade-in slide-in-from-bottom-3 space-y-5 duration-300">
      <div>
        <h2 className="text-xl font-black text-(--theme-foreground)">
          {t('courses.liveScheduleTitle')}
        </h2>
        <p className="mt-1 text-[13px] text-(--theme-muted)">{t('courses.liveScheduleSubtitle')}</p>
      </div>

      <ol className="space-y-3">
        {sessions.map(({ lesson, seasonTitle }) => {
          const live = lesson.live!;
          const state = liveStateAt(live, now);
          return (
            <li
              key={lesson.id}
              className={cn(
                'cd-review-card flex flex-wrap items-center gap-4 rounded-2xl border p-4',
                state === 'running' && 'border-[#ef4444] bg-[rgba(239,68,68,0.04)]',
              )}
            >
              <span
                className={cn(
                  'grid h-11 w-11 shrink-0 place-items-center rounded-xl',
                  state === 'running'
                    ? 'bg-[rgba(239,68,68,0.12)] text-[#ef4444]'
                    : 'bg-(--theme-surface) text-(--theme-muted)',
                )}
              >
                {state === 'running' ? (
                  <Radio className="h-5 w-5 animate-pulse" />
                ) : (
                  <CalendarClock className="h-5 w-5" />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-extrabold text-(--theme-foreground)">
                    {lesson.title}
                  </span>
                  {state === 'running' && (
                    <span className="rounded-full bg-[#ef4444] px-2 py-0.5 text-[11px] font-bold text-white">
                      {t('courses.badgeLiveNow')}
                    </span>
                  )}
                  {live.isRecurring && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-(--theme-primary)">
                      <Repeat className="h-3 w-3" />
                      {formatLiveRepeat(live, t)}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-(--theme-muted)">{seasonTitle}</p>
              </div>

              <div className="text-end">
                <div className="cd-price text-sm font-bold text-(--theme-foreground)">
                  {formatDateTime(live.startsAt, language, live.timezone)}
                </div>
                <div className="cd-price mt-0.5 text-xs text-(--theme-muted)">
                  {[
                    formatMinutes(live.durationMinutes, language, t),
                    toPersianDigits(live.timezone, language),
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
