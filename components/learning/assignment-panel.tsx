'use client';

import { AssignmentSubmissionForm } from '@/components/learning/assignment-submission';
import { listAssignments } from '@/lib/api/learning';
import { useTranslation } from '@/lib/i18n/hooks';
import { useApiQuery } from '@/hooks/use-api-query';
import { queryKeys } from '@/lib/query/keys';

interface AssignmentPanelProps {
  parent: { kind: 'lesson' | 'season'; id: string };
  currentProfileId: string;
}

/** The homework of one recorded lesson or season. */
export function AssignmentPanel({ parent, currentProfileId }: AssignmentPanelProps) {
  const { t } = useTranslation();
  const { kind, id } = parent;
  const { data: assignmentData, error: assignmentError } = useApiQuery({
    queryKey: queryKeys.assignments(kind, id),
    queryFn: (signal) =>
      listAssignments(
        { ...(kind === 'lesson' ? { lessonId: id } : { seasonId: id }), limit: 1 },
        { signal },
      ),
  });
  const assignment = assignmentData?.assignments[0];

  if (assignmentError) {
    return <p className="text-sm text-red-600">{t('learning.assignmentUnavailable')}</p>;
  }
  if (!assignmentData) {
    return <p className="text-muted text-sm">{t('common.loading')}</p>;
  }
  if (!assignment) {
    return (
      <div className="border-theme bg-surface text-muted rounded-2xl border border-dashed p-6 text-center text-sm">
        {t('learning.assignmentUnavailable')}
      </div>
    );
  }

  return <AssignmentSubmissionForm assignment={assignment} currentProfileId={currentProfileId} />;
}
