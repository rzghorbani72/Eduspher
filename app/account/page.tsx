import Link from "@/components/ui/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentUser, getEnrollments, getAcademyBySlug, getCurrentAcademy, getCourseById, UnauthorizedError } from "@/lib/api/server";
import { getSession } from "@/lib/auth/session";
import { getAcademyContext } from "@/lib/store-context";
import { buildAcademyPath } from "@/lib/utils";
import { getAcademyLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/server-translations";
import { AccountSidebar } from "@/components/account/account-sidebar";
import { EnrolledCourseCard } from "@/components/account/enrolled-course-card";
import { ChangePasswordForm } from "@/components/account/change-password-form";
import { AddContactForm } from "@/components/account/add-contact-form";
import { EditDisplayNameForm } from "@/components/account/edit-display-name-form";
import { ActiveSessions } from "@/components/account/active-sessions";
import {
  AccountLearningTab,
  type LearningAccountTab,
} from "@/components/account/account-learning-tab";

type SearchParams = Promise<{ tab?: string }>;

export default async function AccountPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await getSession();
  const storeContext = await getAcademyContext();
  const buildPath = (path: string) => buildAcademyPath(storeContext.isSubdomain ? null : storeContext.slug, path);

  let currentAcademy = await getCurrentAcademy().catch(() => null);
  if (!currentAcademy && storeContext.slug) {
    currentAcademy = await getAcademyBySlug(storeContext.slug).catch(() => null);
  }
  const language = getAcademyLanguage(currentAcademy?.language ?? null, currentAcademy?.country_code ?? null);
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
              className="inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-on-primary shadow-lg shadow-primary/30 transition-all hover:scale-105 hover:opacity-90"
            >
              {translate("auth.login")}
            </Link>
          </div>
        }
      />
    );
  }

  try {
    const [userData, enrollmentsData, store] = await Promise.all([
      getCurrentUser(),
      getEnrollments({ limit: 100 }).catch(() => null),
      storeContext.slug ? getAcademyBySlug(storeContext.slug) : null,
    ]);

    if (!userData) {
      return (
        <EmptyState
          title={translate("account.sessionExpired")}
          description={translate("account.sessionExpiredDescription")}
          action={
            <Link
              href={buildPath("/auth/login")}
              className="inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-on-primary shadow-lg shadow-primary/30 transition-all hover:scale-105 hover:opacity-90"
            >
              {translate("auth.login")}
            </Link>
          }
        />
      );
    }

    const { tab } = await searchParams;
    const activeTab = tab ?? "courses";

    const enrollments = enrollmentsData?.enrollments ?? [];
    const learningTabs: LearningAccountTab[] = [
      "progress",
      "work",
      "classes",
      "results",
      "tutoring",
    ];
    const learningTab = learningTabs.find((item) => item === activeTab);
    const learningCourses =
      activeTab === "classes"
        ? await Promise.all(
            enrollments.map((enrollment) =>
              getCourseById(enrollment.course_id).catch(() => null),
            ),
          )
        : [];
    const liveLessons = learningCourses.flatMap((course) =>
      course
        ? (course.Season ?? []).flatMap((season) =>
            (season.Lesson ?? [])
              .filter((lesson) => lesson.lesson_type === "LIVE")
              .map((lesson) => ({
                id: String(lesson.id),
                title: lesson.title,
                courseId: String(course.id),
                courseTitle: course.title,
              })),
          )
        : [],
    );

    const primaryMethod = store?.primary_verification_method || "phone";
    const secondaryMethod = primaryMethod === "phone" ? "email" : "phone";
    const hasSecondaryEmail = !!userData.email && primaryMethod === "phone";
    const hasSecondaryPhone = !!userData.phone_number && primaryMethod === "email";
    const hasSecondaryEmailConfirmed = hasSecondaryEmail && userData.email_confirmed;
    const hasSecondaryPhoneConfirmed = hasSecondaryPhone && userData.phone_confirmed;
    const needsSecondaryMethod =
      primaryMethod === "phone"
        ? !hasSecondaryEmail || !hasSecondaryEmailConfirmed
        : !hasSecondaryPhone || !hasSecondaryPhoneConfirmed;

    return (
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
        {/* Sidebar */}
        <div className="w-full lg:w-64 lg:shrink-0">
          <AccountSidebar
            displayName={userData.display_name || translate("account.user") || "کاربر"}
            email={userData.email || userData.phone_number}
            isVerified={userData.email_confirmed || userData.phone_confirmed}
            role={userData.role}
            activeTab={activeTab}
          />
        </div>

        {/* Main content */}
        <div className="flex-1 space-y-6 min-w-0">
          {/* My Courses tab */}
          {activeTab === "courses" && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-[var(--theme-foreground)]">
                    {translate("account.myCourses") || "دوره‌های من"}
                  </h1>
                  <p className="text-sm text-muted mt-0.5">
                    {enrollments.length} {translate("account.enrolledCourses") || "دوره ثبت‌نام شده"}
                  </p>
                </div>
                <Link
                  href={buildPath("/courses")}
                  className="inline-flex items-center gap-1.5 rounded-full border border-theme bg-card px-4 py-2 text-sm font-semibold text-[var(--theme-foreground)] transition-all hover:bg-surface hover:border-[var(--theme-primary)]/40"
                >
                  <Plus size={14} />
                  {translate("account.newCourse") || "دوره جدید"}
                </Link>
              </div>

              {enrollments.length > 0 ? (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {enrollments.map((enrollment, idx) => (
                    <div
                      key={enrollment.id}
                      className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                      style={{ animationDelay: `${idx * 80}ms` }}
                    >
                      <EnrolledCourseCard enrollment={enrollment} storeSlug={storeContext.isSubdomain ? null : storeContext.slug} />
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title={translate("account.noCoursesPurchased")}
                  description={translate("account.browseCatalogDescription")}
                  action={
                    <Link
                      href={buildPath("/courses")}
                      className="inline-flex h-11 items-center rounded-full bg-[var(--theme-primary)] px-6 text-sm font-semibold text-[var(--theme-on-primary)] shadow-lg shadow-[var(--theme-primary)]/30 transition-all hover:scale-105"
                    >
                      {translate("account.browseCourses")}
                    </Link>
                  }
                />
              )}
            </div>
          )}

          {/* Classes tab (live classes) */}
          {learningTab ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <AccountLearningTab
                tab={learningTab}
                enrollments={enrollments}
                liveLessons={liveLessons}
                storeSlug={storeContext.isSubdomain ? null : storeContext.slug}
              />
            </div>
          ) : null}

          {/* Past sessions tab */}
          {activeTab === "history" && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-2xl font-bold text-[var(--theme-foreground)]">
                {translate("account.pastSessions") || "جلسات گذشته"}
              </h1>
              <EmptyState
                title={translate("account.noPastSessions") || "جلسه‌ای یافت نشد"}
                description={translate("account.noPastSessionsDescription") || "جلسات گذشته کلاس‌های زنده اینجا نمایش داده می‌شوند."}
              />
            </div>
          )}

          {/* Transactions tab */}
          {activeTab === "transactions" && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-2xl font-bold text-[var(--theme-foreground)]">
                {translate("account.transactions") || "تراکنش‌ها"}
              </h1>
              <EmptyState
                title={translate("account.noTransactions") || "تراکنشی یافت نشد"}
                description={translate("account.noTransactionsDescription") || "تاریخچه خرید شما اینجا نمایش داده می‌شود."}
              />
            </div>
          )}

          {/* Settings tab */}
          {activeTab === "settings" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-2xl font-bold text-[var(--theme-foreground)]">
                {translate("account.accountSettings")}
              </h1>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-theme bg-card p-5 shadow-sm">
                  <h3 className="text-base font-semibold text-[var(--theme-foreground)] mb-4">{translate("account.displayName")}</h3>
                  <EditDisplayNameForm profileId={userData.id} currentDisplayName={userData.display_name} />
                </div>
                <div className="rounded-xl border border-theme bg-card p-5 shadow-sm">
                  <h3 className="text-base font-semibold text-[var(--theme-foreground)] mb-4">{translate("account.changePassword")}</h3>
                  <ChangePasswordForm profileId={userData.id} />
                </div>
                {needsSecondaryMethod && (
                  <div className="rounded-xl border border-theme bg-card p-5 shadow-sm">
                    <h3 className="text-base font-semibold text-[var(--theme-foreground)] mb-4">
                      {secondaryMethod === "email" ? translate("account.addEmail") : translate("account.addPhoneNumber")}
                    </h3>
                    <AddContactForm
                      method={secondaryMethod}
                      primaryMethod={primaryMethod}
                      defaultCountryCode={store?.country_code || undefined}
                    />
                  </div>
                )}
              </div>
              <div className="rounded-xl border border-theme bg-card p-5 shadow-sm">
                <ActiveSessions
                  translations={{
                    title: translate("account.activeSessions") || "جلسات فعال",
                    description: translate("account.activeSessionsDescription") || "مدیریت جلسات فعال خود در دستگاه‌های مختلف.",
                    currentSession: translate("account.currentSession") || "جلسه جاری",
                    lastUsed: translate("account.lastUsed") || "آخرین استفاده",
                    createdAt: translate("account.createdAt") || "ایجاد شده",
                    revokeSession: translate("account.revokeSession") || "لغو",
                    logoutAllDevices: translate("account.logoutAllDevices") || "خروج از همه دستگاه‌ها",
                    refresh: translate("account.refresh") || "بارگذاری مجدد",
                    noSessions: translate("account.noSessions") || "جلسه فعالی یافت نشد",
                    sessionRevoked: translate("account.sessionRevoked") || "جلسه لغو شد",
                    allSessionsRevoked: translate("account.allSessionsRevoked") || "همه جلسات لغو شدند.",
                    errorLoadingSessions: translate("account.errorLoadingSessions") || "خطا در بارگذاری جلسات",
                    errorRevokingSession: translate("account.errorRevokingSession") || "خطا در لغو جلسه",
                    confirmRevokeAll: translate("account.confirmRevokeAll") || "آیا مطمئن هستید؟",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      const loginPath = error.redirectTo || buildPath("/auth/login");
      redirect(`${loginPath}?redirect=${encodeURIComponent("/account")}`);
    }
    throw error;
  }
}
