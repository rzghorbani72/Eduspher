'use client';

import { Dot } from 'lucide-react';
import Link from '@/components/ui/link';

import { usePlatformFeatures } from '@/components/providers/platform-features-provider';
import { useTranslation } from '@/lib/i18n/hooks';
import { toPersianDigits } from '@/lib/utils';
import { renderMarkdown } from '@/lib/markdown';
import { CollapsibleHtml } from '@/components/courses/collapsible-html';
import { ShowMoreButton, useShowMore } from '@/components/courses/show-more';
import type { CourseSummary } from '@/lib/api/types';
import type { CourseContentStats } from '@/lib/courses/curriculum';
import { parseAuthoredList } from '@/lib/courses/curriculum';
import { formatMinutes } from '@/components/courses/curriculum/format';

interface CourseOverviewProps {
  course: CourseSummary;
  stats: CourseContentStats;
  prerequisiteHref: string | null;
  /** Recorded courses list these in the buy box instead. */
  showFacts: boolean;
}

const DIFFICULTY_KEY: Record<string, string> = {
  BEGINNER: 'courses.beginner',
  INTERMEDIATE: 'courses.intermediate',
  ADVANCED: 'courses.advanced',
  EXPERT: 'courses.expert',
};

export function CourseOverview({
  course,
  stats,
  prerequisiteHref,
  showFacts,
}: CourseOverviewProps) {
  const { t, language } = useTranslation();
  const { quizzes_enabled, certificates_enabled } = usePlatformFeatures();
  const requirements = parseAuthoredList(course.requirements);
  const requirementList = useShowMore(requirements, 4);

  const facts = [
    {
      key: 'lessons',
      value: toPersianDigits(stats.lessonCount, language),
      label: t('courses.lesson'),
    },
    stats.totalMinutes > 0 && {
      key: 'duration',
      value: formatMinutes(stats.totalMinutes, language, t),
      label: t('courses.statHoursLabel'),
    },
    stats.liveCount > 0 && {
      key: 'live',
      value: toPersianDigits(stats.liveCount, language),
      label: t('courses.statLiveLabel'),
    },
    quizzes_enabled &&
      stats.quizCount > 0 && {
        key: 'quiz',
        value: toPersianDigits(stats.quizCount, language),
        label: t('courses.statQuizLabel'),
      },
    stats.assignmentCount > 0 && {
      key: 'assignment',
      value: toPersianDigits(stats.assignmentCount, language),
      label: t('courses.statAssignmentLabel'),
    },
    course.difficulty && {
      key: 'difficulty',
      value: t(DIFFICULTY_KEY[course.difficulty] ?? 'courses.beginner'),
      label: t('courses.difficulty'),
    },
    certificates_enabled &&
      course.is_certificate && {
        key: 'certificate',
        value: t('courses.certificateIncluded'),
        label: t('courses.certificate'),
      },
  ].filter((fact): fact is { key: string; value: string; label: string } => Boolean(fact));

  return (
    <section className="animate-in fade-in slide-in-from-bottom-3 space-y-8 duration-300">
      {course.description && (
        <div>
          <h2 className="mb-3 text-xl font-black text-(--theme-foreground)">
            {t('courses.aboutCourse')}
          </h2>
          <CollapsibleHtml
            html={renderMarkdown(course.description)}
            className="prose-description text-sm leading-loose text-(--theme-muted)"
            collapsedClassName="max-h-[12rem]"
            toggleClassName="text-(--theme-primary)"
          />
        </div>
      )}

      {(requirements.length > 0 || prerequisiteHref) && (
        <div>
          <h2 className="mb-4 text-xl font-black text-(--theme-foreground)">
            {t('courses.requirements')}
          </h2>
          <ul className="mb-4 space-y-2">
            {requirementList.visible.map((item) => (
              <li key={item} className="flex items-start gap-1 text-sm text-(--theme-muted)">
                <Dot className="h-5 w-5 shrink-0 text-(--theme-primary)" />
                {item}
              </li>
            ))}
            {prerequisiteHref && course.PrerequisiteCourse && (
              <li className="flex items-start gap-1 text-sm text-(--theme-muted)">
                <Dot className="h-5 w-5 shrink-0 text-(--theme-primary)" />
                <span>
                  {t('courses.prerequisiteCourse')}{' '}
                  <Link
                    href={prerequisiteHref}
                    className="font-bold text-(--theme-primary) hover:underline"
                  >
                    {course.PrerequisiteCourse.title}
                  </Link>
                </span>
              </li>
            )}
          </ul>
          <ShowMoreButton list={requirementList} />
        </div>
      )}

      {showFacts ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {facts.map((fact) => (
            <div key={fact.key} className="bg-surface rounded-xl p-4">
              <div className="cd-price text-base font-bold text-(--theme-foreground)">
                {fact.value}
              </div>
              <div className="mt-1 text-xs text-(--theme-muted)">{fact.label}</div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
