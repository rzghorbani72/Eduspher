'use client';

import { ArrowLeft } from 'lucide-react';

import { RoleBadges } from '@/components/account/role-badges';
import { TheaterToggle } from '@/components/learning/theater-toggle';
import Link from '@/components/ui/link';
import type { ViewerRole } from '@/lib/courses/staff-access';
import { useTranslation } from '@/lib/i18n/hooks';
import { initialsOf } from '@/lib/learning/live-schedule';
import { formatPercent } from '@/lib/utils';

interface LearningTopBarProps {
  courseHref: string;
  courseTitle: string;
  /** Null while previewing: nothing is recorded, so no progress is shown. */
  percent: number | null;
  studentName: string | null;
  roles: readonly ViewerRole[];
}

export function LearningTopBar({
  courseHref,
  courseTitle,
  percent,
  studentName,
  roles,
}: LearningTopBarProps) {
  const { t, language } = useTranslation();
  return (
    <div className="border-theme bg-card flex h-[60px] items-center gap-4 border-b px-4 sm:px-8">
      <Link
        href={courseHref}
        title={courseTitle}
        className="text-muted hover:text-foreground flex min-w-0 items-center gap-2 text-[13px] font-semibold transition-colors"
      >
        <ArrowLeft className="size-4 shrink-0 rtl:rotate-180" aria-hidden="true" />
        <span className="truncate">{t('courses.backToCourse')}</span>
      </Link>

      <span className="flex-1" />

      <div className="hidden sm:block">
        <RoleBadges roles={roles} />
      </div>

      <TheaterToggle compact className="hidden lg:inline-flex" />

      {percent === null ? null : (
        <div className="flex shrink-0 items-center gap-2.5">
          <span className="text-muted hidden text-xs sm:block">
            {t('learning.coursePercent').replace('{percent}', formatPercent(percent, language))}
          </span>
          <div
            className="h-1.5 w-[110px] overflow-hidden rounded-full bg-(--theme-border-color) sm:w-[150px]"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-(--theme-primary) transition-[width] duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      )}

      {studentName ? (
        <div className="hidden shrink-0 items-center gap-2.5 sm:flex">
          <span className="bg-border h-5 w-px" aria-hidden="true" />
          <span
            className="grid size-[30px] place-items-center rounded-full bg-(--theme-primary)/15 text-[11px] font-extrabold text-(--theme-primary-ink)"
            aria-hidden="true"
          >
            {initialsOf(studentName)}
          </span>
          <span className="text-xs font-semibold">{studentName}</span>
        </div>
      ) : null}
    </div>
  );
}
