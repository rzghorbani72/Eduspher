'use client';

import { useApiQuery } from '@/hooks/use-api-query';
import { getQuizGates, type QuizGate } from '@/lib/api/client';

const NO_GATES: Readonly<Record<string, QuizGate>> = {};

/** Lessons this student cannot open yet because a required quiz comes first. */
export function useQuizGates(courseId: string, enabled: boolean) {
  const { data, refresh } = useApiQuery({
    queryKey: ['quiz-gates', courseId],
    queryFn: (signal) => getQuizGates(courseId, { signal }),
    enabled,
  });
  return { gates: data ?? NO_GATES, refresh };
}
