import { notFound, redirect } from 'next/navigation';

import { LearningShell } from '@/components/learning/learning-shell';
import { getCurrentUser, getEnrollments, getPublicCourseDetail } from '@/lib/api/server';
import { getSession } from '@/lib/auth/session';
import { coursePath, decodePathSegment, learnPath } from '@/lib/content-paths';
import { getAcademyContext } from '@/lib/store-context';
import { buildAcademyPath } from '@/lib/utils';

type PageParams = Promise<{ courseSlug: string; lessonSlug: string }>;

export default async function LearningLessonPage({ params }: { params: PageParams }) {
  const { courseSlug: courseSlugParam, lessonSlug: lessonSlugParam } = await params;
  const courseSlug = decodePathSegment(courseSlugParam);
  const lessonSlug = decodePathSegment(lessonSlugParam);
  const [session, storeContext] = await Promise.all([getSession(), getAcademyContext()]);
  const storeSlug = storeContext.isSubdomain ? null : storeContext.slug;

  if (!session) {
    const returnPath = buildAcademyPath(storeSlug, learnPath(courseSlug, lessonSlug));
    redirect(
      `${buildAcademyPath(storeSlug, '/auth/login')}?redirect=${encodeURIComponent(returnPath)}`,
    );
  }

  const course = await getPublicCourseDetail(courseSlug);
  const [enrollmentData, user] = await Promise.all([
    course ? getEnrollments({ course_id: course.id, limit: 1 }).catch(() => null) : null,
    getCurrentUser().catch(() => null),
  ]);
  // Staff see the academy's enrollments here, so match this viewer's own row —
  // otherwise progress would be written against another student's enrollment.
  const enrollment = enrollmentData?.enrollments.find(
    (item) =>
      String(item.course_id) === course?.id &&
      String(item.profile_id) === String(session.profileId) &&
      (item.status === 'ACTIVE' || item.status === 'COMPLETED'),
  );

  if (!course || !user) notFound();

  const seasons = course.Season ?? [];
  const selectedLesson = seasons
    .flatMap((season) => season.Lesson ?? [])
    .find((lesson) => lesson.slug === lessonSlug || String(lesson.id) === lessonSlug);

  if (!selectedLesson || selectedLesson.is_published === false) {
    notFound();
  }

  // A free lesson is open to every signed-in visitor, whichever way they bought
  // the course — or even if they have not bought it yet. Everything else still
  // needs a live enrollment, and the backend re-checks each lesson anyway.
  if (!enrollment && !selectedLesson.is_free) {
    redirect(buildAcademyPath(storeSlug, coursePath(course.slug)));
  }

  return (
    <LearningShell
      courseId={course.id}
      courseSlug={course.slug}
      courseTitle={course.title}
      seasons={seasons}
      selectedLesson={selectedLesson}
      enrollmentId={enrollment ? String(enrollment.id) : null}
      currentProfileId={String(user.id)}
      studentName={user.display_name ?? null}
      storeSlug={storeSlug}
      teacherName={course.Profile?.display_name ?? course.author?.display_name ?? null}
    />
  );
}
