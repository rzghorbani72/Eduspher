import { CourseCard } from '@/components/courses/course-card';
import { TemplateCourseCard } from '@/components/templates/_shared/course-card';
import { toTemplateCourse } from '@/components/templates/_shared/courses-data';
import { resolveTemplateCourseCard } from '@/components/templates/registry';
import { getActiveTemplateKey } from '@/lib/active-template';
import { getAcademyCurrency } from '@/lib/courses/academy-context';
import type { CourseSummary } from '@/lib/api/types';

interface TemplatedCourseCardProps {
  course: CourseSummary;
  /** Position in the grid — picks the template's thumbnail tone round-robin. */
  index?: number;
  storeSlug?: string | null;
}

/**
 * One course card for every page outside the home template. It draws the card
 * of the academy's active template, and falls back to the built-in card for
 * academies on no template or on one that ships no course design. Currency is
 * resolved here rather than passed in, so no page can forget it and print
 * dollars for a Toman academy.
 */
export async function TemplatedCourseCard({
  course,
  index = 0,
  storeSlug = null,
}: TemplatedCourseCardProps) {
  const [templateKey, currency] = await Promise.all([
    getActiveTemplateKey(),
    getAcademyCurrency().catch(() => null),
  ]);
  const spec = resolveTemplateCourseCard(templateKey);

  if (!spec) {
    return <CourseCard course={course} storeSlug={storeSlug} store={currency} />;
  }
  return (
    <TemplateCourseCard
      course={toTemplateCourse(course, storeSlug, currency)}
      spec={spec}
      index={index}
    />
  );
}
