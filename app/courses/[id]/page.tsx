/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CourseCard } from "@/components/courses/course-card";
import { CourseDetailTabs } from "@/components/courses/course-detail-tabs";
import { CourseHero } from "@/components/courses/course-hero";
import { PurchasePanel } from "@/components/courses/purchase-panel";
import {
  getCourses,
  getCurrentUser,
  getEnrollments,
  getPublicCourseDetail,
  getTutoringOffersPublic,
  getCourseOfferingsPublic,
  getCoursePaymentPlans,
} from "@/lib/api/server";
import { getAcademyContext } from "@/lib/store-context";
import { resolveAcademyForRequest } from "@/lib/courses/academy-context";
import {
  buildAcademyPath,
  resolveAssetUrl,
  truncate,
  buildOgImageUrl,
} from "@/lib/utils";
import { t } from "@/lib/i18n/server-translations";
import { buildContentStats, buildCurriculum } from "@/lib/courses/curriculum";
import { buildPurchaseOptions } from "@/lib/courses/purchase-options";
import {
  formatAccessTerm,
  formatMinutes,
} from "@/components/courses/curriculum/format";
import { buildCourseJsonLd, buildBreadcrumbJsonLd } from "@/lib/seo/course-json-ld";
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

  const description = truncate(
    course.short_description || course.description || course.title,
    160,
  );

  return {
    title: course.title,
    description,
    alternates: { canonical: ctx.canonicalUrl },
    openGraph: {
      type: "article",
      title: course.title,
      description,
      url: ctx.canonicalUrl,
      images: [
        resolveAssetUrl(course.Image?.publicUrl) ??
          buildOgImageUrl(course.title, description),
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: course.title,
      description,
    },
  };
}

export default async function CourseDetailPage({ params }: { params: PageParams }) {
  const { id } = await params;
  const storeContext = await getAcademyContext();
  const buildPath = (path: string) =>
    buildAcademyPath(storeContext.isSubdomain ? null : storeContext.slug, path);

  const [course, user, tutoringOffers, courseOfferings, paymentPlans, seoCtx] =
    await Promise.all([
      getPublicCourseDetail(id),
      getCurrentUser().catch(() => null),
      getTutoringOffersPublic(id).catch(() => []),
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
  const stats = buildContentStats(seasons, course.lessons_count, course.duration);
  const options = buildPurchaseOptions(
    course,
    courseOfferings,
    paymentPlans,
    tutoringOffers,
  );

  // Owning the course replaces the whole buy box with a "keep going" link.
  const enrollment = user
    ? await getEnrollments({ course_id: course.id, limit: 1 }).catch(() => null)
    : null;
  const isEnrolled = Boolean(enrollment?.enrollments?.length);

  const coverUrl = resolveAssetUrl(course.Image?.publicUrl) ?? "/globe.svg";
  const videoUrl = resolveAssetUrl(course.Video?.publicUrl);
  const avatarUrl = resolveAssetUrl(course.author?.Image?.publicUrl);
  const learnPath = buildPath(`/learn/${course.id}`);

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
        accessLabel={formatAccessTerm(course.access_duration_days, language, translate)}
        durationLabel={formatMinutes(stats.totalMinutes, language, translate)}
        avatarUrl={avatarUrl}
      />

      <div className="relative z-10 -mt-24 grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          <div className="cd-preview-card group relative">
            {videoUrl ? (
              <video
                src={videoUrl}
                controls
                poster={coverUrl}
                className="h-full w-full object-cover"
              />
            ) : (
              <>
                <img
                  src={coverUrl}
                  alt={course.Image?.alt ?? course.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="cd-preview-overlay" />
              </>
            )}
            {stats.previewCount > 0 && (
              <span className="cd-preview-label absolute bottom-4 start-4 rounded-full px-3 py-1.5 text-sm font-bold">
                {translate("courses.freePreview")}
              </span>
            )}
          </div>

          <div className="mt-7">
            <CourseDetailTabs
              course={course}
              isLoggedIn={!!user}
              previewBasePath={learnPath}
              prerequisiteHref={
                course.PrerequisiteCourse
                  ? buildPath(`/courses/${course.PrerequisiteCourse.id}`)
                  : null
              }
              instructorAvatarUrl={avatarUrl}
            />
          </div>
        </div>

        <aside className="lg:sticky lg:top-[86px]">
          <PurchasePanel
            options={options}
            language={language}
            currencyConfig={currencyConfig}
            loginHref={buildPath(`/auth/login?redirect=/courses/${course.id}`)}
            continueHref={isEnrolled ? learnPath : null}
          />
        </aside>
      </div>

      {relatedCourses?.courses?.filter((c) => c.id !== course.id).length ? (
        <section className="mt-16 space-y-4">
          <h2 className="text-2xl font-bold tracking-tight text-(--theme-foreground)">
            {translate("courses.youMightAlsoLike")}
          </h2>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {relatedCourses.courses
              .filter((item) => item.id !== course.id)
              .map((item) => (
                <CourseCard
                  key={item.id}
                  course={item}
                  storeSlug={storeContext.isSubdomain ? null : storeContext.slug}
                />
              ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
