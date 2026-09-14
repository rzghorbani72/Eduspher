'use client';

import {
  ArrowLeft,
  Award,
  BookOpen,
  ClipboardList,
  Clock,
  Layers,
  ListChecks,
  Radio,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useMemo } from 'react';

import Link from '@/components/ui/link';
import { formatMinutes } from '@/components/courses/curriculum/format';
import { useTranslation } from '@/lib/i18n/hooks';
import type { CourseContentStats } from '@/lib/courses/curriculum';
import { formatPercent, toPersianDigits } from '@/lib/utils';

interface EnrolledSideOverviewProps {
  progressPercent: number | null;
  stats: CourseContentStats;
  isCertificate: boolean;
}

type CourseFact = {
  key: string;
  value: string;
  label: string;
  icon: LucideIcon;
};

function buildFacts(
  stats: CourseContentStats,
  isCertificate: boolean,
  language: string,
  t: (key: string) => string,
): CourseFact[] {
  const facts: Array<CourseFact | false> = [
    stats.lessonCount > 0 && {
      key: 'lessons',
      value: toPersianDigits(stats.lessonCount, language),
      label: t('courses.lesson'),
      icon: BookOpen,
    },
    stats.seasonCount > 0 && {
      key: 'sections',
      value: toPersianDigits(stats.seasonCount, language),
      label: t('courses.sectionsLabel'),
      icon: Layers,
    },
    stats.totalMinutes > 0 && {
      key: 'duration',
      value: formatMinutes(stats.totalMinutes, language, t),
      label: t('courses.statHoursLabel'),
      icon: Clock,
    },
    stats.liveCount > 0 && {
      key: 'live',
      value: toPersianDigits(stats.liveCount, language),
      label: t('courses.statLiveLabel'),
      icon: Radio,
    },
    stats.quizCount > 0 && {
      key: 'quiz',
      value: toPersianDigits(stats.quizCount, language),
      label: t('courses.statQuizLabel'),
      icon: ListChecks,
    },
    stats.assignmentCount > 0 && {
      key: 'assignment',
      value: toPersianDigits(stats.assignmentCount, language),
      label: t('courses.statAssignmentLabel'),
      icon: ClipboardList,
    },
    isCertificate && {
      key: 'certificate',
      value: t('courses.certificateIncluded'),
      label: t('courses.certificate'),
      icon: Award,
    },
  ];

  return facts.filter((fact): fact is CourseFact => Boolean(fact)).slice(0, 4);
}

export function EnrolledSideOverview({
  progressPercent,
  stats,
  isCertificate,
}: EnrolledSideOverviewProps) {
  const { t, language } = useTranslation();
  const facts = useMemo(
    () => buildFacts(stats, isCertificate, language, t),
    [stats, isCertificate, language, t],
  );

  if (progressPercent == null && facts.length === 0) return null;

  return (
    <div className="space-y-5 px-5 pt-5 pb-4">
      {progressPercent != null && (
        <div>
          <div className="mb-2 flex items-center justify-between gap-3 text-[13px]">
            <span className="font-bold text-(--theme-foreground)">{t('courses.yourProgress')}</span>
            <span className="cd-price font-black text-(--theme-primary)">
              {formatPercent(progressPercent, language)}
            </span>
          </div>
          <div className="flex h-2 w-full overflow-hidden rounded-full bg-(--theme-surface-alt)">
            <div
              role="progressbar"
              aria-label={t('courses.yourProgress')}
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-full rounded-full bg-(--theme-primary) transition-[width] motion-reduce:transition-none"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {facts.length > 0 && (
        <div>
          <h3 className="text-xs font-black text-(--theme-foreground)">{t('courses.includes')}</h3>
          <ul className="mt-2.5 grid grid-cols-2 gap-2.5">
            {facts.map((fact) => (
              <li
                key={fact.key}
                className="border-theme flex items-center gap-2.5 rounded-xl border bg-(--theme-primary)/6 px-3 py-3"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-(--theme-primary)/12 text-(--theme-primary)">
                  <fact.icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="cd-price block truncate text-sm font-black text-(--theme-foreground)">
                    {fact.value}
                  </span>
                  <span className="text-muted block truncate text-[11px]">{fact.label}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function EnrolledSideCta({
  href,
  progressPercent,
}: {
  href: string;
  progressPercent: number | null;
}) {
  const { t } = useTranslation();
  const hasStarted = progressPercent != null && progressPercent > 0;

  return (
    <div className="px-5 pt-5 pb-5">
      <h2 className="text-lg leading-snug font-black text-(--theme-foreground)">
        {t('courses.alreadyEnrolled')}
      </h2>
      <Link
        href={href}
        className="cd-cta-btn mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-extrabold text-white transition-all hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      >
        {hasStarted ? t('courses.continueLearning') : t('courses.startLearning')}
        <ArrowLeft className="h-4 w-4 shrink-0 rtl:rotate-180" />
      </Link>
    </div>
  );
}
