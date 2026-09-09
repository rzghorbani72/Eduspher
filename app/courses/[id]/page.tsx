import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TemplatedCourseCard } from "@/components/courses/templated-course-card";
import { CourseDetailTabs } from "@/components/courses/course-detail-tabs";
import { CourseHero } from "@/components/courses/course-hero";
import { CoursePreviewPlayer } from "@/components/courses/course-preview-player";
import {
  PreviewPlayerProvider,
  type PreviewMedia,
} from "@/components/courses/preview-player-context";
import { PurchasePanel } from "@/components/courses/purchase-panel";
import { TutoringGroupsSection } from "@/components/courses/tutoring-groups-section";
import {
  getCourses,
  getCurrentUser,
  getEnrollments,
  getPublicCourseDetail,
  getTutoringGroupsPublic,
  getTutoringOffersPublic,
  getCourseOfferingsPublic,
  getCoursePaymentPlans,
  getPublicLesson,
} from "@/lib/api/server";
import { getCourseAccess } from "@/lib/api/account-server";
import { getAcademyContext } from "@/lib/store-context";
import { resolveAcademyForRequest } from "@/lib/courses/academy-context";
import { buildAcademyPath, resolveAssetUrl, truncate } from "@/lib/utils";
import { markdownToPlainText } from "@/lib/markdown";
import { getAcademyShareImageUrl } from "@/lib/seo/share-image";
import { t } from "@/lib/i18n/server-translations";
import { buildContentStats, buildCurriculum } from "@/lib/courses/curriculum";
import { isLiveCourse } from "@/lib/courses/live-course";
import { buildPurchaseOptions } from "@/lib/courses/purchase-options";
import {
  formatAccessTerm,
  formatMinutes,
} from "@/components/courses/curriculum/format";
import {
  buildCourseJsonLd,
  buildBreadcrumbJsonLd,
} from "@/lib/seo/course-json-ld";
import { getSeoRequestContext } from "@/lib/seo/request-context";

type PageParams = Promise<{ id: string }>;

