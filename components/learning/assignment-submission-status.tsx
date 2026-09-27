'use client';

import { CheckCircle2 } from 'lucide-react';

import { AnswerImageGallery } from '@/components/learning/answer-image-gallery';
import type { AssignmentSubmission } from '@/lib/api/learning';
import { scoreLabel } from '@/lib/account-labels';
import { useTranslation } from '@/lib/i18n/hooks';

interface AssignmentSubmissionStatusProps {
  submission: AssignmentSubmission;
  maxScore: number;
}

/** What the student handed in and, once graded, the score and feedback. */
export function AssignmentSubmissionStatus({
  submission,
  maxScore,
}: AssignmentSubmissionStatusProps) {
  const { t, language } = useTranslation();

  return (
    <div className="bg-surface mt-6 rounded-xl p-4">
      <p className="flex items-center gap-2 font-medium">
        <CheckCircle2 className="text-primary size-4" aria-hidden="true" />
        {submission.status === 'GRADED' ? t('learning.graded') : t('learning.submitted')}
        {submission.is_late ? (
          <span className="bg-surface-alt rounded-full px-2 py-0.5 text-xs font-normal">
            {t('learning.submittedLate')}
          </span>
        ) : null}
      </p>
      {submission.score != null ? (
        <p className="mt-2 text-sm">
          {t('learning.score')}: {scoreLabel(submission.score, maxScore, t, language)}
        </p>
      ) : null}
      {submission.feedback ? (
        <p className="mt-3 text-sm whitespace-pre-wrap">{submission.feedback}</p>
      ) : null}
      {submission.content ? (
        <p className="text-muted mt-3 text-sm whitespace-pre-wrap">{submission.content}</p>
      ) : null}
      <AnswerImageGallery submissionId={submission.id} imageIds={submission.image_ids ?? []} />
    </div>
  );
}
