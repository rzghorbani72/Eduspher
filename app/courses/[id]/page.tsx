/* eslint-disable @next/next/no-img-element */
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CourseCard } from "@/components/courses/course-card";
import { CourseCurriculum } from "@/components/courses/course-curriculum";
import { CourseQnA } from "@/components/courses/course-qna";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { getCourseById, getCourses, getCurrentUser } from "@/lib/api/server";
import { getSchoolContext } from "@/lib/school-context";
import { buildSchoolPath, resolveAssetUrl, formatCurrencyWithSchool } from "@/lib/utils";

type PageParams = Promise<{
  id: string;
}>;

const detailItems = (
  course: Awaited<ReturnType<typeof getCourseById>>,
  school?: { currency?: string; currency_symbol?: string; currency_position?: "before" | "after" } | null
) => {
  if (!course) return [];
  const hasDiscount = course.original_price && course.original_price > course.price;
  const priceDisplay = course.is_free
    ? "Free"
    : hasDiscount
    ? (
        <div className="flex flex-col items-end gap-1">
          <span className="text-slate-500 line-through dark:text-slate-400">
            {formatCurrencyWithSchool(course.original_price || 0, school)}
          </span>
          <span className="text-[var(--theme-primary)] font-semibold">
            {formatCurrencyWithSchool(course.price, school)}
          </span>
        </div>
      )
    : formatCurrencyWithSchool(course.price, school);
  return [
    {
      label: "Certificate",
      value: course.is_certificate ? "Awarded" : "Not included",
    },
    {
      label: "Format",
      value: course.is_free ? "Self-paced preview" : "Mentor-guided cohort",
    },
    {
      label: "Price",
      value: priceDisplay,
    },
    {
      label: "Category",
      value: course.category?.name ?? "General",
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

  if (!course) {
    if (!token?.value) {
      return (
        <EmptyState
          title="Sign in to view course details"
          description="Create a free account or log in to read the full syllabus, view resources, and enroll."
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

  const relatedCourses = await getCourses({
    published: true,
    limit: 3,
    order_by: "NEWEST",
    category_id: normalizedCourse.category?.id,
  }).catch(() => null);

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr] animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-slate-500 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
            {normalizedCourse.category ? <Badge variant="soft">{normalizedCourse.category.name}</Badge> : null}
            {normalizedCourse.is_featured ? <Badge variant="warning">Featured</Badge> : null}
            {normalizedCourse.is_certificate ? <Badge variant="success">Certificate</Badge> : null}
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
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">What you will learn</h2>
            {normalizedCourse.description ? (
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {normalizedCourse.description}
              </p>
            ) : (
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Detailed curriculum coming soon. Contact support for a personalised syllabus preview.
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
                {detailItems(normalizedCourse, school).map((item) => (
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
              <Link
                href={buildPath(`/checkout?course=${normalizedCourse.id}`)}
                className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[var(--theme-primary)] text-sm font-semibold text-white shadow-lg shadow-[var(--theme-primary)]/30 transition-all hover:scale-105 hover:bg-[var(--theme-primary)]/90 hover:shadow-xl hover:shadow-[var(--theme-primary)]/40"
              >
                Enroll now
              </Link>
              <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                Includes 14-day satisfaction guarantee. Cancel anytime in your dashboard.
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Resources</h2>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
              {videoUrl ? (
                <li>
                  <Link className="group inline-flex items-center font-semibold text-[var(--theme-primary)] transition-all hover:translate-x-1 hover:underline" href={videoUrl}>
                    Watch course trailer →
                  </Link>
                </li>
              ) : null}
              {audioUrl ? (
                <li>
                  <Link className="group inline-flex items-center font-semibold text-[var(--theme-primary)] transition-all hover:translate-x-1 hover:underline" href={audioUrl}>
                    Listen to sample audio →
                  </Link>
                </li>
              ) : null}
              {documentUrl ? (
                <li>
                  <Link className="group inline-flex items-center font-semibold text-[var(--theme-primary)] transition-all hover:translate-x-1 hover:underline" href={documentUrl}>
                    Download syllabus PDF →
                  </Link>
                </li>
              ) : null}
              {!videoUrl && !audioUrl && !documentUrl ? (
                <li className="text-xs text-slate-500 dark:text-slate-400">
                  Additional resources will be available after enrollment.
                </li>
              ) : null}
            </ul>
          </div>
        </aside>
      </section>

      <CourseQnA courseId={normalizedCourse.id} isLoggedIn={!!user} userRole={user?.role} />

      {relatedCourses?.courses?.length ? (
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">You might also like</h2>
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

