import Link from "next/link";

import { CourseCard } from "@/components/courses/course-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { getCourses } from "@/lib/api/server";
import { buildSchoolPath } from "@/lib/utils";
import { getSchoolContext } from "@/lib/school-context";

type SearchParams = Promise<{
  q?: string;
  page?: string;
  min?: string;
  max?: string;
  order_by?: string;
}>;

const pageSize = 9;

const parseNumber = (value?: string) => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const buildQueryString = (params: Record<string, string | number | undefined>) => {
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
  const min = parseNumber(params?.min);
  const max = parseNumber(params?.max);
  const orderBy = params?.order_by;

  const coursePayload = await getCourses({
    title: query || undefined,
    min_price: min,
    max_price: max,
    page,
    limit: pageSize,
    order_by: orderBy || undefined,
    published: true,
  }).catch(() => null);

  const hasCatalogAccess = coursePayload !== null;
  const courses = coursePayload?.courses ?? [];
  const pagination = coursePayload?.pagination;

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <h1 className="text-4xl font-semibold text-slate-900 dark:text-white">Course catalogue</h1>
        <p className="max-w-2xl text-base text-slate-600 dark:text-slate-300">
          Browse comprehensive courses created with practitioners. Use filters to refine by price,
          format, or newest releases.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <form className="grid gap-6 md:grid-cols-[2fr_1fr_1fr] md:items-end" method="get">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="q">
              Search courses
            </label>
            <Input
              id="q"
              name="q"
              defaultValue={query}
              placeholder="Search by title or author..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Price range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                name="min"
                defaultValue={min ?? ""}
                placeholder="Min"
                min={0}
              />
              <Input
                type="number"
                name="max"
                defaultValue={max ?? ""}
                placeholder="Max"
                min={0}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="order_by">
              Sort by
            </label>
            <select
              id="order_by"
              name="order_by"
              defaultValue={orderBy ?? ""}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="">Newest</option>
              <option value="price">Price</option>
              <option value="discount_percent">Discount</option>
            </select>
          </div>
          <div className="md:col-span-3">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="inline-flex h-11 items-center rounded-full bg-sky-600 px-6 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 hover:bg-sky-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400"
              >
                Apply filters
              </button>
              <Link
                href={buildPath("/courses")}
                className="inline-flex h-11 items-center rounded-full border border-slate-200 px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900"
              >
                Clear
              </Link>
            </div>
          </div>
        </form>
      </div>

      {hasCatalogAccess ? (
        courses.length ? (
          <div className="space-y-8">
            <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} schoolSlug={schoolContext.slug} />
              ))}
            </div>
            {pagination && pagination.pages > 1 ? (
              <div className="flex flex-wrap items-center justify-center gap-2">
                {Array.from({ length: pagination.pages }, (_, index) => {
                  const targetPage = index + 1;
                  const href = buildQueryString({
                    q: query || undefined,
                    min,
                    max,
                    order_by: orderBy || undefined,
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
                })}
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

