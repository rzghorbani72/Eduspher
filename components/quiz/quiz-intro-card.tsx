'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { StudentQuiz } from '@/lib/api/client';
import { useTranslation } from '@/lib/i18n/hooks';
import { toPersianDigits } from '@/lib/utils';

interface Props {
  quiz: StudentQuiz;
  busy: boolean;
  onStart: () => void;
}

/** The rules before starting: how many questions, the pass mark, attempts left, past results. */
export function QuizIntroCard({ quiz, busy, onStart }: Props) {
  const { t, language } = useTranslation();
  const n = (value: number) => toPersianDigits(value, language);
  const best = quiz.attempts.reduce<number | null>((top, row) => {
    if (row.status === 'IN_PROGRESS' || row.max_score <= 0) return top;
    const percent = Math.round((row.score / row.max_score) * 100);
    return top == null || percent > top ? percent : top;
  }, null);

  return (
    <Card className="space-y-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">{quiz.title}</h3>
        <div className="flex gap-2">
          {quiz.is_required && <Badge variant="warning">{t('learning.quizRequired')}</Badge>}
          {quiz.is_final && <Badge variant="outline">{t('learning.quizFinal')}</Badge>}
          {quiz.passed && <Badge variant="success">{t('learning.passed')}</Badge>}
        </div>
      </div>
      {quiz.description && <p className="text-muted-foreground text-sm">{quiz.description}</p>}

      <ul className="text-muted-foreground space-y-1 text-sm">
        <li>{t('learning.quizQuestionCount').replace('{count}', n(quiz.question_count))}</li>
        <li>{t('learning.quizPassMark').replace('{percent}', n(quiz.pass_percent))}</li>
        <li>
          {quiz.attempts_left == null
            ? t('learning.quizUnlimitedAttempts')
            : t('learning.quizAttemptsLeft').replace('{count}', n(quiz.attempts_left))}
        </li>
        {best != null && <li>{t('learning.quizBestResult').replace('{percent}', n(best))}</li>}
      </ul>

      {quiz.can_start ? (
        <Button onClick={onStart} disabled={busy}>
          {quiz.open_attempt_id
            ? t('learning.quizResume')
            : quiz.attempts.length > 0
              ? t('learning.quizTryAgain')
              : t('learning.quizStart')}
        </Button>
      ) : !quiz.passed ? (
        <p className="text-destructive text-sm">{t('learning.quizNoAttemptsLeft')}</p>
      ) : null}
    </Card>
  );
}
