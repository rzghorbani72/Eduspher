import Link from "next/link";

import { CourseCard } from "@/components/courses/course-card";
import { CourseFilters } from "@/components/courses/course-filters";
import { EmptyState } from "@/components/ui/empty-state";
import { getCourses, getCategories, getCurrentUser, getCurrentStore, getStoreBySlug } from "@/lib/api/server";
import { buildStorePath } from "@/lib/utils";
import { getStoreContext } from "@/lib/store-context";
import { getStoreLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/server-translations";

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

const buildQueryString = (params: Record<string, string | number | boolean | undefined>) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    query.set(key, String(value));
  });
  const qs = query.toString();
  return qs ? `?${qs}` : "";
};

export default async function CoursesPage({ searchParams }: { searchParams: SearchParams }) {
  const storeContext = await getStoreContext();
  const buildPath = (path: string) => buildStorePath(storeContext.slug, path);
  const params = await searchParams;
  const query = params?.q ?? "";
  const page = parseNumber(params?.page) ?? 1;
  const orderBy = params?.order_by;
  const categoryId = parseNumber(params?.category_id);
  const isFree = parseBoolean(params?.is_free);

  const [coursePayload, categories, user, currentStore] = await Promise.all([
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
    getCurrentUser().catch(() => null),
    getCurrentStore().catch(() => null),
  ]);

  // Courses are public - anyone can view them
  const courses = coursePayload?.courses ?? [];
  const pagination = coursePayload?.pagination;
  const storeCurrency = user?.currentStore || (currentStore as any) || null;

  // Get store language for translations
  let storeForLang = currentStore;
  if (!storeForLang && storeContext.slug) {
    storeForLang = await getStoreBySlug(storeContext.slug).catch(() => null);
  }
  const language = getStoreLanguage(storeForLang?.language || null, storeForLang?.country_code || null);
  const translate = (key: string) => t(key, language);

  return (
    <div className="relative space-y-6">
      {/* Creative background elements for courses page */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-gradient-to-br from-[var(--theme-primary)]/8 to-[var(--theme-secondary)]/8 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-gradient-to-br from-[var(--theme-secondary)]/8 to-[var(--theme-accent)]/8 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: "1.5s" }} />
      </div>
      
      <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          {translate("pages.courseCatalogue")}
        </h1>
        <p className="max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
          {translate("pages.courseCatalogueDescription")}
        </p>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
        <CourseFilters
          categories={categories}
          initialQuery={query}
          initialCategoryId={categoryId}
          initialOrderBy={orderBy}
          initialIsFree={isFree}
        />
      </div>

      {courses.length > 0 ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {courses.map((course, index) => (
                <div
                  key={course.id}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CourseCard course={course} storeSlug={storeContext.slug} store={storeCurrency} />
                </div>
              ))}
            </div>
            {pagination && (pagination.pages > 1 || (pagination.totalPages ?? 0) > 1) ? (
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
                    className="inline-flex h-10 min-w-[2.5rem] items-center justify-center rounded-full border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 transition-all hover:scale-105 hover:bg-slate-100 hover:border-[var(--theme-primary)]/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
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

                    const isActive = targetPage === pagination.page;
                    return (
                      <Link
                        key={targetPage}
                        href={`${buildPath("/courses")}${href}`}
                        className={`inline-flex h-10 min-w-[2.5rem] items-center justify-center rounded-full px-3 text-sm font-semibold transition-all ${
                          isActive
                            ? "bg-[var(--theme-primary)] text-white shadow-lg shadow-[var(--theme-primary)]/30 scale-105"
                            : "border border-slate-200 bg-white text-slate-600 hover:scale-105 hover:bg-slate-100 hover:border-[var(--theme-primary)]/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                        }`}
                      >
                        {targetPage}
                      </Link>
                    );
                  }
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
                    className="inline-flex h-10 min-w-[2.5rem] items-center justify-center rounded-full border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 transition-all hover:scale-105 hover:bg-slate-100 hover:border-[var(--theme-primary)]/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    →
                  </Link>
                )}
              </div>
            ) : null}
          </div>
        ) : (
          <EmptyState
            title={translate("courses.noCoursesFound")}
            description={translate("courses.noCoursesDescription")}
            action={
              <Link
                href={buildPath("/courses")}
                className="inline-flex h-11 items-center rounded-full bg-[var(--theme-primary)] px-6 text-sm font-semibold text-white shadow-lg shadow-[var(--theme-primary)]/30 transition-all hover:scale-105 hover:bg-[var(--theme-primary)]/90 hover:shadow-xl hover:shadow-[var(--theme-primary)]/40"
              >
                {translate("pages.resetFilters")}
              </Link>
          }
        />
      )}
    </div>
  );
}

