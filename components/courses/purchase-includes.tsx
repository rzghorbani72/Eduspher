'use client';

import {
  Award,
  CalendarClock,
  ClipboardCheck,
  Clock,
  GraduationCap,
  MessageCircle,
  MonitorPlay,
} from 'lucide-react';

import { usePlatformFeatures } from '@/components/providers/platform-features-provider';
import { useTranslation } from '@/lib/i18n/hooks';
import { toPersianDigits } from '@/lib/utils';
import type { PurchaseOptionView } from '@/lib/courses/purchase-options';
import type { CourseContentStats } from '@/lib/courses/curriculum';
import { formatAccessTerm, formatMinutes } from '@/components/courses/curriculum/format';

interface PurchaseIncludesProps {
  option: PurchaseOptionView;
  stats: CourseContentStats;
  isCertificate: boolean;
  format: (amount: number) => string;
  installmentTotal: number;
}

interface IncludeItem {
  key: string;
  icon: typeof Clock;
  title: string;
  sub: string | null;
}

export function PurchaseIncludes({
  option,
  stats,
  isCertificate,
  format,
  installmentTotal,
}: PurchaseIncludesProps) {
  const { t, language } = useTranslation();
  const { quizzes_enabled } = usePlatformFeatures();
  const count = (value: number) => toPersianDigits(value, language);
  const duration = formatMinutes(stats.totalMinutes, language, t);

  const items: IncludeItem[] = [
    stats.lessonCount > 0 && {
      key: 'lessons',
      icon: MonitorPlay,
      title: t('courses.includeLessons').replace('{count}', count(stats.lessonCount)),
      sub: duration ? t('courses.includeLessonsSub').replace('{duration}', duration) : null,
    },
    {
      key: 'access',
      icon: Clock,
      title: formatAccessTerm(option.accessDurationDays, language, t),
      sub: t('courses.includeAnyDevice'),
    },
    option.installments && {
      key: 'installments',
      icon: CalendarClock,
      title: t('courses.installmentSchedule')
        .replace('{count}', count(option.installments.count))
        .replace('{days}', count(option.installments.intervalDays)),
      sub: t('courses.installmentTotal').replace('{total}', format(installmentTotal)),
    },
    option.sessionsIncluded && {
      key: 'sessions',
      icon: GraduationCap,
      title: t('courses.tutoringSessions').replace('{count}', count(option.sessionsIncluded)),
      sub: option.tutorName,
    },
    quizzes_enabled &&
      stats.quizCount > 0 && {
        key: 'quizzes',
        icon: ClipboardCheck,
        title: t('courses.includeQuizzes').replace('{count}', count(stats.quizCount)),
        sub: t('courses.includeQuizzesSub'),
      },
    isCertificate && {
      key: 'certificate',
      icon: Award,
      title: t('courses.certificate'),
      sub: t('courses.certificateIncluded'),
    },
    {
      key: 'qna',
      icon: MessageCircle,
      title: t('courses.includeQna'),
      sub: t('courses.includeQnaSub'),
    },
  ].filter((item): item is IncludeItem => Boolean(item));

  return (
    <div>
      <h3 className="mb-3 text-[13px] font-bold text-(--theme-muted)">
        {t('courses.courseIncludes')}
      </h3>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-4">
        {items.map(({ key, icon: Icon, title, sub }) => (
          <li key={key} className="flex flex-col gap-2 text-[13px] leading-snug">
            <span className="cd-include-icon grid h-9 w-9 place-items-center rounded-[10px]">
              <Icon className="h-[18px] w-[18px]" />
            </span>
            <span className="cd-price font-semibold text-(--theme-foreground)">
              {title}
              {sub ? (
                <small className="mt-0.5 block text-xs font-normal text-(--theme-muted)">
                  {sub}
                </small>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
