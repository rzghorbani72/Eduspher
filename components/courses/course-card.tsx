'use client';

import Link from '@/components/ui/link';
import { BookOpen, CalendarClock, Clock } from 'lucide-react';

import { COURSE_CARD_THUMB_CLASS } from '@/components/courses/course-card-layout';
import { formatMinutes } from '@/components/courses/curriculum/format';
import { AppImage } from '@/components/ui/app-image';
import { isLiveCourse, seatPriceOf } from '@/lib/courses/live-course';
import { coursePath } from '@/lib/content-paths';
import { usePlatformFeatures } from '@/components/providers/platform-features-provider';
import { useTranslation } from '@/lib/i18n/hooks';
import type { CourseSummary } from '@/lib/api/types';
import { courseCoverGradient } from '@/lib/courses/course-cover';
import {
  buildAcademyPath,
  formatCurrencyWithAcademy,
  resolveAssetUrl,
  toPersianDigits,
} from '@/lib/utils';

interface CourseCardProps {
  course: CourseSummary;
  storeSlug?: string | null;
  store?: {
    currency?: string;
    currency_symbol?: string;
    currency_position?: 'before' | 'after';
  } | null;
}

const FREE_GREEN = '#10b981';
const LIVE_RED = '#e11d48';

export const CourseCard = ({ course, storeSlug = null, store = null }: CourseCardProps) => {
  const { t, language } = useTranslation();
  const { certificates_enabled } = usePlatformFeatures();
  const detailHref = buildAcademyPath(storeSlug, coursePath(course.slug));
  const coverUrl = resolveAssetUrl(course.Image?.publicUrl);
  const thumbGradient = courseCoverGradient(course.id);
  const monogram = course.title.trim().charAt(0);
  const teacherName = course.author?.display_name ?? course.Profile?.display_name ?? null;

  const num = (value: number, opts?: Intl.NumberFormatOptions) =>
    toPersianDigits(value.toLocaleString('en-US', opts), language);
  const durationLabel = formatMinutes(course.duration, language, t) || null;
  const isLive = isLiveCourse(course);
  const seatPrice = seatPriceOf(course);
  const money = (value: number) =>
    toPersianDigits(formatCurrencyWithAcademy(value, store, undefined, language), language);
  // A live course sells seats, so its own price and free flag say nothing.
  const priceLabel = isLive
    ? seatPrice
      ? `${t('courses.seatPriceFrom')} ${money(seatPrice)}`
      : t('courses.priceOnRequest')
    : course.is_free
      ? t('courses.free')
      : money(course.price || 0);
  const studentsLabel =
    course.students_count && course.students_count > 0
      ? `${num(course.students_count)} ${t('courses.students')}`
      : t('courses.beFirstStudent');

  const chips = [
    isLive ? { label: t('courses.liveCourse'), color: LIVE_RED } : null,
    !isLive && course.is_free ? { label: t('courses.free'), color: FREE_GREEN } : null,
    certificates_enabled && course.is_certificate
      ? { label: t('courses.certificate'), color: '#4f8cff' }
      : null,
    course.is_featured ? { label: t('courses.featured'), color: '#f5a623' } : null,
  ].filter((chip): chip is { label: string; color: string } => chip !== null);

  return (
    <Link
      href={detailHref}
      className="group flex h-full w-full min-w-0 flex-col overflow-hidden rounded-[26px] border border-(--cc-bd) bg-(--cc-card) shadow-[var(--cc-sh-sm)] transition-all duration-300 hover:-translate-y-1.5 hover:border-(--cc-brand) hover:shadow-[var(--cc-sh)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--cc-brand)"
    >
      <div
        className={COURSE_CARD_THUMB_CLASS}
        style={coverUrl ? undefined : { background: thumbGradient }}
      >
        {coverUrl ? (
          <AppImage
            src={coverUrl}
            alt={course.title}
            preset="card"
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-7 -left-3 text-[150px] leading-none font-black text-white/15 select-none"
          >
            {monogram}
          </span>
        )}
        {coverUrl ? null : (
          <div className="absolute inset-0 bg-linear-to-b from-black/5 to-black/35" />
        )}

        {course.Category ? (
          <span className="absolute top-3 right-3 rounded-full bg-white/90 px-[11px] py-[5px] text-xs font-extrabold text-[#23253f] backdrop-blur-sm">
            {course.Category.name}
          </span>
        ) : null}

        {chips.length > 0 ? (
          <div className="absolute inset-x-3 bottom-3 flex flex-wrap gap-1.5">
            {chips.map((chip) => (
              <span
                key={chip.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/[0.86] px-2.5 py-[5px] text-[11.5px] font-bold backdrop-blur-md"
                style={{ color: chip.color }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: chip.color }}
                />
                {chip.label}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-[13px] px-[18px] pt-[18px] pb-4">
        {teacherName ? (
          <div className="flex items-center gap-2.5">
            <span
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-extrabold text-white"
              style={{ background: 'var(--cc-grad)' }}
            >
              {teacherName.trim().charAt(0)}
            </span>
            <span className="text-[13.5px] font-semibold text-(--cc-ink-2)">{teacherName}</span>
          </div>
        ) : null}

        <h3 className="text-lg leading-[1.5] font-extrabold tracking-tight text-(--cc-ink) transition-colors group-hover:text-(--cc-brand)">
          {course.title}
        </h3>

        <div className="mt-auto flex items-center gap-3.5 text-[13px] font-semibold text-(--cc-ink-3)">
          {isLive ? (
            course.classes_count ? (
              <span className="inline-flex items-center gap-1.5">
                <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                {num(course.classes_count)} {t('courses.liveClassWord')}
              </span>
            ) : null
          ) : course.lessons_count ? (
            <span className="inline-flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 shrink-0" />
              {num(course.lessons_count)} {t('courses.lesson')}
            </span>
          ) : null}
          {!isLive && durationLabel ? (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              {durationLabel}
            </span>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-2.5 border-t border-(--cc-bd-2) pt-[13px]">
          <span className="text-xs font-semibold text-(--cc-ink-3)">{studentsLabel}</span>
          <span
            className="text-[15px] font-black whitespace-nowrap"
            style={{ color: !isLive && course.is_free ? FREE_GREEN : 'var(--cc-brand)' }}
          >
            {priceLabel}
          </span>
        </div>
      </div>
    </Link>
  );
};
