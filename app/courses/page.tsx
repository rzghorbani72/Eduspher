import type { Metadata } from "next";
import Link from "@/components/ui/link";
import { BookOpen } from "lucide-react";
import { redirect } from "next/navigation";

import { TemplatedCourseCard } from "@/components/courses/templated-course-card";
import { COURSE_CARD_GRID_CLASS } from "@/components/courses/course-card-layout";
import { CourseFilters } from "@/components/courses/course-filters";
import { CourseSearch } from "@/components/courses/course-search";
import { EmptyState } from "@/components/ui/empty-state";
import {
  getCourses,
  getCategories,
  getCurrentAcademy,
  getAcademyBySlug,
} from "@/lib/api/server";
import { buildAcademyPath, toPersianDigits } from "@/lib/utils";
import { getAcademyContext } from "@/lib/store-context";
import { getAcademyLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/server-translations";
import { buildSiteMetadata } from "@/lib/seo/build-metadata";
import { getSeoRequestContext } from "@/lib/seo/request-context";

type SearchParams = Promise<{
  q?: string;
  page?: string;
  order_by?: string;
  category_id?: string;
  is_free?: string;
}>;

const pageSize = 9;

const parseNumber = (value?: string) => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parseBoolean = (value?: string) => {
  if (!value) return undefined;
  return value === "true" || value === "1";
};

const buildQueryString = (
  params: Record<string, string | number | boolean | undefined>,
) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    query.set(key, String(value));
  });
  const qs = query.toString();
  return qs ? `?${qs}` : "";
};

/**
 * Platform root must not rank a course catalog — that H1 was competing with
 * the Mentoma homepage as a separate SERP result. Academies keep /courses.
 */
