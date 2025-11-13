import Link from "next/link";

import { CourseCard } from "@/components/courses/course-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { getCourses, getCurrentSchool, getUserProfiles } from "@/lib/api/server";
import { getSession } from "@/lib/auth/session";
import { getSchoolContext } from "@/lib/school-context";
import { buildSchoolPath } from "@/lib/utils";

export default async function AccountPage() {
  const session = await getSession();
  const schoolContext = await getSchoolContext();
  const buildPath = (path: string) => buildSchoolPath(schoolContext.slug, path);

  if (!session) {
    return (
      <EmptyState
        title="Log in to view your learning hub"
        description="Access personalized recommendations, saved resources, and mentor feedback by signing in to your account."
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

  const [profilesData, currentSchool, recommended] = await Promise.all([
    getUserProfiles(),
    getCurrentSchool(),
    getCourses({
      limit: 3,
      published: true,
      order_by: "NEWEST",
    }).catch(() => null),
  ]);

  if (profilesData === null) {
    return (
      <EmptyState
        title="Your session expired"
        description="Log back in to manage your learning profile."
        action={
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href={buildPath("/auth/login")}
              className="inline-flex h-11 items-center rounded-full bg-slate-900 px-6 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-white"
            >
              Log in
            </Link>
          </div>
        }
      />
    );
  }

  const profiles = profilesData ?? [];
  const primaryProfile = profiles.find((profile) => profile.id === session.profileId) ?? profiles[0];

  if (!primaryProfile) {
    return (
      <EmptyState
        title="No active profiles"
        description="We couldn't find any active learning profile for this account. Contact support for assistance."
      />
    );
  }

  const schoolName = currentSchool?.name ?? primaryProfile.school?.name ?? "—";
  const schoolDomain = currentSchool?.domain?.public_address
    ?? currentSchool?.domain?.private_address
    ?? primaryProfile.school?.slug
    ?? null;

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Your learning hub</h1>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Display name</p>
            <p className="text-xl font-semibold text-slate-900 dark:text-white">
              {primaryProfile.display_name}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Account #{session.userId ?? "—"} • Profile #{primaryProfile.id}
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Primary role</p>
            <p className="text-xl font-semibold text-slate-900 dark:text-white">
              {primaryProfile.role}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {primaryProfile.has_password ? "Password protected" : "Password not set"}
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">School</p>
            <p className="text-xl font-semibold text-slate-900 dark:text-white">{schoolName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {schoolDomain ? `Domain: ${schoolDomain}` : "Domain information unavailable"}
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Linked profiles</h2>
          <span className="text-sm text-slate-500 dark:text-slate-400">{profiles.length} total</span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="flex flex-col gap-1 rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {profile.display_name}
                </p>
                <Badge variant={profile.id === primaryProfile.id ? "success" : "soft"}>
                  {profile.role}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                School: {profile.school?.name ?? "Unknown"} • Profile #{profile.id}
              </p>
            </div>
          ))}
        </div>
      </div>
      {recommended?.courses?.length ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Recommended for you</h2>
            <Link
              href={buildPath("/courses")}
              className="text-sm font-semibold text-sky-600 transition hover:text-sky-700 dark:text-sky-400"
            >
              View all courses →
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {recommended.courses.map((course) => (
              <CourseCard key={course.id} course={course} schoolSlug={schoolContext.slug} />
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

