import type { TemplateCourse } from './courses-data';

/**
 * Preview-only sample records.
 *
 * A brand-new academy has no courses yet, so a template preview would render an
 * empty grid and look broken — the manager cannot judge a design from empty
 * states. In preview surfaces we therefore top the real records up with these
 * mocks so the page reads as a finished site.
 *
 * Two rules make this safe:
 *   1. Sample rows are only ever added when `storeContext.sampleData` is true,
 *      which is set exclusively by the preview route. The live storefront never
 *      passes it, so a published site shows real data or an honest empty state.
 *   2. Every sample is prefixed with `SAMPLE_LABEL` and links nowhere, so a
 *      manager can never mistake one for a real course of theirs.
 */

/** Marker shown on every fabricated record. */
export const SAMPLE_LABEL = 'نمونه';

const sampleTitle = (title: string) => `${SAMPLE_LABEL} — ${title}`;

const SAMPLE_COURSES: readonly TemplateCourse[] = [
  {
    id: 'sample-course-1',
    title: sampleTitle('دورهٔ مقدماتی، ترم پاییز'),
    // Samples must not look clickable-to-a-real-page: they stay on the page.
    href: '#courses',
    priceLabel: '۲٬۴۰۰٬۰۰۰ تومان',
    isFree: false,
    teacherName: `${SAMPLE_LABEL} — مدرس اول`,
    teacherInitials: 'نم',
    levelLabel: 'مقدماتی',
    lessonsLabel: '۱۲ جلسه',
    durationLabel: '۲۴ ساعت',
    ratingLabel: '۴٫۸',
    coverUrl: null,
  },
  {
    id: 'sample-course-2',
    title: sampleTitle('دورهٔ تکمیلی با پروژهٔ پایانی'),
    href: '#courses',
    priceLabel: '۳٬۹۰۰٬۰۰۰ تومان',
    isFree: false,
    teacherName: `${SAMPLE_LABEL} — مدرس دوم`,
    teacherInitials: 'نم',
    levelLabel: 'متوسط',
    lessonsLabel: '۱۸ جلسه',
    durationLabel: '۳۶ ساعت',
    ratingLabel: '۴٫۹',
    coverUrl: null,
  },
  {
    id: 'sample-course-3',
    title: sampleTitle('کارگاه فشردهٔ آخر هفته'),
    href: '#courses',
    priceLabel: 'رایگان',
    isFree: true,
    teacherName: `${SAMPLE_LABEL} — مدرس سوم`,
    teacherInitials: 'نم',
    levelLabel: 'پیشرفته',
    lessonsLabel: '۶ جلسه',
    durationLabel: '۱۲ ساعت',
    ratingLabel: '۵٫۰',
    coverUrl: null,
  },
];

/**
 * Tops a live list up to `minimum` entries with clearly-marked samples.
 * Real records always come first and are never replaced.
 */
export function withSampleCourses(
  live: readonly TemplateCourse[],
  minimum = 3
): TemplateCourse[] {
  if (live.length >= minimum) return [...live];
  const needed = minimum - live.length;
  return [...live, ...SAMPLE_COURSES.slice(0, needed)];
}

export function isSampleRecord(id: string): boolean {
  return id.startsWith('sample-');
}