export async function generateMetadata({
  params,
}: {
  params: PageParams;
}): Promise<Metadata> {
  const { id } = await params;
  const [course, ctx] = await Promise.all([
    getPublicCourseDetail(id),
    getSeoRequestContext(),
  ]);
  if (!course) return { title: "404" };

  // The author's own search metadata wins; the course copy is the fallback.
  const title = course.meta_title?.trim() || course.title;
  const description = truncate(
    course.meta_description?.trim() ||
      markdownToPlainText(
        course.short_description || course.description || course.title,
      ),
    160,
  );
  const keywords = course.keywords ?? [];

  // Course cover first; the academy's share image only when the course has none.
  const shareImage =
    resolveAssetUrl(course.Image?.publicUrl) ??
    (await getAcademyShareImageUrl());

  return {
    title,
    description,
    ...(keywords.length > 0 ? { keywords } : {}),
    alternates: { canonical: ctx.canonicalUrl },
    openGraph: {
      type: "article",
      title,
      description,
      url: ctx.canonicalUrl,
      ...(shareImage ? { images: [shareImage] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(shareImage ? { images: [shareImage] } : {}),
    },
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: PageParams;
}) {
  const { id } = await params;
  const storeContext = await getAcademyContext();
  const buildPath = (path: string) =>
    buildAcademyPath(storeContext.isSubdomain ? null : storeContext.slug, path);

  const [
    course,
    user,
    tutoringOffers,
    tutoringGroups,
    courseOfferings,
    paymentPlans,
    seoCtx,
  ] = await Promise.all([
    getPublicCourseDetail(id),
    getCurrentUser().catch(() => null),
    getTutoringOffersPublic(id).catch(() => []),
    getTutoringGroupsPublic(id).catch(() => []),
    getCourseOfferingsPublic(id).catch(() => []),
    getCoursePaymentPlans(id),
    getSeoRequestContext(),
  ]);

  if (!course) return notFound();

  const { academy, language, currencyConfig } = await resolveAcademyForRequest(
    user,
    storeContext.slug,
  );
  const translate = (key: string) => t(key, language);

  const seasons = buildCurriculum(course);
  const stats = buildContentStats(
    seasons,
    course.lessons_count,
    course.duration,
  );
  const options = buildPurchaseOptions(
    course,
    courseOfferings,
    paymentPlans,
    tutoringOffers,
  );

  // Holding the course replaces the whole buy box with a "keep going" link.
  // A student can hold it without ever paying — a teacher or manager grant, or
  // a student group they belong to — so the canonical access list decides,
  // not the enrollment rows.
  const [enrollment, courseAccess] = await Promise.all([
    user
      ? getEnrollments({ course_id: course.id, limit: 1 }).catch(() => null)
      : null,
    user ? getCourseAccess() : [],
  ]);
  // Staff get the whole academy's enrollments from this endpoint, so the row
  // must belong to the viewer before it counts as "I own this course".
  const myEnrollment = user
    ? enrollment?.enrollments?.find(
        (item) => String(item.profile_id) === String(user.id),
      )
    : undefined;
  const isEnrolled = Boolean(
    user &&
      (courseAccess.some((row) => row.course_id === course.id) ||
        (myEnrollment &&
          (myEnrollment.status === "ACTIVE" ||
            myEnrollment.status === "COMPLETED"))),
  );
  const progressPercent =
    myEnrollment && Number.isFinite(myEnrollment.progress_percent)
      ? Math.min(100, Math.max(0, Math.round(myEnrollment.progress_percent)))
      : null;

  const coverUrl = resolveAssetUrl(course.Image?.publicUrl) ?? "/globe.svg";
  const promoVideoId = course.Video?.id ?? null;

  // Free lessons play inside the cover player, so their media is loaded with
  // the page. The endpoint serves free lessons only — nothing paid can leak.
  const freeLessons = await Promise.all(
    seasons
      .flatMap((season) => season.lessons)
      .filter((lesson) => lesson.isPreview)
      .map((lesson) => getPublicLesson(lesson.id)),
  );
  const previewMedia: PreviewMedia[] = freeLessons
    .filter((lesson) => lesson !== null)
    .map((lesson) => ({
      lessonId: lesson.id,
      title: lesson.title,
      description: lesson.description ?? null,
      videoId: lesson.Video?.id ?? null,
      audioUrl: resolveAssetUrl(lesson.Audio?.publicUrl),
      content: lesson.content ?? null,
    }))
    .filter((item) => item.videoId || item.audioUrl || item.content);
  // No promo video? The first free video is the next best pitch, so it loads
  // in the cover instead of a dead image.
  const defaultPreviewId = promoVideoId
    ? null
    : (previewMedia.find((item) => item.videoId)?.lessonId ?? null);
  const avatarUrl = resolveAssetUrl(course.author?.Image?.publicUrl);
  const learnPath = buildPath(`/learn/${course.id}`);
  // Free lessons open the full learning page for everyone, enrolled or not —
  // the page itself only requires sign-in, not a purchase, for a free lesson.
  const previewBasePath = learnPath;

  const relatedCourses = await getCourses({
    published: true,
    limit: 4,
    order_by: "NEWEST",
    category_id: course.Category?.id,
  }).catch(() => null);

  const jsonLd = buildCourseJsonLd({
    course,
    stats,
    canonicalUrl: seoCtx.canonicalUrl,
    academyName: academy?.name ?? "",
    currency: currencyConfig?.currency ?? "IRR",
    imageUrl: course.Image?.publicUrl ? coverUrl : null,
    lowPrice: options.length ? Math.min(...options.map((o) => o.price)) : null,
  });
  const origin = new URL(seoCtx.canonicalUrl).origin;
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    {
      name: translate("pages.courseCatalogue"),
      url: `${origin}${buildPath("/courses")}`,
    },
    { name: course.title, url: seoCtx.canonicalUrl },
  ]);

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <CourseHero
        course={course}
        stats={stats}
        language={language}
        coursesHref={buildPath("/courses")}
        accessLabel={formatAccessTerm(
          course.access_duration_days,
          language,
          translate,
        )}
        durationLabel={formatMinutes(stats.totalMinutes, language, translate)}
        avatarUrl={avatarUrl}
      />

      <PreviewPlayerProvider
        media={previewMedia}
        defaultLessonId={defaultPreviewId}
      >
        <div className="relative z-10 -mt-24 grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_380px]">
          <div className="min-w-0">
            <CoursePreviewPlayer
              promoVideoId={promoVideoId}
              coverUrl={coverUrl}
              coverAlt={course.Image?.alt ?? course.title}
              hasPreviewLessons={stats.previewCount > 0}
            />

            <div className="mt-7">
              <CourseDetailTabs
                course={course}
                isLoggedIn={!!user}
                previewBasePath={previewBasePath}
                hasLessonAccess={isEnrolled}
                prerequisiteHref={
                  course.PrerequisiteCourse
                    ? buildPath(`/courses/${course.PrerequisiteCourse.id}`)
                    : null
                }
                instructorAvatarUrl={avatarUrl}
              />
            </div>

            {isLiveCourse(course) && tutoringGroups.length ? (
              <div className="mt-10">
                <TutoringGroupsSection
                  groups={tutoringGroups}
                  currencyConfig={currencyConfig}
                  language={language}
                  loginHref={buildPath(
                    `/auth/login?redirect=/courses/${course.id}`,
                  )}
                />
              </div>
            ) : isLiveCourse(course) ? (
              <p className="mt-10 rounded-2xl border border-dashed border-(--theme-border-color) p-6 text-center text-sm text-muted">
                {translate("courses.liveNoClassesYet")}
              </p>
            ) : null}
          </div>

          <aside className="lg:sticky lg:top-[86px]">
            <PurchasePanel
              options={options}
              language={language}
              currencyConfig={currencyConfig}
              loginHref={buildPath(
                `/auth/login?redirect=/courses/${course.id}`,
              )}
              continueHref={isEnrolled ? learnPath : null}
              learnHref={learnPath}
              liveClassesHref={buildPath("/account/classes")}
              tutoringHref={buildPath("/account/tutoring")}
              access={
                courseAccess.find((row) => row.course_id === course.id) ?? null
              }
              stats={stats}
              progressPercent={isEnrolled ? progressPercent : null}
              isCertificate={Boolean(course.is_certificate)}
            />
          </aside>
        </div>
      </PreviewPlayerProvider>

      {relatedCourses?.courses?.filter((c) => c.id !== course.id).length ? (
        <section className="mt-16 space-y-4">
          <h2 className="text-2xl font-bold tracking-tight text-(--theme-foreground)">
            {translate("courses.youMightAlsoLike")}
          </h2>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {relatedCourses.courses
              .filter((item) => item.id !== course.id)
              .map((item, index) => (
                <TemplatedCourseCard
                  key={item.id}
                  course={item}
                  index={index}
                  storeSlug={
                    storeContext.isSubdomain ? null : storeContext.slug
                  }
                />
              ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
