"use client";

import { useState } from "react";

import { AssignmentSubmissionForm } from "@/components/learning/assignment-submission";
import { PillButton } from "@/components/live/pill-button";
import { EmptyState } from "@/components/ui/empty-state";
import type {
  ClassAssignment,
  MyTutoringGroupSession,
} from "@/lib/api/account-types";
import { useTranslation } from "@/lib/i18n/hooks";
import { cn, formatDate, formatNumber } from "@/lib/utils";

interface ClassAssignmentsProps {
  assignments: ClassAssignment[];
  sessions: MyTutoringGroupSession[];
  selectedSessionId: string | null;
  currentProfileId: string;
}

/**
 * The homework of a live class, with where each piece stands: not sent yet,
 * waiting for the teacher, or scored. Defaults to the meeting the student is
 * looking at; "all" widens to the whole class.
 */
export function ClassAssignments({
  assignments,
  sessions,
  selectedSessionId,
  currentProfileId,
}: ClassAssignmentsProps) {
  const { t, language } = useTranslation();
  const [showAll, setShowAll] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  if (!assignments.length) {
    return <EmptyState compact title={t("live.noAssignments")} />;
  }

  const visible =
    showAll || !selectedSessionId
      ? assignments
      : assignments.filter((a) => a.tutoring_session_id === selectedSessionId);
  const open = visible.find((item) => item.id === openId) ?? null;

  const meetingOf = (assignment: ClassAssignment) =>
    sessions.find((s) => s.id === assignment.tutoring_session_id) ?? null;

  const statusOf = (assignment: ClassAssignment) => {
    const sub = assignment.my_submission;
    if (!sub)
      return { label: t("live.submissionNone"), tone: "bg-surface text-muted" };
    if (sub.status === "GRADED") {
      return {
        label: t("live.submissionGraded")
          .replace("{score}", formatNumber(sub.score ?? 0, language))
          .replace("{max}", formatNumber(assignment.max_score, language)),
        tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      };
    }
    if (sub.status === "REJECTED") {
      return {
        label: t("live.submissionRejected"),
        tone: "bg-red-500/10 text-red-600",
      };
    }
    return {
      label: t("live.submissionPending"),
      tone: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    };
  };

  return (
    <div className="space-y-5">
      <div className="flex gap-1">
        <PillButton
          active={!showAll}
          onClick={() => setShowAll(false)}
          label={t("live.assignmentsThisSession")}
        />
        <PillButton
          active={showAll}
          onClick={() => setShowAll(true)}
          label={t("live.assignmentsAll")}
        />
      </div>

      {visible.length ? (
        <ul className="divide-y divide-(--theme-hairline) rounded-xl border border-theme">
          {visible.map((assignment) => {
            const meeting = meetingOf(assignment);
            const status = statusOf(assignment);
            const isOpen = assignment.id === open?.id;
            return (
              <li key={assignment.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : assignment.id)}
                  aria-expanded={isOpen}
                  className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-start hover:bg-surface"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">
                      {assignment.title}
                    </span>
                    <span className="block text-xs text-muted">
                      {meeting ? formatDate(meeting.starts_at, language) : null}
                      {assignment.due_date
                        ? ` · ${t("live.dueOn").replace("{date}", formatDate(assignment.due_date, language))}`
                        : ""}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-semibold",
                      status.tone,
                    )}
                  >
                    {status.label}
                  </span>
                </button>
                {isOpen ? (
                  <div className="border-t border-(--theme-hairline) p-4">
                    <AssignmentSubmissionForm
                      key={assignment.id}
                      assignment={assignment}
                      currentProfileId={currentProfileId}
                    />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState compact title={t("live.noAssignmentsForSession")} />
      )}
    </div>
  );
}
