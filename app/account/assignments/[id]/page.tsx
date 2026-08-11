import { ArrowRight, ClipboardList } from "lucide-react";
import { notFound } from "next/navigation";

import { AccountPageHeader } from "@/components/account/account-page-header";
import { StatusPill, toneForStatus } from "@/components/account/status-pill";
import { DiscussionThread } from "@/components/discussion/discussion-thread";
import Link from "@/components/ui/link";
import { getAssignment, getSubmissions } from "@/lib/api/account-server";
import { getAcademyBySlug } from "@/lib/api/server";
import { getSession } from "@/lib/auth/session";
import { getAcademyLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/server-translations";
import { getAcademyContext } from "@/lib/store-context";
import { buildAcademyPath, formatDate } from "@/lib/utils";

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const academyContext = await getAcademyContext();
  const session = await getSession();
  const slugForPaths = academyContext.isSubdomain ? null : academyContext.slug;

  const [assignment, submissions, academy] = await Promise.all([
    getAssignment(id),
    getSubmissions(),
    academyContext.slug ? getAcademyBySlug(academyContext.slug).catch(() => null) : null,
  ]);

  if (!assignment) notFound();

  const language = getAcademyLanguage(academy?.language ?? null, academy?.country_code ?? null);
  const translate = (key: string) => t(key, language);
  const submission = submissions.find((item) => item.assignment_id === assignment.id) ?? null;
  const courseId = assignment.Lesson?.Season?.course_id;

  return (
    <div className="space-y-6">
      <Link
        href={buildAcademyPath(slugForPaths, "/account/assignments")}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
      >
        <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
        {translate("account.backToAssignments")}
      </Link>

      <AccountPageHeader
        title={assignment.title}
        description={assignment.Lesson?.Season?.Course?.title ?? undefined}
        icon={ClipboardList}
        actions={
          courseId ? (
            <Link
              href={buildAcademyPath(slugForPaths, `/learn/${courseId}/${assignment.lesson_id}`)}
              className="inline-flex h-10 items-center rounded-full bg-(--theme-primary) px-5 text-sm font-semibold text-(--theme-on-primary) transition-opacity hover:opacity-90"
            >
              {translate("account.openAssignment")}
            </Link>
          ) : null
        }
      />

      <section className="space-y-3 rounded-2xl border border-theme bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
          <span>
            {translate("account.assignmentDue")}:{" "}
            {assignment.due_at ? formatDate(assignment.due_at, language) : translate("account.noDueDate")}
          </span>
          <span>
            {translate("learning.points")}: {assignment.max_score}
          </span>
        </div>
        {assignment.description ? (
          <p className="whitespace-pre-wrap text-sm text-(--theme-foreground)">
            {assignment.description}
          </p>
        ) : null}
      </section>

      <section className="space-y-3 rounded-2xl border border-theme bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-(--theme-foreground)">
            {translate("account.yourSubmission")}
          </h2>
          {submission ? (
            <StatusPill
              label={
                submission.status === "GRADED"
                  ? translate("learning.graded")
                  : translate("learning.submitted")
              }
              tone={toneForStatus(submission.status)}
            />
          ) : (
            <StatusPill label={translate("account.notSubmitted")} tone="neutral" />
          )}
        </div>

        {submission ? (
          <>
            {submission.content ? (
              <p className="whitespace-pre-wrap text-sm text-(--theme-foreground)">
                {submission.content}
              </p>
            ) : null}
            <p className="text-xs text-muted">
              {translate("learning.submitted")}: {formatDate(submission.submitted_at, language, true)}
            </p>
            <div className="border-t border-theme pt-3">
              <h3 className="mb-1 text-sm font-semibold text-(--theme-foreground)">
                {translate("account.teacherFeedback")}
              </h3>
              {submission.status === "GRADED" ? (
                <>
                  <p className="font-semibold text-(--theme-primary)">
                    {translate("learning.score")}: {submission.score} / {assignment.max_score}
                  </p>
                  {submission.feedback ? (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-muted">
                      {submission.feedback}
                    </p>
                  ) : null}
                </>
              ) : (
                <p className="text-sm text-muted">{translate("account.awaitingGrade")}</p>
              )}
            </div>
          </>
        ) : (
          <p className="text-sm text-muted">{translate("account.notSubmitted")}</p>
        )}
      </section>

      {submission ? (
        <section className="rounded-2xl border border-theme bg-card p-5 shadow-sm">
          <DiscussionThread
            submissionId={submission.id}
            threadId={submission.thread_id ?? undefined}
            currentProfileId={String(session?.profileId ?? "")}
          />
        </section>
      ) : null}
    </div>
  );
}
