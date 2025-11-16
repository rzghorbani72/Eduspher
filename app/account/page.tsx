import Link from "next/link";

import { CourseCard } from "@/components/courses/course-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { getCourses, getCurrentUser, getUserProfiles, getEnrollments } from "@/lib/api/server";
import { getSession } from "@/lib/auth/session";
import { getSchoolContext } from "@/lib/school-context";
import { buildSchoolPath, resolveAssetUrl } from "@/lib/utils";
import type { EnrollmentSummary } from "@/lib/api/types";

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

  const [userData, profilesData, recommended, enrollmentsData] = await Promise.all([
    getCurrentUser(),
    getUserProfiles(),
    getCourses({
      limit: 3,
      published: true,
    }).catch(() => null),
    getEnrollments({
      limit: 100,
    }).catch(() => null),
  ]);

  if (userData === null) {
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

  if (!userData.currentProfile) {
    return (
      <EmptyState
        title="No active profiles"
        description="We couldn't find any active learning profile for this account. Contact support for assistance."
      />
    );
  }

  const profiles = profilesData ?? [];
  const primaryProfile = profiles.find((profile) => profile.id === userData.currentProfile.id) ?? profiles[0];

  const schoolName = userData.currentSchool?.name ?? "—";
  const schoolDomain = userData.currentSchool?.domain ?? null;

  const enrollments = enrollmentsData?.enrollments ?? [];
  const activeEnrollments = enrollments.filter((e) => e.status === "ACTIVE");
  const completedEnrollments = enrollments.filter((e) => e.status === "COMPLETED");
  
  // Get watched videos/lessons from progress
  const watchedLessons = enrollments.flatMap((enrollment) => 
    (enrollment.progress ?? []).filter((p) => p.watch_time > 0 || p.status === "COMPLETED")
  );
  
  // Get recently accessed courses (sorted by last_accessed)
  const recentlyAccessed = [...enrollments].sort((a, b) => 
    new Date(b.last_accessed).getTime() - new Date(a.last_accessed).getTime()
  ).slice(0, 5);

  // Get all unique roles from profiles
  const allRoles = [...new Set(profiles.map((p) => p.role))];

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Your learning hub</h1>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Display name</p>
            <p className="text-xl font-semibold text-slate-900 dark:text-white">
              {userData.currentProfile.displayName}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Account #{userData.id} • Profile #{userData.currentProfile.id}
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Roles</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {allRoles.map((role) => (
                <Badge key={role} variant={role === userData.currentProfile.role ? "success" : "soft"}>
                  {role}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {primaryProfile?.has_password ? "Password protected" : "Password not set"}
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Bought courses</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">
              {enrollments.length}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {activeEnrollments.length} active • {completedEnrollments.length} completed
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
      {/* Roles Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Roles</h2>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Your roles across all profiles and schools
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {allRoles.map((role) => (
              <Badge 
                key={role} 
                variant={role === userData.currentProfile.role ? "success" : "soft"}
                className="text-sm px-4 py-2"
              >
                {role}
              </Badge>
            ))}
          </div>
          {profiles.length > 1 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                Linked Profiles ({profiles.length})
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                {profiles.map((profile) => (
                  <div
                    key={profile.id}
                    className="flex flex-col gap-1 rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {profile.display_name}
                      </p>
                      <Badge variant={profile.id === userData.currentProfile.id ? "success" : "soft"}>
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
          )}
        </div>
      </section>

      {/* Bought Courses Section */}
      {enrollments.length > 0 ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Bought Courses</h2>
            <Link
              href={buildPath("/courses")}
              className="text-sm font-semibold text-sky-600 transition hover:text-sky-700 dark:text-sky-400"
            >
              Browse more →
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {enrollments.map((enrollment) => {
              if (!enrollment.course) return null;
              return (
                <div key={enrollment.id} className="relative">
                  <CourseCard course={enrollment.course} schoolSlug={schoolContext.slug} />
                  <div className="absolute top-2 right-2">
                    <Badge variant={enrollment.status === "COMPLETED" ? "success" : "soft"}>
                      {enrollment.status}
                    </Badge>
                  </div>
                  <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Progress: {Math.round(enrollment.progress_percent)}% • 
                    Last accessed: {new Date(enrollment.last_accessed).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Bought Courses</h2>
          <EmptyState
            title="No courses purchased yet"
            description="Browse our course catalog and enroll in courses to start learning."
            action={
              <Link
                href={buildPath("/courses")}
                className="inline-flex h-11 items-center rounded-full bg-slate-900 px-6 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-white"
              >
                Browse Courses
              </Link>
            }
          />
        </section>
      )}

      {/* Watched Courses and Videos Section */}
      {watchedLessons.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Watched Courses and Videos</h2>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="space-y-4">
              {watchedLessons.map((progress) => {
                const course = enrollments.find((e) => e.id === progress.enrollment_id)?.course;
                if (!course || !progress.lesson) return null;
                
                const watchTimeMinutes = Math.floor(progress.watch_time / 60);
                const isCompleted = progress.status === "COMPLETED";
                
                return (
                  <div
                    key={progress.id}
                    className="flex items-center gap-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {progress.lesson.title}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {course.title} • {watchTimeMinutes} min watched
                      </p>
                    </div>
                    <Badge variant={isCompleted ? "success" : "soft"}>
                      {isCompleted ? "Completed" : "In Progress"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ) : (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Watched Courses and Videos</h2>
          <EmptyState
            title="No videos watched yet"
            description="Start watching course videos to track your progress here."
          />
        </section>
      )}

      {/* Accesses Section */}
      {recentlyAccessed.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Accesses</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Recently accessed courses and learning materials
          </p>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {recentlyAccessed.map((enrollment) => {
              if (!enrollment.course) return null;
              return (
                <Link
                  key={enrollment.id}
                  href={buildPath(`/courses/${enrollment.course.id}`)}
                  className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="flex items-start gap-3">
                    {enrollment.course.cover?.url && (
                      <img
                        src={resolveAssetUrl(enrollment.course.cover.url) || ""}
                        alt={enrollment.course.title}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 group-hover:text-sky-600 dark:text-white dark:group-hover:text-sky-400">
                        {enrollment.course.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(enrollment.last_accessed).toLocaleDateString()}
                      </p>
                      <div className="mt-2">
                        <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800">
                          <div
                            className="h-1.5 rounded-full bg-sky-600"
                            style={{ width: `${Math.min(enrollment.progress_percent, 100)}%` }}
                          />
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {Math.round(enrollment.progress_percent)}% complete
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}

