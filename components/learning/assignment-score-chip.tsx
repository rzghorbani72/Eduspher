'use client';

import type { LessonAssignmentScore } from '@/hooks/use-assignment-scores';
import { useLocaleFormat } from '@/hooks/use-locale-digits';

interface AssignmentScoreChipProps {
  result: LessonAssignmentScore;
  t: (key: string) => string;
}

export function AssignmentScoreChip({ result, t }: AssignmentScoreChipProps) {
  const format = useLocaleFormat();
  if (result.status === 'GRADED' && result.score != null) {
    return (
      <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
        <bdi>{`${format.number(result.score)}/${format.number(result.maxScore)}`}</bdi>
      </span>
    );
  }
  if (result.status !== 'SUBMITTED') return null;
  return (
    <span className="bg-surface-alt text-muted shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold">
      {t('learning.awaitingGrade')}
    </span>
  );
}
