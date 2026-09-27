'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DiscussionThread } from '@/components/discussion/discussion-thread';
import { useTranslation } from '@/lib/i18n/hooks';
import { QuizIntroCard } from './quiz-intro-card';
import { QuizQuestionCard } from './quiz-question-card';
import { QuizResultCard } from './quiz-result-card';
import { useQuizFlow, type QuizParent } from './use-quiz-flow';

interface LessonQuizProps {
  parent: QuizParent;
  currentProfileId?: string;
  storeSlug?: string | null;
  /** Lets the player unlock the lessons this quiz was holding back. */
  onPassed?: () => void;
}

/**
 * The student side of a quiz. Answer keys are stripped server-side, every
 * attempt is a fresh random draw from the teacher's bank, and drafts are
 * autosaved so a refresh never loses work.
 */
export function LessonQuiz({
  parent,
  currentProfileId,
  storeSlug = null,
  onPassed,
}: LessonQuizProps) {
  const { t } = useTranslation();
  const flow = useQuizFlow(parent, onPassed);
  const { quiz, attempt } = flow;

  if (flow.loading) {
    return <p className="text-muted-foreground text-sm">{t('learning.loadingQuiz')}</p>;
  }
  if (flow.failure === 'staff') {
    return <p className="text-muted-foreground text-sm">{t('learning.quizStaffNote')}</p>;
  }
  if (!quiz) return <p className="text-destructive text-sm">{t('learning.quizUnavailable')}</p>;

  if (!attempt) {
    return (
      <div className="space-y-3">
        <QuizIntroCard quiz={quiz} busy={flow.busy} onStart={() => void flow.start()} />
        {flow.failure === 'start' && (
          <p className="text-destructive text-sm">{t('learning.quizStartFailed')}</p>
        )}
      </div>
    );
  }

  if (attempt.status !== 'IN_PROGRESS') {
    const canRetry = !attempt.passed && attempt.status === 'GRADED' && quiz.can_start;
    return (
      <div className="space-y-6">
        <QuizResultCard
          title={quiz.title}
          attempt={attempt}
          onTryAgain={canRetry ? flow.backToIntro : null}
          storeSlug={storeSlug}
        />
        <Card className="p-6">
          <DiscussionThread attemptId={attempt.id} currentProfileId={currentProfileId} />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">{quiz.title}</h3>
      {(attempt.Question ?? []).map((question, index) => (
        <QuizQuestionCard
          key={question.id}
          question={question}
          index={index}
          value={flow.answers[question.id]}
          onChange={(value) => flow.setAnswer(question.id, value)}
        />
      ))}

      {flow.failure === 'submit' && (
        <p className="text-destructive text-sm">{t('learning.quizSubmitFailed')}</p>
      )}
      <div className="flex items-center gap-3">
        <Button onClick={() => void flow.submit()} disabled={flow.busy}>
          {flow.busy ? t('learning.submittingQuiz') : t('learning.submitQuiz')}
        </Button>
        {flow.draftState === 'saved' && (
          <span className="text-muted-foreground text-xs">{t('learning.quizDraftSaved')}</span>
        )}
        {flow.draftState === 'failed' && (
          <span className="text-destructive text-xs">{t('learning.quizDraftSaveFailed')}</span>
        )}
      </div>
    </div>
  );
}
