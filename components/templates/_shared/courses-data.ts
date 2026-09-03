import { getCourses } from '@/lib/api/server';
import { getAcademyCurrency, type CurrencyConfig } from '@/lib/courses/academy-context';
import { buildAcademyPath, formatCurrencyWithAcademy, toPersianDigits } from '@/lib/utils';
import type { CourseSummary } from '@/lib/api/types';
import { isLiveCourse, seatPriceOf } from '@/lib/courses/live-course';
import type { TemplateStoreContext } from './types';
import { withSampleCourses } from './sample-data';

/**
 * One live-data path shared by all seven templates' course sections.
 *
 * Each template draws its own card, but none of them re-implements fetching,
 * currency formatting or the academy-path rules — so a change to how courses
 * are read lands in one place instead of seven.
 */
export interface TemplateCourse {
  id: string;
  title: string;
  href: string;
  priceLabel: string;
  isFree: boolean;
  teacherName: string | null;
  teacherInitials: string;
  levelLabel: string | null;
  lessonsLabel: string | null;
  durationLabel: string | null;
  ratingLabel: string | null;
  coverUrl: string | null;
}

const DIFFICULTY_FA: Record<string, string> = {
  BEGINNER: 'مقدماتی',
  INTERMEDIATE: 'متوسط',
  ADVANCED: 'پیشرفته',
  EXPERT: 'حرفه‌ای',
};

function initialsOf(name: string | null): string {
  if (!name) return '—';
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part.charAt(0)).join('') || '—';
}

export async function loadTemplateCourses(
  storeContext: TemplateStoreContext | undefined,
  limit: number
): Promise<TemplateCourse[]> {
  const [payload, currencyStore] = await Promise.all([
    getCourses({
      limit,
      published: true,
      ...(storeContext?.academyId ? { academy_id: storeContext.academyId } : {}),
    }).catch(() => null),
    getAcademyCurrency().catch(() => null),
  ]);

  const courses = payload?.courses ?? [];
  const storeSlug = storeContext?.isSubdomain ? null : (storeContext?.slug ?? null);
  const live = courses.map((course) => toTemplateCourse(course, storeSlug, currencyStore));

  // Preview only: pad a thin catalogue with labelled samples so the design can
  // be judged. Real courses always come first and are never substituted.
  return storeContext?.sampleData ? withSampleCourses(live) : live;
}

function formatDurationLabel(minutes: number | null): string | null {
  if (minutes == null || minutes <= 0) return null;
  if (minutes < 60) {
    return `${toPersianDigits(String(minutes), 'fa')} دقیقه`;
  }
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const hoursLabel = `${toPersianDigits(String(hours), 'fa')} ساعت`;
  if (rest === 0) return hoursLabel;
  return `${hoursLabel} ${toPersianDigits(String(rest), 'fa')} دقیقه`;
}

export function toTemplateCourse(
  course: CourseSummary,
  storeSlug: string | null,
  currencyStore: CurrencyConfig | null
): TemplateCourse {
  const teacherName = course.author?.display_name ?? course.Profile?.display_name ?? null;
  const minutes = course.duration ?? null;
  const seatPrice = seatPriceOf(course);

  return {
    id: course.id,
    title: course.title,
    href: buildAcademyPath(storeSlug, `/courses/${course.id}`),
    priceLabel: course.is_free
      ? 'رایگان'
      : isLiveCourse(course)
        ? seatPrice
          ? `هر صندلی از ${toPersianDigits(formatCurrencyWithAcademy(seatPrice, currencyStore), 'fa')}`
          : 'ثبت‌نام با هماهنگی'
        : toPersianDigits(formatCurrencyWithAcademy(course.price, currencyStore), 'fa'),
    isFree: course.is_free,
    teacherName,
    teacherInitials: initialsOf(teacherName),
    levelLabel: course.difficulty ? (DIFFICULTY_FA[course.difficulty] ?? null) : null,
    lessonsLabel:
      course.lessons_count && !isLiveCourse(course)
        ? `${toPersianDigits(String(course.lessons_count), 'fa')} جلسه`
        : null,
    durationLabel: formatDurationLabel(minutes),
    ratingLabel: course.rating ? toPersianDigits(course.rating.toFixed(1), 'fa') : null,
    coverUrl: course.Image?.publicUrl ?? null,
  };
}
