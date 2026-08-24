"use client";

import { useState } from "react";

import { AssignmentSubmissionForm } from "@/components/learning/assignment-submission";
import { EmptyState } from "@/components/ui/empty-state";
import type {
  ClassAssignment,
  MyTutoringGroupSession,
} from "@/lib/api/account-types";
import { useTranslation } from "@/lib/i18n/hooks";
import { cn, formatDate } from "@/lib/utils";

interface ClassAssignmentsProps {
  assignments: ClassAssignment[];
  sessions: MyTutoringGroupSession[];
  currentProfileId: string;
}

/**
 * The homework of a live class. It arrives inside the classroom payload, so
 * picking one costs no round trip; only the chosen one loads its submission.
 */
export function ClassAssignments({
  assignments,
  sessions,
  currentProfileId,
}: ClassAssignmentsProps) {
  const { t, language } = useTranslation();
  const [selectedId, setSelectedId] = useState(assignments[0]?.id ?? null);

  if (!assignments.length) {
    return <EmptyState compact title={t("live.noAssignments")} />;
  }

  const selected = assignments.find((item) => item.id === selectedId);
  const meetingOf = (assignment: ClassAssignment) =>
    assignment.tutoring_session_id
      ? sessions.find(
          (session) => session.id === assignment.tutoring_session_id,
        )
      : null;

  return (
    <div className="space-y-5">
      <ul className="flex flex-wrap gap-2">
        {assignments.map((assignment) => {
          const meeting = meetingOf(assignment);
          return (
            <li key={assignment.id}>
              <button
                type="button"
                onClick={() => setSelectedId(assignment.id)}
                aria-pressed={assignment.id === selectedId}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                  assignment.id === selectedId
                    ? "bg-(--theme-primary) text-(--theme-on-primary)"
                    : "bg-surface text-muted hover:text-(--theme-foreground)",
                )}
              >
                {assignment.title}
                {meeting ? (
                  <span className="ms-1 font-normal opacity-80">
                    · {formatDate(meeting.starts_at, language)}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>

      {selected ? (
        <AssignmentSubmissionForm
          key={selected.id}
          assignment={selected}
          currentProfileId={currentProfileId}
        />
      ) : null}
    </div>
  );
}
