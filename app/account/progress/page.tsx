import { BookOpenCheck } from "lucide-react";

import { AccountPageHeader } from "@/components/account/account-page-header";
import { DataPanel } from "@/components/shared/data-list/data-panel";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "@/components/ui/link";
import { getLearningSummary, getLearningTimeline } from "@/lib/api/account-server";
import { getAcademyBySlug } from "@/lib/api/server";
import { getAcademyLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/server-translations";
import { getAcademyContext } from "@/lib/store-context";
import { buildAcademyPath, formatDate } from "@/lib/utils";

/** Activity types come from the backend enum; unknown ones fall back to the raw value. */
const ACTIVITY_LABEL_KEY: Record<string, string> = {
  VIDEO_HEARTBEAT: "account.videoSessions",
  LESSON_COMPLETED: "learning.completed",
  QUIZ_SUBMITTED: "learning.submitQuiz",
  ASSIGNMENT_SUBMITTED: "learning.submitted",
  LIVE_ATTENDED: "learning.liveClass",
  ENROLLMENT_ACTIVATED: "courses.enrolled",
};

export default async function AccountProgressPage() {
  const academyContext = await getAcademyContext();
  const slugForPaths = academyContext.isSubdomain ? null : academyContext.slug;

  const [summary, timeline, academy] = await Promise.all([
    getLearningSummary(),
    getLearningTimeline(),
    academyContext.slug ? getAcademyBySlug(academyContext.slug).catch(() => null) : null,
  ]);

  const language = getAcademyLanguage(academy?.language ?? null, academy?.country_code ?? null);
  const translate = (key: string) => t(key, language);
  const rows = summary?.enrollments ?? [];

  return (
    <div className="space-y-6">
      <AccountPageHeader
        title={translate("account.myProgress")}
        description={translate("account.progressDescription")}
        icon={BookOpenCheck}
      />

      {rows.length === 0 ? (
        <EmptyState title={translate("account.noProgressYet")} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {rows.map((row) => {
            const percent = Math.min(100, Math.max(0, Math.round(row.progress_percent)));
            return (
              <Link
                key={row.id}
                href={buildAcademyPath(slugForPaths, `/learn/${row.course_id}`)}
                className="rounded-2xl border border-theme bg-card p-5 shadow-sm transition hover:border-(--theme-primary)/40"
              >
                <p className="font-semibold text-(--theme-foreground)">
                  {row.Course?.title ?? translate("account.unknown")}
                </p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface">
                  <div
                    className="h-full rounded-full bg-(--theme-primary)"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
                  <span>
                    {percent}% {translate("account.complete")}
                  </span>
                  {row.video_heartbeats > 0 ? (
                    <span>
                      {row.video_heartbeats} {translate("account.videoSessions")}
                    </span>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <DataPanel title={translate("account.recentActivity")}>
        {timeline.length === 0 ? (
          <EmptyState title={translate("account.noActivity")} />
        ) : (
          <ol className="space-y-2">
            {timeline.map((activity) => (
              <li
                key={activity.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-theme pb-2 text-sm last:border-0 last:pb-0"
              >
                <span className="text-(--theme-foreground)">
                  {ACTIVITY_LABEL_KEY[activity.activity_type]
                    ? translate(ACTIVITY_LABEL_KEY[activity.activity_type])
                    : activity.activity_type}
                </span>
                <span className="text-muted">
                  {formatDate(activity.created_at, language, true)}
                </span>
              </li>
            ))}
          </ol>
        )}
      </DataPanel>
    </div>
  );
}
