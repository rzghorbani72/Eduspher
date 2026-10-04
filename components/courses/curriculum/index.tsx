'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

import { useTranslation } from '@/lib/i18n/hooks';
import { cn, toPersianDigits } from '@/lib/utils';
import type { CourseContentStats, CurriculumSeasonView } from '@/lib/courses/curriculum';
import { LessonRow } from '@/components/courses/curriculum/lesson-row';
import { formatMinutes, formatSeconds } from '@/components/courses/curriculum/format';
import { CourseTopicList } from '@/components/courses/curriculum/topic-list';
import { ShowMoreButton, useShowMore } from '@/components/courses/show-more';
import { EmptyState } from '@/components/ui/empty-state';
import { useNow } from '@/lib/hooks/use-now';
import type { CourseTopic } from '@/lib/api/account-types';

interface CourseCurriculumProps {
  seasons: CurriculumSeasonView[];
  stats: CourseContentStats;
  /** Link prefix for owners, e.g. `/learn/<course-slug>`. Null plays in place. */
  previewBasePath: string | null;
  /** The student holds the recorded lessons, so nothing here is locked. */
  hasLessonAccess?: boolean;
  /** A live course teaches from a syllabus, not recorded lessons. */
  topics?: CourseTopic[];
}

export function CourseCurriculum({
  seasons,
  stats,
  previewBasePath,
  hasLessonAccess = false,
  topics = [],
}: CourseCurriculumProps) {
  const { t, language } = useTranslation();
  const now = useNow();
  const [openIds, setOpenIds] = useState<string[]>(() => seasons.slice(0, 1).map((s) => s.id));
  const list = useShowMore(seasons, 3);

  const summary = useMemo(
    () =>
      [
        `${toPersianDigits(stats.seasonCount, language)} ${t('courses.sectionsLabel')}`,
        `${toPersianDigits(stats.lessonCount, language)} ${t('courses.lesson')}`,
        formatMinutes(stats.totalMinutes, language, t),
      ]
        .filter(Boolean)
        .join(' · '),
    [stats, language, t],
  );

  if (seasons.length === 0 && topics.length > 0) {
    return <CourseTopicList topics={topics} />;
  }

  if (seasons.length === 0) {
    return (
      <EmptyState
        title={t('courses.lessonsComingSoon')}
        description={t('courses.lessonsComingSoonCheckBack')}
      />
    );
  }

  const toggle = (id: string) =>
    setOpenIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const allOpen = openIds.length === seasons.length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-(--theme-foreground)">
            {t('courses.curriculumTitle')}
          </h2>
          <p className="mt-1 text-[13px] text-(--theme-muted)">{t('courses.curriculumSubtitle')}</p>
        </div>
        <div className="flex items-center gap-3 pt-1">
          <span className="cd-price text-sm font-semibold text-(--theme-muted)">{summary}</span>
          <button
            type="button"
            onClick={() => {
              setOpenIds(allOpen ? [] : seasons.map((s) => s.id));
              list.setExpanded(!allOpen);
            }}
            className="cursor-pointer text-xs font-bold text-(--theme-primary) hover:underline"
          >
            {allOpen ? t('courses.collapseAll') : t('courses.expandAll')}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {list.visible.map((season, index) => {
          const isOpen = openIds.includes(season.id);
          const seasonSummary = [
            `${toPersianDigits(season.lessons.length, language)} ${t('courses.lesson')}`,
            formatSeconds(season.totalSeconds, language, t),
          ]
            .filter(Boolean)
            .join(' · ');

          return (
            <div key={season.id} className="cd-review-card overflow-hidden rounded-2xl border">
              <button
                type="button"
                onClick={() => toggle(season.id)}
                aria-expanded={isOpen}
                className="flex w-full cursor-pointer items-center gap-3 p-4 text-start"
              >
                <span className="cd-price grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--theme-primary)_12%,transparent)] text-sm font-extrabold text-(--theme-primary)">
                  {toPersianDigits(index + 1, language)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-base font-extrabold text-(--theme-foreground)">
                    {season.title}
                  </span>
                  {season.description && (
                    <span className="mt-0.5 block truncate text-xs text-(--theme-muted)">
                      {season.description}
                    </span>
                  )}
                </span>
                <span className="cd-price hidden shrink-0 text-xs text-(--theme-muted) sm:block">
                  {seasonSummary}
                </span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 shrink-0 text-(--theme-muted) transition-transform duration-300',
                    isOpen && 'rotate-180',
                  )}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && season.lessons.length > 0 && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="divide-y divide-(--theme-border-color) overflow-hidden border-t border-(--theme-border-color)"
                  >
                    {season.lessons.map((lesson) => (
                      <LessonRow
                        key={lesson.id}
                        lesson={lesson}
                        now={now}
                        previewHref={
                          (lesson.isPreview || hasLessonAccess) && previewBasePath
                            ? `${previewBasePath}/${encodeURIComponent(lesson.slug || lesson.id)}`
                            : null
                        }
                        unlocked={hasLessonAccess}
                      />
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <ShowMoreButton list={list} />
    </div>
  );
}
