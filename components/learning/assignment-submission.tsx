"use client";

import { useState } from "react";
import { CheckCircle2, Clock3 } from "lucide-react";

import { DiscussionThread } from "@/components/discussion/discussion-thread";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { listSubmissions, submitAssignment } from "@/lib/api/learning";
import { useLocaleFormat } from "@/hooks/use-locale-digits";
import { scoreLabel } from "@/lib/account-labels";
import { useTranslation } from "@/lib/i18n/hooks";
import { useApiQuery } from "@/hooks/use-api-query";

/** Only what handing in needs — a lesson, class or meeting assignment all fit. */
export interface SubmittableAssignment {
  id: string;
  title: string;
  description?: string | null;
  due_date?: string | null;
  max_score: number;
}

interface AssignmentSubmissionProps {
  assignment: SubmittableAssignment;
  currentProfileId: string;
}

/**
 * Handing in one piece of homework, wherever it came from — a recorded lesson
 * or a live class. Lateness is shown, never enforced: the server records it and
 * still accepts the work.
 */
export function AssignmentSubmissionForm({
  assignment,
  currentProfileId,
}: AssignmentSubmissionProps) {
  const { t, language } = useTranslation();
  const format = useLocaleFormat();
  const [content, setContent] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: submissionData, refresh: refreshSubmission } = useApiQuery({
    queryKey: ["submission", assignment.id],
    queryFn: (signal) =>
      listSubmissions({ assignmentId: assignment.id, limit: 1 }, { signal }),
  });
  const submission = submissionData?.submissions[0];

  const dueDate = assignment.due_date
    ? new Intl.DateTimeFormat(language, {
        dateStyle: "medium",
        timeStyle: "short",
        hourCycle: "h23",
      }).format(new Date(assignment.due_date))
    : null;

  const handleSubmit = async () => {
    if (!content.trim() && !fileUrl.trim()) {
      setFormError(t("learning.assignmentAnswerRequired"));
      return;
    }
    if (fileUrl.trim()) {
      try {
        const resourceUrl = new URL(fileUrl.trim());
        if (!["http:", "https:"].includes(resourceUrl.protocol)) {
          setFormError(t("learning.invalidResourceLink"));
          return;
        }
      } catch {
        setFormError(t("learning.invalidResourceLink"));
        return;
      }
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await submitAssignment({
        assignmentId: assignment.id,
        content: content.trim() || undefined,
        fileUrl: fileUrl.trim() || undefined,
      });
      // Re-read rather than patching the cache: what the server stored is the
      // learning record, and that is what the student must see.
      await refreshSubmission();
      setContent("");
      setFileUrl("");
    } catch {
      setFormError(t("learning.assignmentSubmitFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">{assignment.title}</h2>
            {assignment.description ? (
              <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                {assignment.description}
              </p>
            ) : null}
          </div>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
            {format.number(assignment.max_score)} {t("learning.points")}
          </span>
        </div>
        {dueDate ? (
          <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Clock3 className="size-4" aria-hidden="true" />
            {t("learning.dueDate")}: {dueDate}
          </p>
        ) : null}

        {submission ? (
          <div className="mt-6 rounded-xl bg-muted/50 p-4">
            <p className="flex items-center gap-2 font-medium">
              <CheckCircle2
                className="size-4 text-primary"
                aria-hidden="true"
              />
              {submission.status === "GRADED"
                ? t("learning.graded")
                : t("learning.submitted")}
              {submission.is_late ? (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-normal">
                  {t("learning.submittedLate")}
                </span>
              ) : null}
            </p>
            {submission.score !== null && submission.score !== undefined ? (
              <p className="mt-2 text-sm">
                {t("learning.score")}:{" "}
                {scoreLabel(
                  submission.score,
                  assignment.max_score,
                  t,
                  language,
                )}
              </p>
            ) : null}
            {submission.feedback ? (
              <p className="mt-3 whitespace-pre-wrap text-sm">
                {submission.feedback}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-6 space-y-4">
          <Textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder={t("learning.assignmentAnswerPlaceholder")}
            aria-label={t("learning.assignmentAnswer")}
            rows={7}
            maxLength={20_000}
          />
          <Input
            type="url"
            value={fileUrl}
            onChange={(event) => setFileUrl(event.target.value)}
            placeholder={t("learning.resourceLinkPlaceholder")}
            aria-label={t("learning.resourceLink")}
          />
          <p className="text-xs text-muted-foreground">
            {t("learning.uploadUnavailableNote")}
          </p>
          {formError ? (
            <p className="text-sm text-destructive">{formError}</p>
          ) : null}
          <Button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={submitting}
          >
            {submitting
              ? t("learning.submittingAssignment")
              : t("learning.submitAssignment")}
          </Button>
        </div>
      </section>

      {submission ? (
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7">
          <DiscussionThread
            submissionId={submission.id}
            currentProfileId={currentProfileId}
          />
        </section>
      ) : null}
    </div>
  );
}
