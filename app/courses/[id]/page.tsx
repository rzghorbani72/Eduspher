/* eslint-disable @next/next/no-img-element */
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CourseCard } from "@/components/courses/course-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { getCourseById, getCourses } from "@/lib/api/server";
import { resolveAssetUrl } from "@/lib/utils";

type PageParams = Promise<{
  id: string;
}>;

const detailItems = (course: Awaited<ReturnType<typeof getCourseById>>) => {
  if (!course) return [];
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
      value: course.is_free ? "Free" : `$${course.price.toFixed(2)}`,
    },
    {
      label: "Category",
      value: course.category?.name ?? "General",
    },
  ];
};

export default async function CourseDetailPage({ params }: { params: PageParams }) {
  const { id } = await params;
  const token = cookies().get("jwt");

  const course = await getCourseById(id);

  if (!course) {
    if (!token?.value) {
      return (
        <EmptyState
          title="Sign in to view course details"
          description="Create a free account or log in to read the full syllabus, view resources, and enroll."
          action={
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/auth/login"
                className="inline-flex h-11 items-center rounded-full bg-slate-900 px-6 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-white"
              >
                Log in
              </Link>
              <Link
                href="/auth/register"
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

  const coverUrl = resolveAssetUrl(course.cover?.url) ?? "/globe.svg";
  const videoUrl = resolveAssetUrl(course.video?.url);
  const audioUrl = resolveAssetUrl(course.audio?.url);
  const documentUrl = resolveAssetUrl(course.document?.url);

  const relatedCourses = await getCourses({
    published: true,
    limit: 3,
    order_by: "NEWEST",
  }).catch(() => null);

  return (
    <div className="space-y-12">
      <section className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-wide text-slate-500">
            {course.category ? <Badge variant="soft">{course.category.name}</Badge> : null}
            {course.is_featured ? <Badge variant="warning">Featured</Badge> : null}
            {course.is_certificate ? <Badge variant="success">Certificate</Badge> : null}
          </div>
          <h1 className="text-4xl font-semibold text-slate-900 dark:text-white">{course.title}</h1>
          {course.short_description ? (
            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              {course.short_description}
            </p>
          ) : null}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">What you will learn</h2>
            {course.description ? (
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {course.description}
              </p>
            ) : (
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Detailed curriculum coming soon. Contact support for a personalised syllabus preview.
              </p>
            )}
          </div>
          {course.seasons?.length ? (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Curriculum outline</h2>
              <ol className="space-y-3">
                {course.seasons.map((season, index) => (
                  <li
                    key={season.id}
                    className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                  >
                    <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-600 text-xs font-semibold text-white">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{season.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Guided lessons, projects, and mentor critique aligned to this milestone.
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
        </div>
        <aside className="space-y-6">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-950">
            <img src={coverUrl} alt={course.title} className="h-56 w-full object-cover" />
            <div className="space-y-5 p-6">
              <div className="grid gap-2 text-sm text-slate-600 dark:text-slate-300">
                {detailItems(course).map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="font-medium text-slate-500 dark:text-slate-400">
                      {item.label}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
              <Link
                href={`/checkout?course=${course.id}`}
                className="inline-flex h-12 w-full items-center justify-center rounded-full bg-sky-600 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 hover:bg-sky-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400"
              >
                Enroll now
              </Link>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Includes 14-day satisfaction guarantee. Cancel anytime in your dashboard.
              </p>
            </div>
          </div>
          <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Resources</h2>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              {videoUrl ? (
                <li>
                  <Link className="font-semibold text-sky-600 hover:underline dark:text-sky-400" href={videoUrl}>
                    Watch preview video →
                  </Link>
                </li>
              ) : null}
              {audioUrl ? (
                <li>
                  <Link className="font-semibold text-sky-600 hover:underline dark:text-sky-400" href={audioUrl}>
                    Listen to sample audio →
                  </Link>
                </li>
              ) : null}
              {documentUrl ? (
                <li>
                  <Link className="font-semibold text-sky-600 hover:underline dark:text-sky-400" href={documentUrl}>
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

      {relatedCourses?.courses?.length ? (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">You might also like</h2>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {relatedCourses.courses
              .filter((item) => item.id !== course.id)
              .map((item) => (
                <CourseCard key={item.id} course={item} />
              ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

