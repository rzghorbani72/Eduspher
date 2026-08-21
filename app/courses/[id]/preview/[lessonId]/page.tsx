import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FreeLessonView } from "@/components/courses/free-lesson-view";
import { getPublicCourseDetail, getPublicLesson } from "@/lib/api/server";
import { resolveAcademyForRequest } from "@/lib/courses/academy-context";
import { getAcademyContext } from "@/lib/store-context";
import { getSeoRequestContext } from "@/lib/seo/request-context";
import { t } from "@/lib/i18n/server-translations";
import { buildAcademyPath, truncate } from "@/lib/utils";

type PageParams = Promise<{ id: string; lessonId: string }>;

export async function generateMetadata({
  params,
}: {
  params: PageParams;
}): Promise<Metadata> {
  const { id, lessonId } = await params;
  const [lesson, course, ctx] = await Promise.all([
    getPublicLesson(lessonId),
    getPublicCourseDetail(id),
    getSeoRequestContext(),
  ]);
  if (!lesson) return { title: "404" };

  const description = truncate(
    lesson.description || course?.short_description || lesson.title,
    160,
  );
  return {
    title: `${lesson.title} — ${course?.title ?? ""}`.trim(),
    description,
    alternates: { canonical: ctx.canonicalUrl },
  };
}

/**
 * Public free-lesson page. A lesson marked free is part of the sales pitch, so
 * it must play for anyone — no account, no enrollment. The paid learning
 * experience (progress, quizzes, assignments) stays at /learn.
 */
export default async function FreeLessonPreviewPage({
  params,
}: {
  params: PageParams;
}) {
  const { id, lessonId } = await params;
  const storeContext = await getAcademyContext();
  const [lesson, course] = await Promise.all([
    getPublicLesson(lessonId),
    getPublicCourseDetail(id),
  ]);

  // The backend only serves free, published lessons here; the course check just
  // keeps the URL honest so a lesson cannot be shown under another course.
  if (!lesson || !course || String(lesson.course_id ?? id) !== course.id) {
    notFound();
  }

  const { language } = await resolveAcademyForRequest(null, storeContext.slug);
  const coursePath = buildAcademyPath(
    storeContext.isSubdomain ? null : storeContext.slug,
    `/courses/${course.id}`,
  );

  return (
    <FreeLessonView
      lesson={lesson}
      courseTitle={course.title}
      coursePath={coursePath}
      labels={{
        badge: t("courses.badgePreview", language),
        notice: t("courses.freeLessonNotice", language),
        back: t("courses.backToCourse", language),
        cta: t("courses.viewCourse", language),
        videoUnsupported: t("courses.videoNotSupported", language),
        unavailable: t("learning.lessonUnavailable", language),
      }}
    />
  );
}
