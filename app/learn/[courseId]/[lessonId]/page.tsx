import { notFound, redirect } from "next/navigation";

import { LearningShell } from "@/components/learning/learning-shell";
import { getCourseById, getCurrentUser, getEnrollments } from "@/lib/api/server";
import { getSession } from "@/lib/auth/session";
import { getAcademyContext } from "@/lib/store-context";
import { buildAcademyPath } from "@/lib/utils";

type PageParams = Promise<{ courseId: string; lessonId: string }>;

export default async function LearningLessonPage({
  params,
}: {
  params: PageParams;
}) {
  const { courseId, lessonId } = await params;
  const [session, storeContext] = await Promise.all([
    getSession(),
    getAcademyContext(),
  ]);
  const storeSlug = storeContext.isSubdomain ? null : storeContext.slug;

  if (!session) {
    const returnPath = buildAcademyPath(
      storeSlug,
      `/learn/${courseId}/${lessonId}`,
    );
    redirect(
      `${buildAcademyPath(storeSlug, "/auth/login")}?redirect=${encodeURIComponent(returnPath)}`,
    );
  }

  const [course, enrollmentData, user] = await Promise.all([
    getCourseById(courseId).catch(() => null),
    getEnrollments({ course_id: courseId, limit: 1 }).catch(() => null),
    getCurrentUser().catch(() => null),
  ]);
  const enrollment = enrollmentData?.enrollments.find(
    (item) =>
      String(item.course_id) === courseId &&
      (item.status === "ACTIVE" || item.status === "COMPLETED"),
  );

  if (!course || !enrollment || !user) {
    redirect(buildAcademyPath(storeSlug, `/courses/${courseId}`));
  }

  const seasons = course.Season ?? [];
  const selectedLesson = seasons
    .flatMap((season) => season.Lesson ?? [])
    .find((lesson) => String(lesson.id) === lessonId);

  if (!selectedLesson || selectedLesson.is_published === false) {
    notFound();
  }

  return (
    <LearningShell
      courseId={courseId}
      courseTitle={course.title}
      seasons={seasons}
      selectedLesson={selectedLesson}
      enrollmentId={String(enrollment.id)}
      currentProfileId={String(user.id)}
      storeSlug={storeSlug}
    />
  );
}
