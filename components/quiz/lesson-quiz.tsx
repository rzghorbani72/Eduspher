'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock } from 'lucide-react';
import {
  getLessonQuiz,
  startQuizAttempt,
  saveQuizAnswers,
  submitQuizAttempt,
  type StudentQuiz,
  type QuizAttempt,
  type QuizAnswer,
  type AnswerInput,
} from '@/lib/api/client';
import { DiscussionThread } from '@/components/discussion/discussion-thread';
import { useTranslation } from '@/lib/i18n/hooks';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { logger } from '@/lib/logging/app-logger';
import { errorFields } from '@/lib/logging/error-fields';

interface LessonQuizProps {
  lessonId: string;
  currentProfileId?: string;
}

type AnswerState = Record<
  string,
  { selected_option_id?: string; answer_boolean?: boolean; answer_text?: string }
>;

const DRAFT_SAVE_DELAY_MS = 800;

function restoreDrafts(saved: QuizAnswer[] = []): AnswerState {
  const drafts: AnswerState = {};
  for (const a of saved) {
    if (a.selected_option_id) drafts[a.question_id] = { selected_option_id: a.selected_option_id };
    else if (a.answer_boolean != null) drafts[a.question_id] = { answer_boolean: a.answer_boolean };
    else if (a.answer_text) drafts[a.question_id] = { answer_text: a.answer_text };
  }
  return drafts;
}

function toPayload(answers: AnswerState): AnswerInput[] {
  return Object.entries(answers).map(([question_id, v]) => ({ question_id, ...v }));
}

/**
 * Student quiz experience: load the published quiz (answer keys already stripped
 * server-side), answer each question by type, submit, then show the result and
 * the contextual discussion thread. Drafts are restored from the resumed attempt
 * and autosaved so a refresh never loses work.
 */
export function LessonQuiz({ lessonId, currentProfileId }: LessonQuizProps) {
  const { t } = useTranslation();
  const quizUnavailable = t('learning.quizUnavailable');
  const [quiz, setQuiz] = useState<StudentQuiz | null>(null);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftState, setDraftState] = useState<'idle' | 'saved' | 'failed'>('idle');
  const lastSaved = useRef('');
  const debouncedAnswers = useDebounce(answers, DRAFT_SAVE_DELAY_MS);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = await getLessonQuiz(lessonId);
      setQuiz(q);
      const a = await startQuizAttempt(q.id);
      setAttempt(a);
      const drafts = restoreDrafts(a.Answer);
      lastSaved.current = JSON.stringify(drafts);
      setAnswers(drafts);
    } catch {
      setError(quizUnavailable);
    } finally {
      setLoading(false);
    }
  }, [lessonId, quizUnavailable]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!attempt || attempt.status !== 'IN_PROGRESS') return;
    const snapshot = JSON.stringify(debouncedAnswers);
    if (snapshot === lastSaved.current) return;
    const attemptId = attempt.id;
    void (async () => {
      try {
        await saveQuizAnswers(attemptId, toPayload(debouncedAnswers));
        lastSaved.current = snapshot;
        setDraftState('saved');
      } catch (err) {
        logger.warn('Quiz', 'DraftSaveFailed', { attempt_id: attemptId, ...errorFields(err) });
        setDraftState('failed');
      }
    })();
  }, [debouncedAnswers, attempt]);

  const setAnswer = (questionId: string, value: AnswerState[string]) =>
    setAnswers((prev) => ({ ...prev, [questionId]: value }));

  const submit = async () => {
    if (!quiz || !attempt) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload = toPayload(answers);
      if (payload.length) await saveQuizAnswers(attempt.id, payload);
      const result = await submitQuizAttempt(attempt.id);
      setAttempt(result);
    } catch {
      setError(t('learning.quizSubmitFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-muted-foreground text-sm">{t('learning.loadingQuiz')}</p>;
  if (error && !quiz) return <p className="text-destructive text-sm">{error}</p>;
  if (!quiz || !attempt) return null;

  const submitted = attempt.status !== 'IN_PROGRESS';

  if (submitted) {
    const pending = attempt.status === 'PENDING_REVIEW';
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{quiz.title}</h3>
            <Badge variant={attempt.passed ? 'success' : pending ? 'warning' : 'outline'}>
              {pending ? (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {t('learning.awaitingReview')}
                </span>
              ) : attempt.passed ? (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> {t('learning.passed')}
                </span>
              ) : (
                t('learning.notPassed')
              )}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-2 text-sm">
            {t('learning.score')}:{' '}
            <span className="text-foreground font-medium">{attempt.score}</span> /{' '}
            {attempt.max_score}
            {pending && ` (${t('learning.shortAnswersPending')})`}
          </p>
          {attempt.feedback && (
            <p className="bg-muted mt-3 rounded-md p-3 text-sm">{attempt.feedback}</p>
          )}
        </Card>

        <Card className="p-6">
          <DiscussionThread attemptId={attempt.id} currentProfileId={currentProfileId} />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">{quiz.title}</h3>
      {quiz.description && <p className="text-muted-foreground text-sm">{quiz.description}</p>}

      {quiz.Question.map((q, i) => (
        <Card key={q.id} className="space-y-3 p-5">
          <p className="font-medium">
            {i + 1}. {q.prompt}{' '}
            <span className="text-muted-foreground text-xs">({q.points} pts)</span>
          </p>

          {q.type === 'MULTIPLE_CHOICE' && (
            <div className="space-y-2">
              {q.Option.map((o) => (
                <label key={o.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name={q.id}
                    checked={answers[q.id]?.selected_option_id === o.id}
                    onChange={() => setAnswer(q.id, { selected_option_id: o.id })}
                  />
                  {o.text}
                </label>
              ))}
            </div>
          )}

          {q.type === 'TRUE_FALSE' && (
            <div className="flex gap-4">
              {[true, false].map((val) => (
                <label key={String(val)} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name={q.id}
                    checked={answers[q.id]?.answer_boolean === val}
                    onChange={() => setAnswer(q.id, { answer_boolean: val })}
                  />
                  {val ? t('learning.true') : t('learning.false')}
                </label>
              ))}
            </div>
          )}

          {q.type === 'SHORT_TEXT' && (
            <Textarea
              rows={3}
              maxLength={5000}
              value={answers[q.id]?.answer_text ?? ''}
              onChange={(e) => setAnswer(q.id, { answer_text: e.target.value })}
              placeholder={t('learning.yourAnswer')}
              aria-label={t('learning.yourAnswer')}
            />
          )}
        </Card>
      ))}

      {error && <p className="text-destructive text-sm">{error}</p>}
      <div className="flex items-center gap-3">
        <Button onClick={submit} disabled={submitting}>
          {submitting ? t('learning.submittingQuiz') : t('learning.submitQuiz')}
        </Button>
        {draftState === 'saved' && (
          <span className="text-muted-foreground text-xs">{t('learning.quizDraftSaved')}</span>
        )}
        {draftState === 'failed' && (
          <span className="text-destructive text-xs">{t('learning.quizDraftSaveFailed')}</span>
        )}
      </div>
    </div>
  );
}
