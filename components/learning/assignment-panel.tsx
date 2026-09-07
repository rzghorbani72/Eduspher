"use client";

import { AssignmentSubmissionForm } from "@/components/learning/assignment-submission";
import { listAssignments } from "@/lib/api/learning";
import { useTranslation } from "@/lib/i18n/hooks";
import { useApiQuery } from "@/hooks/use-api-query";
import { queryKeys } from "@/lib/query/keys";

interface AssignmentPanelProps {
  lessonId: string;
  currentProfileId: string;
}

/** The homework of one recorded lesson. */
export function AssignmentPanel({
  lessonId,
  currentProfileId,
}: AssignmentPanelProps) {
  const { t } = useTranslation();
  const { data: assignmentData, error: assignmentError } = useApiQuery({
    queryKey: queryKeys.assignments(lessonId),
    queryFn: (signal) => listAssignments({ lessonId, limit: 1 }, { signal }),
  });
  const assignment = assignmentData?.assignments[0];

  if (assignmentError) {
    return (
      <p className="text-sm text-red-600">
        {t("learning.assignmentUnavailable")}
      </p>
    );
  }
  if (!assignmentData) {
    return (
      <p className="text-sm text-muted">{t("common.loading")}</p>
    );
  }
  if (!assignment) {
    return (
      <div className="rounded-2xl border border-dashed border-theme bg-surface p-6 text-center text-sm text-muted">
        {t("learning.assignmentUnavailable")}
      </div>
    );
  }

  return (
    <AssignmentSubmissionForm
      assignment={assignment}
      currentProfileId={currentProfileId}
    />
  );
}
