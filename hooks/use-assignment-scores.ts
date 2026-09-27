'use client';

import { useMemo } from 'react';

import { useApiQuery } from '@/hooks/use-api-query';
import { listSubmissions, type SubmissionStatus } from '@/lib/api/learning';

export interface LessonAssignmentScore {
  status: SubmissionStatus;
  score: number | null;
  maxScore: number;
}

const NO_SCORES: Readonly<Record<string, LessonAssignmentScore>> = {};

/** This student's assignment result per lesson id, for the course sidebar. */
export function useAssignmentScores(courseId: string, enabled: boolean) {
  const { data } = useApiQuery({
    queryKey: ['assignment-scores', courseId],
    queryFn: (signal) => listSubmissions({ courseId, limit: 100 }, { signal }),
    enabled,
  });

  return useMemo(() => {
    const byLesson: Record<string, LessonAssignmentScore> = {};
    for (const submission of data?.submissions ?? []) {
      const lessonId = submission.Assignment?.Lesson?.id;
      if (!lessonId || !submission.Assignment) continue;
      byLesson[lessonId] = {
        status: submission.status,
        score: submission.score ?? null,
        maxScore: submission.Assignment.max_score,
      };
    }
    return data ? byLesson : NO_SCORES;
  }, [data]);
}
