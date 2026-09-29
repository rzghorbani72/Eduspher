import { notFound, redirect } from 'next/navigation';

import { LearningShell } from '@/components/learning/learning-shell';
import { getCurrentUser, getEnrollments, getPublicCourseDetail } from '@/lib/api/server';
import { getCourseAccess } from '@/lib/api/account-server';
import { getSession } from '@/lib/auth/session';
import { coursePath, decodePathSegment, learnPath } from '@/lib/content-paths';
import { staffCanOpen, viewerRoles } from '@/lib/courses/staff-access';
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
  const [enrollmentData, user, courseAccess] = await Promise.all([
    course ? getEnrollments({ course_id: course.id, limit: 1 }).catch(() => null) : null,
    getCurrentUser().catch(() => null),
    getCourseAccess(),
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

  // A free lesson is open to every signed-in visitor. Everything else needs
  // access by any route (purchase, grant, group, subscription); the backend
  // re-checks each lesson anyway.
  const hasAccess =
    Boolean(enrollment) ||
    courseAccess.some((row) => row.course_id === course.id) ||
    staffCanOpen({ id: String(user.id), role: user.role }, course.author?.id);
  if (!hasAccess && !selectedLesson.is_free) {
    redirect(buildAcademyPath(storeSlug, coursePath(course.slug)));
  }

  return (
    <LearningShell
      courseId={course.id}
      courseSlug={course.slug}
      courseTitle={course.title}
      seasons={seasons}
      courseQuiz={course.Quiz?.[0] ?? null}
      selectedLesson={selectedLesson}
      enrollmentId={enrollment ? String(enrollment.id) : null}
      currentProfileId={String(user.id)}
      studentName={user.display_name ?? null}
      storeSlug={storeSlug}
      roles={viewerRoles(
        { id: String(user.id), role: user.role },
        String(user.id) === course.author?.id,
      )}
      teacherName={course.Profile?.display_name ?? course.author?.display_name ?? null}
    />
  );
}
