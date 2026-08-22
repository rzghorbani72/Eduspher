import { CheckCircle2 } from "lucide-react";

import { AccountPageHeader } from "@/components/account/account-page-header";
import { DataPanel } from "@/components/shared/data-list/data-panel";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "@/components/ui/link";
import { getSubmissions } from "@/lib/api/account-server";
import { getAcademyBySlug } from "@/lib/api/server";
import { getAcademyLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/server-translations";
import { getAcademyContext } from "@/lib/store-context";
import { scoreLabel } from "@/lib/account-labels";
import { buildAcademyPath, formatDate } from "@/lib/utils";

export default async function AccountResultsPage() {
  const academyContext = await getAcademyContext();
  const slugForPaths = academyContext.isSubdomain ? null : academyContext.slug;

  const [submissions, academy] = await Promise.all([
    getSubmissions(),
    academyContext.slug
      ? getAcademyBySlug(academyContext.slug).catch(() => null)
      : null,
  ]);

  const language = getAcademyLanguage(
    academy?.language ?? null,
    academy?.country_code ?? null,
  );
  const translate = (key: string) => t(key, language);
  const graded = submissions.filter(
    (submission) => submission.status === "GRADED",
  );

  return (
    <div className="space-y-6">
      <AccountPageHeader
        title={translate("account.results")}
        description={translate("account.resultsDescription")}
        icon={CheckCircle2}
      />

      <DataPanel title={translate("account.assignmentResults")}>
        {graded.length === 0 ? (
          <EmptyState
            compact
            icon={<CheckCircle2 className="size-7" aria-hidden="true" />}
            title={translate("account.noResults")}
          />
        ) : (
          <ul className="space-y-3">
            {graded.map((submission) => (
              <li
                key={submission.id}
                className="rounded-xl border border-theme bg-card p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link
                      href={buildAcademyPath(
                        slugForPaths,
                        `/account/assignments/${submission.assignment_id}`,
                      )}
                      className="font-medium text-(--theme-foreground) hover:underline"
                    >
                      {submission.Assignment?.title ??
                        translate("account.unknown")}
                    </Link>
                    <p className="mt-1 text-xs text-muted">
                      {translate("account.attemptSubmitted")}:{" "}
                      {formatDate(
                        submission.graded_at ?? submission.submitted_at,
                        language,
                      )}
                    </p>
                  </div>
                  <p className="font-semibold text-(--theme-primary-ink)">
                    {scoreLabel(
                      submission.score,
                      submission.Assignment?.max_score,
                      translate,
                      language,
                    )}
                  </p>
                </div>
                {submission.feedback ? (
                  <p className="mt-3 whitespace-pre-wrap text-sm text-muted">
                    {submission.feedback}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </DataPanel>

      {/* Quiz attempts have no student-wide list endpoint yet — an attempt is
          reachable from its lesson, and by id at /account/results/quiz/[id]. */}
    </div>
  );
}
