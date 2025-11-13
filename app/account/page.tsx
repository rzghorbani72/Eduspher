import Link from "next/link";

import { CourseCard } from "@/components/courses/course-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { getCourses } from "@/lib/api/server";
import { getSession } from "@/lib/auth/session";

export default async function AccountPage() {
  const session = await getSession();

  if (!session) {
    return (
      <EmptyState
        title="Log in to view your learning hub"
        description="Access personalized recommendations, saved resources, and mentor feedback by signing in to your account."
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

  const recommended = await getCourses({
    limit: 3,
    published: true,
    order_by: "NEWEST",
  }).catch(() => null);

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Your learning hub</h1>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Profile ID
            </p>
            <p className="text-xl font-semibold text-slate-900 dark:text-white">
              {session.profileId ?? "—"}
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              School
            </p>
            <p className="text-xl font-semibold text-slate-900 dark:text-white">
              {session.schoolId ?? "—"}
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Roles
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {session.roles?.length ? (
                session.roles.map((role) => (
                  <Badge key={role} variant="soft">
                    {role}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-slate-500 dark:text-slate-400">Viewer</span>
              )}
            </div>
          </div>
        </div>
      </div>
      {recommended?.courses?.length ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Recommended for you</h2>
            <Link
              href="/courses"
              className="text-sm font-semibold text-sky-600 transition hover:text-sky-700 dark:text-sky-400"
            >
              View all courses →
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {recommended.courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      ) : (
        <EmptyState
          title="Courses coming soon"
          description="Once you enroll, your active and completed programs will appear here for quick access."
        />
      )}
    </div>
  );
}

