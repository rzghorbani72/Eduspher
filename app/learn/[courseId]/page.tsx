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
  const enrollment = enrollmentData?.enrollments.find(
    (item) =>
      String(item.course_id) === courseId &&
      (item.status === "ACTIVE" || item.status === "COMPLETED"),
  );

  if (!course || !enrollment) {
    redirect(buildAcademyPath(storeSlug, `/courses/${courseId}`));
  }

  const firstLesson = (course.Season ?? [])
    .flatMap((season) => season.Lesson ?? [])
    .find((lesson) => lesson.is_published !== false);

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
