/* eslint-disable @next/next/no-img-element */
import { cookies } from "next/headers";
import Link from "@/components/ui/link";
import { notFound } from "next/navigation";

import { CourseCard } from "@/components/courses/course-card";
import { CourseDetailTabs } from "@/components/courses/course-detail-tabs";
import { CourseEnrollmentSidebar } from "@/components/courses/course-enrollment-sidebar";
import { TutoringOfferCard } from "@/components/courses/tutoring-offer-card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  getCourseById,
  getCourses,
  getCurrentUser,
  getAcademyBySlug,
  getCurrentAcademy,
  getTutoringOffersPublic,
} from "@/lib/api/server";
import { getAcademyContext } from "@/lib/store-context";
import {
  buildAcademyPath,
  resolveAssetUrl,
  formatCurrencyWithAcademy,
  toPersianDigits,
} from "@/lib/utils";
import { getAcademyLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/server-translations";

type PageParams = Promise<{ id: string }>;

export default async function CourseDetailPage({ params }: { params: PageParams }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("jwt");
  const storeContext = await getAcademyContext();
  const buildPath = (path: string) =>
    buildAcademyPath(storeContext.isSubdomain ? null : storeContext.slug, path);

  const [course, user, tutoringOffers] = await Promise.all([
    getCourseById(id),
    getCurrentUser().catch(() => null),
    getTutoringOffersPublic(id).catch(() => []),
  ]);

  let currentAcademy = await getCurrentAcademy().catch(() => null);
  if (!currentAcademy && storeContext.slug) {
    currentAcademy = await getAcademyBySlug(storeContext.slug).catch(() => null);
  }
  const language = getAcademyLanguage(
    currentAcademy?.language || null,
    currentAcademy?.country_code || null,
  );
  const translate = (key: string) => t(key, language);
  const storeConfig =
    user?.currentAcademy ||
    (currentAcademy as {
      currency?: string;
      currency_symbol?: string;
      currency_position?: "before" | "after";
      country_code?: string;
      language?: string;
    } | null);

  if (!course) {
    if (!token?.value) {
      return (
        <EmptyState
          title={translate("courses.signInToView")}
          description={translate("courses.signInToViewDescription")}
          action={
            <Link
              href={buildPath("/auth/login")}
              className="inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-on-primary shadow-lg shadow-primary/30 transition-all hover:scale-105 hover:opacity-90"
            >
              {translate("auth.login")}
            </Link>
          }
        />
      );
    }
    return notFound();
  }

  const coverUrl = resolveAssetUrl(course.Image?.publicUrl) ?? "/globe.svg";
  const videoUrl = resolveAssetUrl(course.Video?.publicUrl);
  const allLessons = course.Season?.flatMap((s) => s.Lesson ?? []) ?? [];
  const hasLive = allLessons.some(
    (l) => l.lesson_type === "LIVE" || Boolean(l.LiveSession),
  );
  const lessonCount = course.lessons_count ?? allLessons.length;
  const durationHours = course.duration ? Math.round(course.duration / 60) : null;

  const priceDisplay = course.is_free
    ? translate("courses.free")
    : formatCurrencyWithAcademy(course.price, storeConfig, undefined, language);

  const relatedCourses = await getCourses({
    published: true,
    limit: 4,
    order_by: "NEWEST",
    category_id: course.Category?.id,
  }).catch(() => null);

  return (
    <div>
      {/* ── HERO: breaks out of the layout container ── */}
      <section className="cd-hero relative overflow-hidden -mt-8 sm:-mt-10 lg:-mt-12">
        <div className="cd-hero-orb-left" />
        <div className="cd-hero-orb-right" />

        <div className="relative mx-auto max-w-[1240px] px-4 pb-36 pt-10 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="cd-hero-breadcrumb mb-6 flex flex-wrap items-center gap-2 text-[13.5px]">
            <Link
              href={buildPath("/courses")}
              className="cd-hero-breadcrumb transition-colors hover:text-white"
            >
              {translate("pages.courseCatalogue") || "دوره‌ها"}
            </Link>
            {course.Category && (
              <>
                <span>/</span>
                <span className="cd-hero-breadcrumb-dim">{course.Category.name}</span>
              </>
            )}
            <span>/</span>
            <span className="font-semibold text-white">{course.title}</span>
          </nav>

          {/* Badges */}
          <div className="mb-5 flex flex-wrap items-center gap-2.5">
            {hasLive && (
              <span className="cd-live-badge flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-bold">
                <span className="cd-blink-dot h-2 w-2 rounded-full" />
                {translate("courses.liveSession")}
              </span>
            )}
            <span className="cd-white-badge rounded-full px-3 py-1.5 text-[13px] font-bold">
              {translate("courses.levelIntermediate")}
            </span>
            <span className="cd-white-badge rounded-full px-3 py-1.5 text-[13px] font-bold">
              {translate("courses.lastUpdated")}
            </span>
            {course.is_certificate && (
              <span className="cd-white-badge rounded-full px-3 py-1.5 text-[13px] font-bold">
                {translate("courses.certificate") || "گواهی پایان دوره"}
              </span>
            )}
            {course.is_featured && (
              <span className="cd-white-badge rounded-full px-3 py-1.5 text-[13px] font-bold">
                {translate("courses.featured") || "ویژه"}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="m-0 max-w-[780px] text-[clamp(26px,4.6vw,46px)] font-black leading-tight tracking-tight">
            {course.title}
          </h1>

          {course.short_description && (
            <p className="cd-hero-desc mt-3.5 max-w-[680px] text-lg leading-relaxed">
              {course.short_description}
            </p>
          )}

          {/* Stats row */}
          <div className="mt-6 flex flex-wrap items-center gap-5">
            {course.rating != null && (
              <div className="flex items-center gap-1.5">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="#f5a623" stroke="#f5a623">
                  <path d="m12 2 3 6.5 7 .8-5.2 4.8 1.4 6.9L12 17.6 5.8 21l1.4-6.9L2 9.3l7-.8z" />
                </svg>
                <span className="cd-price text-base font-extrabold">
                  {toPersianDigits(course.rating.toFixed(1), language)}
                </span>
                {course.rating_count != null && (
                  <span className="cd-hero-breadcrumb cd-price text-sm">
                    ({toPersianDigits(course.rating_count, language)} {translate("courses.reviewsWord")})
                  </span>
                )}
              </div>
            )}
            {course.students_count != null && (
              <div className="cd-hero-stat-dim flex items-center gap-1.5 text-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 18v-2a4 4 0 0 0-8 0v2" />
                  <circle cx="12" cy="7" r="3.4" />
                </svg>
                <span className="cd-price">
                  {toPersianDigits(course.students_count.toLocaleString(), language)}
                </span>{" "}
                {translate("courses.students")}
              </div>
            )}
            {lessonCount > 0 && (
              <div className="cd-hero-stat-dim flex items-center gap-1.5 text-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="14" rx="2" />
                </svg>
                <span className="cd-price">{toPersianDigits(lessonCount, language)}</span>{" "}
                {translate("courses.lessons")}
                {durationHours ? (
                  <>
                    {" · "}
                    <span className="cd-price">{toPersianDigits(durationHours, language)}</span>{" "}
                    {translate("courses.hours")}
                  </>
                ) : null}
              </div>
            )}
          </div>

          {/* Teacher row */}
          {course.author && (
            <div className="mt-6 flex items-center gap-3">
              <span className="cd-teacher-avatar grid h-11 w-11 shrink-0 place-items-center rounded-full text-lg font-extrabold text-white">
                {course.author.display_name.charAt(0)}
              </span>
              <div>
                <div className="cd-hero-meta text-xs">
                  {translate("courses.instructor")}
                </div>
                <div className="text-base font-extrabold">{course.author.display_name}</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── BODY: two-column, overlaps the hero bottom ── */}
      <div className="relative z-10 -mt-24 grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_380px]">

        {/* LEFT COLUMN */}
        <div className="min-w-0">
          {/* Preview media */}
          <div className="cd-preview-card group relative">
            {videoUrl ? (
              <video src={videoUrl} controls className="h-full w-full object-cover" />
            ) : (
              <>
                <img
                  src={coverUrl}
                  alt={course.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="cd-preview-overlay" />
                {/* Center play button */}
                <span className="cd-play-btn absolute left-1/2 top-1/2 grid h-[68px] w-[68px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full transition-transform duration-300 group-hover:scale-110">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                {/* Free-preview label with duration */}
                <span className="cd-preview-label absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold">
                  {translate("courses.freePreview")} ·{" "}
                  <span className="cd-price">{toPersianDigits("2:40", language)}</span>
                </span>
              </>
            )}
          </div>

          {/* Tabs + content */}
          <div className="mt-7">
            <CourseDetailTabs
              course={course}
              isLoggedIn={!!user}
              lessonCount={lessonCount}
              durationHours={durationHours}
            />
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="lg:sticky lg:top-[86px]">
          <CourseEnrollmentSidebar
            isFree={course.is_free}
            basePrice={course.price}
            originalPrice={course.original_price ?? null}
            enrollHref={buildPath(`/checkout?course=${course.id}`)}
            language={language}
            currencyConfig={storeConfig}
            freePriceLabel={priceDisplay}
          />
          <TutoringOfferCard
            offers={tutoringOffers}
            language={language}
            currencyConfig={storeConfig}
            loginHref={buildPath(`/login?redirect=/courses/${course.id}`)}
          />
        </aside>
      </div>

      {/* ── RELATED COURSES ── */}
      {relatedCourses?.courses?.filter((c) => c.id !== course.id).length ? (
        <section className="mt-16 space-y-4">
          <h2 className="text-2xl font-bold tracking-tight text-(--theme-foreground)">
            {translate("courses.youMightAlsoLike")}
          </h2>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {relatedCourses.courses
              .filter((item) => item.id !== course.id)
              .map((item, index) => (
                <div
                  key={item.id}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CourseCard
                    course={item}
                    storeSlug={storeContext.isSubdomain ? null : storeContext.slug}
                  />
                </div>
              ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
