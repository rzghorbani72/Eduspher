import { GraduationCap, Plus } from "lucide-react";

import { AccountPageHeader } from "@/components/account/account-page-header";
import { EnrolledCourseCard } from "@/components/account/enrolled-course-card";
import { COURSE_CARD_GRID_CLASS } from "@/components/courses/course-card-layout";
import { ExtraAccessList } from "@/components/account/courses/extra-access-list";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "@/components/ui/link";
import { getCourseAccess } from "@/lib/api/account-server";
import { getAcademyBySlug, getEnrollments } from "@/lib/api/server";
import type { LanguageCode } from "@/lib/i18n/config";
import { getAcademyLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/server-translations";
import { getAcademyContext } from "@/lib/store-context";
import { buildAcademyPath } from "@/lib/utils";

export default async function AccountCoursesPage() {
  const academyContext = await getAcademyContext();
  const slugForPaths = academyContext.isSubdomain ? null : academyContext.slug;
  const buildPath = (path: string) => buildAcademyPath(slugForPaths, path);

  const [enrollmentsData, accessRows, academy] = await Promise.all([
    getEnrollments({ limit: 100 }).catch(() => null),
    getCourseAccess(),
    academyContext.slug
      ? getAcademyBySlug(academyContext.slug).catch(() => null)
      : null,
  ]);

  const language = getAcademyLanguage(
    academy?.language ?? null,
    academy?.country_code ?? null,
  );
  const translate = (key: string) => t(key, language);

  const enrollments = enrollmentsData?.enrollments ?? [];
  const active = enrollments.filter((item) => item.status !== "COMPLETED");
  const completed = enrollments.filter((item) => item.status === "COMPLETED");

  // A subscription, tutoring term or group grant opens a course without creating
  // an Enrollment row, so those courses would otherwise be invisible here.
  const enrolledCourseIds = new Set(
    enrollments.map((item) => String(item.course_id)),
  );
  const extraAccess = accessRows.filter(
    (row) => !enrolledCourseIds.has(row.course_id),
  );

  return (
    <div className="space-y-6">
      <AccountPageHeader
        title={translate("account.myCourses")}
        description={translate("account.coursesDescription")}
        icon={GraduationCap}
        actions={
          <Link
            href={buildPath("/courses")}
            className="inline-flex items-center gap-1.5 rounded-full border border-theme bg-card px-4 py-2 text-sm font-semibold text-(--theme-foreground) transition-all hover:border-(--theme-primary)/40 hover:bg-surface"
          >
            <Plus size={14} />
            {translate("account.browseMore")}
          </Link>
        }
      />

      {enrollments.length === 0 && extraAccess.length === 0 ? (
        <EmptyState
          icon={<GraduationCap className="size-7" aria-hidden="true" />}
          title={translate("account.noCoursesPurchased")}
          description={translate("account.browseCatalogDescription")}
          action={
            <Link
              href={buildPath("/courses")}
              className="inline-flex h-11 items-center rounded-full bg-(--theme-primary) px-6 text-sm font-semibold text-(--theme-on-primary) shadow-lg transition-all hover:scale-105"
            >
              {translate("account.browseCourses")}
            </Link>
          }
        />
      ) : null}

      <CourseSection
        title={translate("account.activeCourses")}
        enrollments={active}
        storeSlug={slugForPaths}
        language={language}
      />

      {extraAccess.length > 0 ? (
        <ExtraAccessList
          rows={extraAccess}
          storeSlug={slugForPaths}
          language={language}
        />
      ) : null}

      <CourseSection
        title={translate("account.completedCourses")}
        enrollments={completed}
        storeSlug={slugForPaths}
        language={language}
      />
    </div>
  );
}

function CourseSection({
  title,
  enrollments,
  storeSlug,
  language,
}: {
  title: string;
  enrollments: Awaited<ReturnType<typeof getEnrollments>> extends null
    ? never
    : NonNullable<Awaited<ReturnType<typeof getEnrollments>>>["enrollments"];
  storeSlug: string | null;
  language: LanguageCode;
}) {
  if (enrollments.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-(--theme-foreground)">
        {title}
      </h2>
      <div className={COURSE_CARD_GRID_CLASS}>
        {enrollments.map((enrollment, index) => (
          <EnrolledCourseCard
            key={enrollment.id}
            enrollment={enrollment}
            storeSlug={storeSlug}
            language={language}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}