export async function generateMetadata(): Promise<Metadata> {
  const ctx = await getSeoRequestContext();
  if (ctx.isPlatform) {
    return {
      title: "Courses",
      robots: { index: false, follow: false },
    };
  }

  const store = await getAcademyContext();
  let academyName: string | null = null;
  if (store.slug) {
    const academy = await getAcademyBySlug(store.slug).catch(() => null);
    academyName = academy?.name ?? null;
  }
  const language = getAcademyLanguage(null, null);
  const translate = (key: string) => t(key, language);
  const title = academyName
    ? `${translate("courses.allCourses")} | ${academyName}`
    : translate("courses.allCourses");

  return buildSiteMetadata({
    title,
    description: translate("courses.heroSubtitle"),
    ctx,
  });
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const seoCtx = await getSeoRequestContext();
  if (seoCtx.isPlatform) {
    redirect("/academies");
  }

  const storeContext = await getAcademyContext();
  const buildPath = (path: string) =>
    buildAcademyPath(storeContext.isSubdomain ? null : storeContext.slug, path);
  const params = await searchParams;
  const query = params?.q ?? "";
  const page = parseNumber(params?.page) ?? 1;
  const orderBy = params?.order_by;
  const categoryId = params?.category_id || undefined;
  const isFree = parseBoolean(params?.is_free);

  const [coursePayload, categories, currentAcademy] = await Promise.all([
    getCourses({
      search: query || undefined,
      page,
      limit: pageSize,
      order_by: orderBy || undefined,
      published: true,
      category_id: categoryId,
      is_free: isFree,
    }).catch(() => null),
    getCategories().catch(() => []),
    getCurrentAcademy().catch(() => null),
  ]);

  const courses = coursePayload?.courses ?? [];
  const pagination = coursePayload?.pagination;
  let storeForLang = currentAcademy;
  if (!storeForLang && storeContext.slug) {
    storeForLang = await getAcademyBySlug(storeContext.slug).catch(() => null);
  }
  const language = getAcademyLanguage(
    storeForLang?.language || null,
    storeForLang?.country_code || null,
  );
  const translate = (key: string) => t(key, language);

  const academyName = (storeForLang as { name?: string } | null)?.name ?? null;
  const total = pagination?.total ?? courses.length;

  return (
    <div className="course-catalog relative space-y-7">
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-gradient-to-br from-[var(--theme-primary)]/8 to-[var(--theme-secondary)]/8 rounded-full blur-3xl animate-float-slow" />
        <div
          className="absolute bottom-0 left-1/4 w-96 h-96 bg-gradient-to-br from-[var(--theme-secondary)]/8 to-[var(--theme-accent)]/8 rounded-full blur-3xl animate-float-slow"
          style={{ animationDelay: "1.5s" }}
        />
      </div>

      <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {academyName ? (
          <span className="inline-block rounded-full bg-(--cc-brand-soft) px-3.5 py-1.5 text-[13px] font-extrabold text-(--cc-brand)">
            {academyName}
          </span>
        ) : null}
        <h1 className="mt-4 max-w-3xl text-balance text-4xl font-black leading-tight tracking-tight text-(--cc-ink) sm:text-5xl">
          {translate("courses.heroTitle")}{" "}
          <span className="bg-linear-to-br from-(--theme-primary) to-(--theme-secondary) bg-clip-text text-transparent">
            {translate("courses.heroTitleAccent")}
          </span>
        </h1>
        <p className="mt-4 max-w-xl text-lg text-(--cc-ink-2)">
          {translate("courses.heroSubtitle")}
        </p>
        <CourseSearch initialQuery={query} />
      </section>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
        <CourseFilters
          categories={categories}
          initialCategoryId={categoryId}
          initialOrderBy={orderBy}
          initialIsFree={isFree}
        />
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-[22px] font-black text-(--cc-ink)">
          {toPersianDigits(total, language)}
        </span>
        <span className="text-[15px] font-semibold text-(--cc-ink-3)">
          {translate("courses.coursesFound")}
        </span>
      </div>

      {courses.length > 0 ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <div className={COURSE_CARD_GRID_CLASS}>
            {courses.map((course, index) => (
              <div
                key={course.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TemplatedCourseCard
                  course={course}
                  index={index}
                  storeSlug={
                    storeContext.isSubdomain ? null : storeContext.slug
                  }
                />
              </div>
            ))}
          </div>
          {pagination &&
          (pagination.pages > 1 || (pagination.totalPages ?? 0) > 1) ? (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
              {pagination.hasPreviousPage && (
                <Link
                  href={`${buildPath("/courses")}${buildQueryString({
                    q: query || undefined,
                    order_by: orderBy || undefined,
                    category_id: categoryId,
                    is_free: isFree,
                    page: page - 1,
                  })}`}
                  className="inline-flex h-10 min-w-[2.5rem] items-center justify-center rounded-full border bg-(--cc-card) border-(--cc-bd) px-3 text-sm font-semibold text-(--cc-ink) transition-all hover:scale-105 hover:border-(--cc-brand)"
                >
                  ←
                </Link>
              )}
              {Array.from(
                { length: pagination.totalPages ?? pagination.pages },
                (_, index) => {
                  const targetPage = index + 1;
                  const href = buildQueryString({
                    q: query || undefined,
                    order_by: orderBy || undefined,
                    category_id: categoryId,
                    is_free: isFree,
                    page: targetPage,
                  });

                  const isActive = targetPage === page;
                  return (
                    <Link
                      key={targetPage}
                      href={`${buildPath("/courses")}${href}`}
                      className={`inline-flex h-10 min-w-[2.5rem] items-center justify-center rounded-full px-3 text-sm font-semibold transition-all ${
                        isActive
                          ? "bg-(--cc-brand) text-(--theme-on-primary) shadow-lg scale-105"
                          : "border bg-(--cc-card) border-(--cc-bd) text-(--cc-ink) hover:scale-105 hover:border-(--cc-brand)"
                      }`}
                    >
                      {toPersianDigits(targetPage, language)}
                    </Link>
                  );
                },
              )}
              {pagination.hasNextPage && (
                <Link
                  href={`${buildPath("/courses")}${buildQueryString({
                    q: query || undefined,
                    order_by: orderBy || undefined,
                    category_id: categoryId,
                    is_free: isFree,
                    page: page + 1,
                  })}`}
                  className="inline-flex h-10 min-w-[2.5rem] items-center justify-center rounded-full border bg-(--cc-card) border-(--cc-bd) px-3 text-sm font-semibold text-(--cc-ink) transition-all hover:scale-105 hover:border-(--cc-brand)"
                >
                  →
                </Link>
              )}
            </div>
          ) : null}
        </div>
      ) : (
        <EmptyState
          icon={<BookOpen size={28} />}
          title={translate("courses.noCoursesFound")}
          description={translate("courses.noCoursesDescription")}
          action={
            <Link
              href={buildPath("/courses")}
              className="inline-flex h-11 items-center rounded-full bg-[var(--theme-primary)] px-6 text-sm font-semibold text-[var(--theme-on-primary)] shadow-lg shadow-[var(--theme-primary)]/30 transition-all hover:scale-105 hover:bg-[var(--theme-primary)]/90 hover:shadow-xl hover:shadow-[var(--theme-primary)]/40"
            >
              {translate("pages.resetFilters")}
            </Link>
          }
        />
      )}
    </div>
  );
}
