import Link from "next/link";

import { CourseCard } from "@/components/courses/course-card";
import { CourseFilters } from "@/components/courses/course-filters";
import { EmptyState } from "@/components/ui/empty-state";
import { getCourses, getCategories } from "@/lib/api/server";
import { buildSchoolPath } from "@/lib/utils";
import { getSchoolContext } from "@/lib/school-context";

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
  const schoolContext = await getSchoolContext();
  const buildPath = (path: string) => buildSchoolPath(schoolContext.slug, path);
  const params = await searchParams;
  const query = params?.q ?? "";
  const page = parseNumber(params?.page) ?? 1;
  const orderBy = params?.order_by;
  const categoryId = parseNumber(params?.category_id);
  const isFree = parseBoolean(params?.is_free);

  const [coursePayload, categories] = await Promise.all([
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
  ]);

  const hasCatalogAccess = coursePayload !== null;
  const courses = coursePayload?.courses ?? [];
  const pagination = coursePayload?.pagination;

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <h1 className="text-4xl font-semibold text-slate-900 dark:text-white">Course catalogue</h1>
        <p className="max-w-2xl text-base text-slate-600 dark:text-slate-300">
          Browse comprehensive courses created with practitioners. Use filters to refine by category,
          format, or newest releases.
        </p>
      </div>

      <CourseFilters
        categories={categories}
        initialQuery={query}
        initialCategoryId={categoryId}
        initialOrderBy={orderBy}
        initialIsFree={isFree}
      />

      {hasCatalogAccess ? (
        courses.length ? (
          <div className="space-y-8">
            <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} schoolSlug={schoolContext.slug} />
              ))}
            </div>
            {pagination && (pagination.pages > 1 || (pagination.totalPages ?? 0) > 1) ? (
              <div className="flex flex-wrap items-center justify-center gap-2">
                {pagination.hasPreviousPage && (
                  <Link
                    href={`${buildPath("/courses")}${buildQueryString({
                      q: query || undefined,
                      order_by: orderBy || undefined,
                      category_id: categoryId,
                      is_free: isFree,
                      page: page - 1,
                    })}`}
                    className="inline-flex h-10 min-w-[2.5rem] items-center justify-center rounded-full border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
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
                        className={`inline-flex h-10 min-w-[2.5rem] items-center justify-center rounded-full px-3 text-sm font-semibold transition ${
                          isActive
                            ? "bg-sky-600 text-white shadow"
                            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
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
                    className="inline-flex h-10 min-w-[2.5rem] items-center justify-center rounded-full border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    →
                  </Link>
                )}
              </div>
            ) : null}
          </div>
        ) : (
          <EmptyState
            title="No courses match your filters"
            description="Try adjusting your filter set or explore another category."
            action={
              <Link
                href={buildPath("/courses")}
                className="inline-flex h-11 items-center rounded-full bg-sky-600 px-6 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 hover:bg-sky-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400"
              >
                Reset filters
              </Link>
            }
          />
        )
      ) : (
        <EmptyState
          title="Sign in to explore courses"
          description="Log in or create an account to view course outlines, instructors, and enroll."
          action={
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href={buildPath("/auth/login")}
                className="inline-flex h-11 items-center rounded-full bg-slate-900 px-6 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-white"
              >
                Log in
              </Link>
              <Link
                href={buildPath("/auth/login")}
                className="inline-flex h-11 items-center rounded-full border border-slate-200 px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900"
              >
                Create account
              </Link>
            </div>
          }
        />
      )}
    </div>
  );
}

