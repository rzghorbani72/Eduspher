/* eslint-disable @next/next/no-img-element */
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CourseCard } from "@/components/courses/course-card";
import { CourseCurriculum } from "@/components/courses/course-curriculum";
import { CourseQnA } from "@/components/courses/course-qna";
import { RelatedProducts } from "@/components/courses/RelatedProducts";
import { CartButton } from "@/components/cart/cart-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { getCourseById, getCourses, getProducts, getCurrentUser, getSchoolBySlug, getCurrentSchool } from "@/lib/api/server";
import { getSchoolContext } from "@/lib/school-context";
import { buildSchoolPath, resolveAssetUrl, formatCurrencyWithSchool } from "@/lib/utils";
import { getSchoolLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/server-translations";

type PageParams = Promise<{
  id: string;
}>;

const detailItems = (
  course: Awaited<ReturnType<typeof getCourseById>>,
  school?: { currency?: string; currency_symbol?: string; currency_position?: "before" | "after" } | null,
  translate?: (key: string) => string,
  language?: string
) => {
  if (!course) return [];
  const t = translate || ((key: string) => key);
  const hasDiscount = course.original_price && course.original_price > course.price;
  const priceDisplay = course.is_free
    ? t("courses.free")
    : hasDiscount
    ? (
        <div className="flex flex-col items-end gap-1">
          <span className="text-slate-500 line-through dark:text-slate-400">
            {formatCurrencyWithSchool(course.original_price || 0, school, undefined, language)}
          </span>
          <span className="text-[var(--theme-primary)] font-semibold">
            {formatCurrencyWithSchool(course.price, school, undefined, language)}
          </span>
        </div>
      )
    : formatCurrencyWithSchool(course.price, school, undefined, language);
  return [
    {
      label: t("courses.certificate"),
      value: course.is_certificate ? t("courses.certificateAwarded") : t("courses.certificateNotIncluded"),
    },
    {
      label: t("courses.format"),
      value: course.is_free ? t("courses.formatSelfPaced") : t("courses.formatMentorGuided"),
    },
    {
      label: t("courses.price"),
      value: priceDisplay,
    },
    {
      label: t("courses.category"),
      value: course.category?.name ?? t("courses.categoryGeneral"),
    },
  ];
};

export default async function CourseDetailPage({ params }: { params: PageParams }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("jwt");
  const schoolContext = await getSchoolContext();
  const buildPath = (path: string) => buildSchoolPath(schoolContext.slug, path);

  const [course, user] = await Promise.all([
    getCourseById(id),
    getCurrentUser().catch(() => null),
  ]);
  const school = user?.currentSchool || null;

  // Get school language for translations
  let currentSchool = await getCurrentSchool().catch(() => null);
  if (!currentSchool && schoolContext.slug) {
    currentSchool = await getSchoolBySlug(schoolContext.slug).catch(() => null);
  }
  const language = getSchoolLanguage(currentSchool?.language || null, currentSchool?.country_code || null);
  const translate = (key: string) => t(key, language);

  if (!course) {
    if (!token?.value) {
      return (
        <EmptyState
          title={translate("courses.signInToView")}
          description={translate("courses.signInToViewDescription")}
          action={
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href={buildPath("/auth/login")}
                className="inline-flex h-11 items-center rounded-full bg-slate-900 px-6 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-white"
              >
                {translate("auth.login")}
              </Link>
              <Link
                href={buildPath("/auth/login")}
                className="inline-flex h-11 items-center rounded-full border border-slate-200 px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900"
              >
                {translate("auth.register")}
              </Link>
            </div>
          }
        />
      );
    }
    return notFound();
  }

  const normalizedCourse = {
    ...course,
    access_control: undefined,
    seasons: (course.seasons ?? []).map((season) => ({
      ...season,
      lessons: season.lessons ?? [],
    })),
  };

  const coverUrl = resolveAssetUrl(normalizedCourse.cover?.url) ?? "/globe.svg";
  const videoUrl = resolveAssetUrl(normalizedCourse.video?.url);
  const audioUrl = resolveAssetUrl(normalizedCourse.audio?.url);
  const documentUrl = resolveAssetUrl(normalizedCourse.document?.url);

  const [relatedCourses, relatedProducts] = await Promise.all([
    getCourses({
      published: true,
      limit: 3,
      order_by: "NEWEST",
      category_id: normalizedCourse.category?.id,
    }).catch(() => null),
    getProducts({
      published: true,
      limit: 3,
      order_by: "NEWEST",
      course_id: normalizedCourse.id,
    }).catch(() => null),
  ]);

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr] animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-slate-500 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
            {normalizedCourse.category ? <Badge variant="soft">{normalizedCourse.category.name}</Badge> : null}
            {normalizedCourse.is_featured ? <Badge variant="warning">{translate("courses.featured")}</Badge> : null}
            {normalizedCourse.is_certificate ? <Badge variant="success">{translate("courses.certificate")}</Badge> : null}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
            {normalizedCourse.title}
          </h1>
          {normalizedCourse.short_description ? (
            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
              {normalizedCourse.short_description}
            </p>
          ) : null}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-950 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-250">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{translate("courses.whatYouWillLearn")}</h2>
            {normalizedCourse.description ? (
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {normalizedCourse.description}
              </p>
            ) : (
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                {translate("courses.detailedCurriculumComingSoon")}
              </p>
            )}
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
            <CourseCurriculum courseTitle={normalizedCourse.title} seasons={normalizedCourse.seasons ?? []} />
          </div>
        </div>
        <aside className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500 delay-200">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg transition-all hover:shadow-xl dark:border-slate-800 dark:bg-slate-950">
            <div className="relative overflow-hidden">
              <img src={coverUrl} alt={normalizedCourse.title} className="h-56 w-full object-cover transition-transform duration-500 hover:scale-105" />
            </div>
            <div className="space-y-4 p-5">
              <div className="grid gap-3 text-sm text-slate-600 dark:text-slate-300">
                {detailItems(normalizedCourse, school, translate, language).map((item) => (
                  <div key={item.label} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0 dark:border-slate-800">
                    <span className="font-medium text-slate-500 dark:text-slate-400">
                      {item.label}
                    </span>
                    {typeof item.value === 'string' ? (
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {item.value}
                      </span>
                    ) : (
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {item.value}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <Link
                  href={buildPath(`/checkout?course=${normalizedCourse.id}`)}
                  className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[var(--theme-primary)] text-sm font-semibold text-white shadow-lg shadow-[var(--theme-primary)]/30 transition-all hover:scale-105 hover:bg-[var(--theme-primary)]/90 hover:shadow-xl hover:shadow-[var(--theme-primary)]/40"
                >
                  {translate("courses.enrollNow")}
                </Link>
                {!normalizedCourse.is_free && (
                  <CartButton course={normalizedCourse} />
                )}
              </div>
              <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                {translate("courses.satisfactionGuarantee")}
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{translate("courses.resources")}</h2>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
              {videoUrl ? (
                <li>
                  <Link className="group inline-flex items-center font-semibold text-[var(--theme-primary)] transition-all hover:translate-x-1 hover:underline" href={videoUrl}>
                    {translate("courses.watchTrailer")} →
                  </Link>
                </li>
              ) : null}
              {audioUrl ? (
                <li>
                  <Link className="group inline-flex items-center font-semibold text-[var(--theme-primary)] transition-all hover:translate-x-1 hover:underline" href={audioUrl}>
                    {translate("courses.listenToSample")} →
                  </Link>
                </li>
              ) : null}
              {documentUrl ? (
                <li>
                  <Link className="group inline-flex items-center font-semibold text-[var(--theme-primary)] transition-all hover:translate-x-1 hover:underline" href={documentUrl}>
                    {translate("courses.downloadSyllabus")} →
                  </Link>
                </li>
              ) : null}
              {!videoUrl && !audioUrl && !documentUrl ? (
                <li className="text-xs text-slate-500 dark:text-slate-400">
                  {translate("courses.additionalResources")}
                </li>
              ) : null}
            </ul>
          </div>
        </aside>
      </section>


      {relatedProducts?.products?.length ? (
        <RelatedProducts
          products={relatedProducts.products}
          schoolSlug={schoolContext.slug}
          school={school}
        />
      ) : null}

      <CourseQnA courseId={normalizedCourse.id} isLoggedIn={!!user} userRole={user?.role} />

      {relatedCourses?.courses?.length ? (
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{translate("courses.youMightAlsoLike")}</h2>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {relatedCourses.courses
              .filter((item) => item.id !== normalizedCourse.id)
              .map((item, index) => (
                <div
                  key={item.id}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CourseCard course={item} schoolSlug={schoolContext.slug} />
                </div>
              ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

