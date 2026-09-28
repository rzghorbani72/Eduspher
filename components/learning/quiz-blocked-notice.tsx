'use client';

import { Unavailable } from '@/components/learning/unavailable';
import Link from '@/components/ui/link';
import type { QuizGate } from '@/lib/api/client';

const ACTION_CLASS =
  'inline-flex rounded-lg bg-(--theme-primary) px-4 py-2 text-sm font-bold text-white';

interface QuizBlockedNoticeProps {
  gate: QuizGate;
  /** Set when the blocking quiz sits on a lesson the student can go to. */
  quizLessonHref: string | null;
  onOpenSeasonQuiz: (seasonId: string) => void;
  t: (key: string) => string;
}

/** Why this lesson is locked, and one click to the quiz that unlocks it. */
export function QuizBlockedNotice({
  gate,
  quizLessonHref,
  onOpenSeasonQuiz,
  t,
}: QuizBlockedNoticeProps) {
  const seasonId = gate.season_id;
  return (
    <div className="space-y-3 pt-6 text-center">
      <Unavailable message={t('learning.passQuizFirst').replace('{quiz}', gate.title)} />
      {quizLessonHref ? (
        <Link href={quizLessonHref} className={ACTION_CLASS}>
          {t('learning.goToQuiz')}
        </Link>
      ) : seasonId ? (
        <button type="button" onClick={() => onOpenSeasonQuiz(seasonId)} className={ACTION_CLASS}>
          {t('learning.goToQuiz')}
        </button>
      ) : null}
    </div>
  );
}
