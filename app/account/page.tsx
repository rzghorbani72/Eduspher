import Link from "next/link";
import { redirect } from "next/navigation";

import { CourseCard } from "@/components/courses/course-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { getCourses, getCurrentUser, getUserProfiles, getEnrollments, getSchoolBySlug, getCurrentSchool, UnauthorizedError } from "@/lib/api/server";
import { getSession } from "@/lib/auth/session";
import { getSchoolContext } from "@/lib/school-context";
import { buildSchoolPath, resolveAssetUrl } from "@/lib/utils";
import { getSchoolLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/server-translations";
import type { EnrollmentSummary } from "@/lib/api/types";
import { ChangePasswordForm } from "@/components/account/change-password-form";
import { AddContactForm } from "@/components/account/add-contact-form";
import { EditDisplayNameForm } from "@/components/account/edit-display-name-form";
import { EditSchoolNameForm } from "@/components/account/edit-school-name-form";

export default async function AccountPage() {
  const session = await getSession();
  const schoolContext = await getSchoolContext();
  const buildPath = (path: string) => buildSchoolPath(schoolContext.slug, path);

  // Get school language for translations
  let currentSchool = await getCurrentSchool().catch(() => null);
  if (!currentSchool && schoolContext.slug) {
    currentSchool = await getSchoolBySlug(schoolContext.slug).catch(() => null);
  }
  const language = getSchoolLanguage(currentSchool?.language || null, currentSchool?.country_code || null);
  const translate = (key: string) => t(key, language);

  if (!session) {
    return (
      <EmptyState
        title={translate("account.loginToViewHub")}
        description={translate("account.loginToViewHubDescription")}
        action={
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href={buildPath("/auth/login")}
              className="inline-flex h-11 items-center rounded-full bg-slate-900 px-6 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-white"
            >
              {translate("auth.login")}
            </Link>
            <Link
              href={buildPath("/auth/login")}
              className="inline-flex h-11 items-center rounded-full border border-slate-200 px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900"
            >
              {translate("auth.register")}
            </Link>
          </div>
        }
      />
    );
  }

  try {
    const [userData, profilesData, recommended, enrollmentsData, school] = await Promise.all([
      getCurrentUser(),
      getUserProfiles().catch(() => null),
      getCourses({
        limit: 3,
        published: true,
      }).catch(() => null),
      getEnrollments({
        limit: 100,
      }).catch(() => null),
      schoolContext.slug ? getSchoolBySlug(schoolContext.slug) : null,
    ]);
    
    if (userData === null) {
    return (
      <EmptyState
        title={translate("account.sessionExpired")}
        description={translate("account.sessionExpiredDescription")}
        action={
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href={buildPath("/auth/login")}
              className="inline-flex h-11 items-center rounded-full bg-slate-900 px-6 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 hover:bg-slate-700 focus-visible:outline-slate-900 dark:bg-slate-600 dark:text-slate-900"
            >
              {translate("auth.login")}
            </Link>
          </div>
        }
      />
    );
  }

  if (!userData.isActive) {
    return (
      <EmptyState
        title={translate("account.noActiveProfiles")}
        description={translate("account.noActiveProfilesDescription")}
      />
    );
  }

  const profiles = profilesData ?? [];


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

  // Determine primary and secondary verification methods
  const primaryMethod = school?.primary_verification_method || 'phone';
  const secondaryMethod = primaryMethod === 'phone' ? 'email' : 'phone';
  
  // Check if user has secondary method and if it's confirmed
  const hasSecondaryEmail = !!userData.email && primaryMethod === 'phone';
  const hasSecondaryPhone = !!userData.phone_number && primaryMethod === 'email';
  const hasSecondaryEmailConfirmed = hasSecondaryEmail && userData.email_confirmed;
  const hasSecondaryPhoneConfirmed = hasSecondaryPhone && userData.phone_confirmed;
  
  // Show add secondary method if user doesn't have it or it's not confirmed
  const needsSecondaryMethod = primaryMethod === 'phone' 
    ? (!hasSecondaryEmail || !hasSecondaryEmailConfirmed)
    : (!hasSecondaryPhone || !hasSecondaryPhoneConfirmed);

  return (
    <div className="space-y-6">
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{translate("account.learningHub")}</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-950 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{translate("account.fullName")}</p>
            <p className="text-xl font-semibold text-slate-900 dark:text-white">
              {userData.display_name || "—"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {translate("account.display")}: {userData.display_name} • {translate("account.account")} #{userData.id}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-950 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{translate("account.email")}</p>
            <p className="text-xl font-semibold text-slate-900 dark:text-white break-all">
              {userData.email || "—"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {userData.email_confirmed ? translate("account.emailConfirmed") : translate("account.emailNotConfirmed")}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-950 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{translate("account.role")}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="success" className="text-sm px-3 py-1">
                {userData.role}
              </Badge>
              {allRoles.filter(role => role !== userData.role).map((role) => (
                <Badge key={role} variant="soft" className="text-sm px-3 py-1">
                  {role}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {userData.has_password ? translate("account.passwordProtected") : translate("account.passwordNotSet")}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-950 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-250">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{translate("account.boughtCourses")}</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">
              {enrollments.length}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {activeEnrollments.length} {translate("account.active")} • {completedEnrollments.length} {translate("account.completed")}
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-950 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{translate("account.school")}</p>
            <p className="text-xl font-semibold text-slate-900 dark:text-white">{schoolName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {schoolDomain ? `${translate("account.domain")}: ${schoolDomain}` : translate("account.domainUnavailable")}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-950 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-350">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{translate("account.phoneNumber")}</p>
            <p className="text-xl font-semibold text-slate-900 dark:text-white">
              {userData.phone_number || "—"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {userData.phone_confirmed ? translate("account.phoneConfirmed") : translate("account.phoneNotConfirmed")} • {translate("account.profile")} #{userData.id}
            </p>
          </div>
        </div>
      </div>
      {/* Account Settings Section */}
      <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{translate("account.accountSettings")}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Edit Display Name */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{translate("account.displayName")}</h3>
            <EditDisplayNameForm profileId={userData.id} currentDisplayName={userData.display_name} />
          </div>

          {/* Change Password */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{translate("account.changePassword")}</h3>
            <ChangePasswordForm profileId={userData.id} />
          </div>

          {/* Edit School Name (Manager only) */}
          {userData.role === 'MANAGER' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{translate("account.schoolName")}</h3>
              <EditSchoolNameForm currentSchoolName={schoolName} />
            </div>
          )}

          {/* Add Secondary Contact Method */}
          {needsSecondaryMethod && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                {secondaryMethod === 'email' ? translate("account.addEmail") : translate("account.addPhoneNumber")}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                {secondaryMethod === 'email' ? translate("account.addEmailDescription") : translate("account.addPhoneDescription")}
              </p>
              <AddContactForm 
                method={secondaryMethod}
                primaryMethod={primaryMethod}
                defaultCountryCode={school?.country_code || undefined}
              />
            </div>
          )}
        </div>
      </section>

      {/* Roles Section */}
      <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{translate("account.roles")}</h2>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {translate("account.rolesDescription")}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {allRoles.map((role) => (
              <Badge 
                key={role} 
                variant={role === userData.role ? "success" : "soft"}
                className="text-sm px-4 py-2"
              >
                {role}
              </Badge>
            ))}
          </div>
          {profiles.length > 1 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                {translate("account.linkedProfiles")} ({profiles.length})
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
                      <Badge variant={profile.id === userData.id ? "success" : "soft"}>
                        {profile.role}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {translate("account.school")}: {profile.school?.name ?? translate("account.unknown")} • {translate("account.profile")} #{profile.id}
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
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{translate("account.boughtCourses")}</h2>
            <Link
              href={buildPath("/courses")}
              className="text-sm font-semibold text-[var(--theme-primary)] transition-all hover:translate-x-1 hover:underline"
            >
              {translate("account.browseMore")} →
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {enrollments.map((enrollment, index) => {
              if (!enrollment.course) return null;
              return (
                <div
                  key={enrollment.id}
                  className="relative animate-in fade-in slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CourseCard course={enrollment.course} schoolSlug={schoolContext.slug} school={userData.currentSchool || null} />
                  <div className="absolute top-2 right-2 z-10">
                    <Badge variant={enrollment.status === "COMPLETED" ? "success" : "soft"}>
                      {enrollment.status}
                    </Badge>
                  </div>
                  <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    {translate("account.progress")}: {Math.round(enrollment.progress_percent)}% • 
                    {translate("account.lastAccessed")}: {new Date(enrollment.last_accessed).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{translate("account.boughtCourses")}</h2>
          <EmptyState
            title={translate("account.noCoursesPurchased")}
            description={translate("account.browseCatalogDescription")}
            action={
              <Link
                href={buildPath("/courses")}
                className="inline-flex h-11 items-center rounded-full bg-[var(--theme-primary)] px-6 text-sm font-semibold text-white shadow-lg shadow-[var(--theme-primary)]/30 transition-all hover:scale-105 hover:bg-[var(--theme-primary)]/90 hover:shadow-xl hover:shadow-[var(--theme-primary)]/40"
              >
                {translate("account.browseCourses")}
              </Link>
            }
          />
        </section>
      )}

      {/* Watched Courses and Videos Section */}
      {watchedLessons.length > 0 ? (
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{translate("account.watchedCoursesVideos")}</h2>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
            <div className="space-y-3">
              {watchedLessons.map((progress, index) => {
                const course = enrollments.find((e) => e.id === progress.enrollment_id)?.course;
                if (!course || !progress.lesson) return null;
                
                const watchTimeMinutes = Math.floor(progress.watch_time / 60);
                const isCompleted = progress.status === "COMPLETED";
                
                return (
                  <div
                    key={progress.id}
                    className="flex items-center gap-4 rounded-xl border border-slate-200 p-4 transition-all hover:border-[var(--theme-primary)]/30 hover:shadow-sm dark:border-slate-800 animate-in fade-in slide-in-from-bottom-2 duration-500"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {progress.lesson.title}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {course.title} • {watchTimeMinutes} {translate("account.minWatched")}
                      </p>
                    </div>
                    <Badge variant={isCompleted ? "success" : "soft"}>
                      {isCompleted ? translate("account.completed") : translate("account.inProgress")}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ) : (
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{translate("account.watchedCoursesVideos")}</h2>
          <EmptyState
            title={translate("account.noVideosWatched")}
            description={translate("account.startWatchingDescription")}
          />
        </section>
      )}

      {/* Accesses Section */}
      {recentlyAccessed.length > 0 ? (
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-600">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{translate("account.accesses")}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {translate("account.recentlyAccessedDescription")}
          </p>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {recentlyAccessed.map((enrollment, index) => {
              if (!enrollment.course) return null;
              return (
                <Link
                  key={enrollment.id}
                  href={buildPath(`/courses/${enrollment.course.id}`)}
                  className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:border-[var(--theme-primary)]/30 hover:shadow-md dark:border-slate-800 dark:bg-slate-950 animate-in fade-in slide-in-from-bottom-2 duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
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
                      <p className="font-semibold text-slate-900 transition-colors group-hover:text-[var(--theme-primary)] dark:text-white dark:group-hover:text-[var(--theme-primary)]">
                        {enrollment.course.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(enrollment.last_accessed).toLocaleDateString()}
                      </p>
                      <div className="mt-2">
                        <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800">
                          <div
                            className="h-1.5 rounded-full bg-[var(--theme-primary)] transition-all duration-500"
                            style={{ width: `${Math.min(enrollment.progress_percent, 100)}%` }}
                          />
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {Math.round(enrollment.progress_percent)}% {translate("account.complete")}
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
  } catch (error) {
    // Handle 401 Unauthorized errors by redirecting to login
    if (error instanceof UnauthorizedError) {
      const loginPath = error.redirectTo || buildPath("/auth/login");
      redirect(`${loginPath}?redirect=${encodeURIComponent("/account")}`);
    }
    // Re-throw other errors
    throw error;
  }
}

