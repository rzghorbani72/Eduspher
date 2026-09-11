import { ExternalLink, UserRoundCheck } from "lucide-react";

import { AccountPageHeader } from "@/components/account/account-page-header";
import { StatusPill, toneForStatus } from "@/components/account/status-pill";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "@/components/ui/link";
import { getTutoringEngagements } from "@/lib/api/account-server";
import { getAcademyBySlug } from "@/lib/api/server";
import { getAcademyLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/server-translations";
import { getAcademyContext } from "@/lib/store-context";
import { coursePath, learnPath } from "@/lib/content-paths";
import { buildAcademyPath, formatDate } from "@/lib/utils";

const STATUS_KEY: Record<string, string> = {
  ACTIVE: "account.tutoringActive",
  PENDING: "account.tutoringPending",
  COMPLETED: "account.tutoringCompleted",
  EXPIRED: "account.tutoringExpired",
  CANCELLED: "account.tutoringCancelled",
};

export default async function AccountTutoringPage() {
  const academyContext = await getAcademyContext();
  const slugForPaths = academyContext.isSubdomain ? null : academyContext.slug;

  const [engagements, academy] = await Promise.all([
    getTutoringEngagements(),
    academyContext.slug
      ? getAcademyBySlug(academyContext.slug).catch(() => null)
      : null,
  ]);

  const language = getAcademyLanguage(
    academy?.language ?? null,
    academy?.country_code ?? null,
  );
  const translate = (key: string) => t(key, language);

  return (
    <div className="space-y-6">
      <AccountPageHeader
        title={translate("account.privateTutoring")}
        icon={UserRoundCheck}
      />

      {engagements.length === 0 ? (
        <EmptyState
          icon={<UserRoundCheck className="size-7" aria-hidden="true" />}
          title={translate("account.noPrivateTutoring")}
        />
      ) : (
        <ul className="space-y-3">
          {engagements.map((engagement) => {
            const isLive =
              engagement.status === "ACTIVE" || engagement.status === "PENDING";
            return (
              <li
                key={engagement.id}
                className="rounded-xl border border-theme bg-card p-4 "
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-(--theme-foreground)">
                      {engagement.Course?.title ?? translate("account.unknown")}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {translate("account.tutorLabel")}:{" "}
                      {engagement.Tutor?.display_name ??
                        translate("account.unknown")}
                    </p>
                    {engagement.ends_at ? (
                      <p className="mt-1 text-xs text-muted">
                        {translate("account.tutoringEnds")}:{" "}
                        {formatDate(engagement.ends_at, language)}
                      </p>
                    ) : null}
                  </div>
                  <StatusPill
                    label={
                      STATUS_KEY[engagement.status]
                        ? translate(STATUS_KEY[engagement.status])
                        : engagement.status
                    }
                    tone={toneForStatus(engagement.status)}
                  />
                </div>
                <Link
                  href={buildAcademyPath(
                    slugForPaths,
                    isLive
                      ? learnPath(engagement.Course?.slug || engagement.course_id)
                      : coursePath(
                          engagement.Course?.slug || engagement.course_id,
                        ),
                  )}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-(--theme-primary-ink) underline-offset-4 hover:underline"
                >
                  {isLive
                    ? translate("account.openTutoringCourse")
                    : translate("account.tutoringRenew")}
                  <ExternalLink className="size-3.5" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {/* A student cannot list their own tutoring sessions: GET /v1/tutoring/sessions
          is TEACHER+. Only engagements are shown until that endpoint opens up. */}
    </div>
  );
}
