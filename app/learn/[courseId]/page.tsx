import { redirect } from "next/navigation";

import { EmptyState } from "@/components/ui/empty-state";
import { getCourseById, getEnrollments } from "@/lib/api/server";
import { getSession } from "@/lib/auth/session";
import { getAcademyLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/server-translations";
import { getAcademyContext } from "@/lib/store-context";
import { buildAcademyPath } from "@/lib/utils";

type PageParams = Promise<{ courseId: string }>;

export default async function LearningCoursePage({ params }: { params: PageParams }) {
  const { courseId } = await params;
  const [session, storeContext] = await Promise.all([
    getSession(),
    getAcademyContext(),
  ]);
  const storeSlug = storeContext.isSubdomain ? null : storeContext.slug;

  if (!session) {
    const returnPath = buildAcademyPath(storeSlug, `/learn/${courseId}`);
    redirect(
      `${buildAcademyPath(storeSlug, "/auth/login")}?redirect=${encodeURIComponent(returnPath)}`,
    );
  }

  const [course, enrollmentData] = await Promise.all([
    getCourseById(courseId).catch(() => null),
    getEnrollments({ course_id: courseId, limit: 1 }).catch(() => null),
  ]);
  // Staff see the academy's enrollments here, so match this viewer's own row —
  // otherwise progress would be written against another student's enrollment.
  const enrollment = enrollmentData?.enrollments.find(
    (item) =>
      String(item.course_id) === courseId &&
      String(item.profile_id) === String(session.profileId) &&
      (item.status === "ACTIVE" || item.status === "COMPLETED"),
  );

  if (!course) {
    redirect(buildAcademyPath(storeSlug, `/courses/${courseId}`));
  }

  const publishedLessons = (course.Season ?? [])
    .flatMap((season) => season.Lesson ?? [])
    .filter((lesson) => lesson.is_published !== false);

  // Without an enrollment the classroom still opens on the free lessons; with
  // nothing free to show there is nothing to open, so back to the sales page.
  const firstLesson = enrollment
    ? publishedLessons[0]
    : publishedLessons.find((lesson) => lesson.is_free);

  if (!enrollment && !firstLesson) {
    redirect(buildAcademyPath(storeSlug, `/courses/${courseId}`));
  }

  if (firstLesson) {
    redirect(
      buildAcademyPath(
        storeSlug,
        `/learn/${courseId}/${String(firstLesson.id)}`,
      ),
    );
  }

  const language = getAcademyLanguage(null, null);
  return (
    <EmptyState
      title={t("learning.noLessons", language)}
      description={t("learning.noLessonsDescription", language)}
    />
  );
}
