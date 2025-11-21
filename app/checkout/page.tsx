import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { EmptyState } from "@/components/ui/empty-state";
import { getCourseById, getCurrentUser } from "@/lib/api/server";
import { getSchoolContext } from "@/lib/school-context";
import { buildSchoolPath, resolveAssetUrl } from "@/lib/utils";
import { getSession } from "@/lib/auth/session";

type SearchParams = Promise<{
  course?: string;
}>;

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const courseId = params.course;

  if (!courseId) {
    return (
      <EmptyState
        title="Course not specified"
        description="Please select a course to enroll in."
        action={
          <Link
            href="/courses"
            className="inline-flex h-11 items-center rounded-full bg-sky-600 px-6 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 hover:bg-sky-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400"
          >
            Browse Courses
          </Link>
        }
      />
    );
  }

  const session = await getSession();
  if (!session || !session.userId || !session.profileId) {
    const schoolContext = await getSchoolContext();
    const buildPath = (path: string) => buildSchoolPath(schoolContext.slug, path);
    redirect(buildPath(`/auth/login?redirect=${encodeURIComponent(`/checkout?course=${courseId}`)}`));
  }

  const [course, user] = await Promise.all([
    getCourseById(courseId).catch(() => null),
    getCurrentUser(),
  ]);

  if (!course) {
    return (
      <EmptyState
        title="Course not found"
        description="The course you're looking for doesn't exist or is no longer available."
        action={
          <Link
            href="/courses"
            className="inline-flex h-11 items-center rounded-full bg-sky-600 px-6 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 hover:bg-sky-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400"
          >
            Browse Courses
          </Link>
        }
      />
    );
  }

  if (!user) {
    const schoolContext = await getSchoolContext();
    const buildPath = (path: string) => buildSchoolPath(schoolContext.slug, path);
    redirect(buildPath(`/auth/login?redirect=${encodeURIComponent(`/checkout?course=${courseId}`)}`));
  }

  if (course.is_free) {
    // For free courses, we can enroll directly without payment
    return (
      <div className="mx-auto max-w-4xl space-y-8 px-6 py-12">
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
            Complete Your Enrollment
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            This course is free. Complete your enrollment to get started.
          </p>
        </div>
        <CheckoutForm course={course} user={user} session={session} />
      </div>
    );
  }

  const coverUrl = resolveAssetUrl(course.cover?.url) ?? "/globe.svg";
  const schoolContext = await getSchoolContext();
  const buildPath = (path: string) => buildSchoolPath(schoolContext.slug, path);

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 py-12">
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
          Complete Your Purchase
        </h1>
        <p className="text-slate-600 dark:text-slate-300">
          Review your order and complete your enrollment.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex gap-4">
              {course.cover?.url && (
                <img
                  src={coverUrl}
                  alt={course.title}
                  className="h-24 w-24 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {course.title}
                </h2>
                {course.short_description && (
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {course.short_description}
                  </p>
                )}
                {course.category && (
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    {course.category.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              What's included
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <span className="text-sky-600 dark:text-sky-400">✓</span>
                Lifetime access to course materials
              </li>
              <li className="flex items-center gap-2">
                <span className="text-sky-600 dark:text-sky-400">✓</span>
                Certificate of completion {course.is_certificate ? "(included)" : "(not included)"}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-sky-600 dark:text-sky-400">✓</span>
                14-day satisfaction guarantee
              </li>
              <li className="flex items-center gap-2">
                <span className="text-sky-600 dark:text-sky-400">✓</span>
                Cancel anytime from your dashboard
              </li>
            </ul>
          </div>
        </div>

        <div className="lg:sticky lg:top-6 lg:h-fit">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-950">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Order Summary
            </h3>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">Course</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  ${course.price.toFixed(2)}
                </span>
              </div>
              {course.original_price && course.original_price > course.price && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-300">Original Price</span>
                  <span className="text-slate-500 line-through dark:text-slate-400">
                    ${course.original_price.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-3 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 dark:text-white">Total</span>
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">
                    ${course.price.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <CheckoutForm course={course} user={user} session={session} />
          </div>
        </div>
      </div>
    </div>
  );
}

