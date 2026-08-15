import { getCourses, getCurrentAcademy } from '@/lib/api/server';
import { buildAcademyPath, formatCurrencyWithAcademy, toPersianDigits } from '@/lib/utils';
import type { CourseSummary } from '@/lib/api/types';
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

/** Only the currency-shaped fields this module needs off the academy record. */
type CurrencyStore = NonNullable<Parameters<typeof formatCurrencyWithAcademy>[1]>;

function toCurrencyStore(academy: unknown): CurrencyStore | null {
  if (!academy || typeof academy !== 'object') return null;
  const record: Record<string, unknown> = { ...academy };
  const pick = (key: string): string | undefined =>
    typeof record[key] === 'string' ? record[key] : undefined;
  const position = pick('currency_position');

  return {
    currency: pick('currency'),
    currency_symbol: pick('currency_symbol'),
    currency_position: position === 'before' || position === 'after' ? position : undefined,
    country_code: pick('country_code'),
    language: pick('language'),
  };
}

export async function loadTemplateCourses(
  storeContext: TemplateStoreContext | undefined,
  limit: number
): Promise<TemplateCourse[]> {
  const [payload, academy] = await Promise.all([
    getCourses({
      limit,
      published: true,
      ...(storeContext?.academyId ? { academy_id: storeContext.academyId } : {}),
    }).catch(() => null),
    getCurrentAcademy().catch(() => null),
  ]);

  const courses = payload?.courses ?? [];
  const storeSlug = storeContext?.isSubdomain ? null : (storeContext?.slug ?? null);
  const currencyStore = toCurrencyStore(academy);

  const live = courses.map((course) => toTemplateCourse(course, storeSlug, currencyStore));

  // Preview only: pad a thin catalogue with labelled samples so the design can
  // be judged. Real courses always come first and are never substituted.
  return storeContext?.sampleData ? withSampleCourses(live) : live;
}

function toTemplateCourse(
  course: CourseSummary,
  storeSlug: string | null,
  currencyStore: CurrencyStore | null
): TemplateCourse {
  const teacherName = course.author?.display_name ?? course.Profile?.display_name ?? null;
  const minutes = course.duration ?? null;

  return {
    id: course.id,
    title: course.title,
    href: buildAcademyPath(storeSlug, `/courses/${course.id}`),
    priceLabel: course.is_free ? 'رایگان' : formatCurrencyWithAcademy(course.price, currencyStore),
    isFree: course.is_free,
    teacherName,
    teacherInitials: initialsOf(teacherName),
    levelLabel: course.difficulty ? (DIFFICULTY_FA[course.difficulty] ?? null) : null,
    lessonsLabel: course.lessons_count
      ? `${toPersianDigits(String(course.lessons_count), 'fa')} جلسه`
      : null,
    durationLabel: minutes
      ? `${toPersianDigits(String(Math.round(minutes / 60)), 'fa')} ساعت`
      : null,
    ratingLabel: course.rating ? toPersianDigits(course.rating.toFixed(1), 'fa') : null,
    coverUrl: course.Image?.publicUrl ?? null,
  };
}
