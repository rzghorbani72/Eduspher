"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { CheckCircle2, Clock3 } from "lucide-react";

import { DiscussionThread } from "@/components/discussion/discussion-thread";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  listAssignments,
  listSubmissions,
  submitAssignment,
} from "@/lib/api/learning";
import { useTranslation } from "@/lib/i18n/hooks";

interface AssignmentPanelProps {
  lessonId: string;
  enrollmentId: string;
  currentProfileId: string;
}

export function AssignmentPanel({
  lessonId,
  enrollmentId,
  currentProfileId,
}: AssignmentPanelProps) {
  const { t, language } = useTranslation();
  const [content, setContent] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { data: assignmentData, error: assignmentError } = useSWR(
    `assignment:${lessonId}`,
    () => listAssignments({ lessonId, limit: 1 }),
  );
  const assignment = assignmentData?.assignments[0];
  const { data: submissionData, mutate } = useSWR(
    assignment ? `submission:${assignment.id}:${enrollmentId}` : null,
    () => listSubmissions({ assignmentId: assignment?.id, enrollmentId, limit: 1 }),
  );
  const submission = submissionData?.submissions[0];

  const dueDate = useMemo(() => {
    if (!assignment?.due_date) return null;
    return new Intl.DateTimeFormat(language, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(assignment.due_date));
  }, [assignment?.due_date, language]);

  const handleSubmit = async () => {
    if (!assignment || (!content.trim() && !fileUrl.trim())) {
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
      const created = await submitAssignment({
        assignmentId: assignment.id,
        enrollmentId,
        content: content.trim() || undefined,
        fileUrl: fileUrl.trim() || undefined,
      });
      await mutate(
        (current) =>
          current
            ? { ...current, submissions: [created], pagination: current.pagination }
            : current,
        true,
      );
      setContent("");
      setFileUrl("");
    } catch {
      setFormError(t("learning.assignmentSubmitFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  if (assignmentError) {
    return <p className="text-sm text-destructive">{t("learning.assignmentUnavailable")}</p>;
  }
  if (!assignmentData) {
    return <p className="text-sm text-muted-foreground">{t("common.loading")}</p>;
  }
  if (!assignment) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        {t("learning.assignmentUnavailable")}
      </div>
    );
  }

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
            {assignment.max_score} {t("learning.points")}
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
              <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
              {submission.status === "GRADED"
                ? t("learning.graded")
                : t("learning.submitted")}
            </p>
            {submission.score !== null && submission.score !== undefined ? (
              <p className="mt-2 text-sm">
                {t("learning.score")}: {submission.score} / {assignment.max_score}
              </p>
            ) : null}
            {submission.feedback ? (
              <p className="mt-3 whitespace-pre-wrap text-sm">{submission.feedback}</p>
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
          {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
          <Button type="button" onClick={() => void handleSubmit()} disabled={submitting}>
            {submitting ? t("learning.submittingAssignment") : t("learning.submitAssignment")}
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
