'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getCourseQuiz,
  getLessonQuiz,
  getSeasonQuiz,
  getSessionQuiz,
  saveQuizAnswers,
  startQuizAttempt,
  submitQuizAttempt,
  type AnswerInput,
  type QuizAnswer,
  type QuizAttempt,
  type StudentQuiz,
} from '@/lib/api/client';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { logger } from '@/lib/logging/app-logger';
import { errorFields } from '@/lib/logging/error-fields';

/** A quiz belongs to a lesson, a season or the course itself, or to one live class meeting. */
export interface QuizParent {
  kind: 'lesson' | 'season' | 'course' | 'session';
  id: string;
}

const LOAD_QUIZ = {
  lesson: getLessonQuiz,
  season: getSeasonQuiz,
  course: getCourseQuiz,
  session: getSessionQuiz,
};

export type AnswerValue = {
  selected_option_id?: string;
  answer_boolean?: boolean;
  answer_text?: string;
};
type AnswerState = Record<string, AnswerValue>;

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

const toPayload = (answers: AnswerState): AnswerInput[] =>
  Object.entries(answers).map(([question_id, value]) => ({ question_id, ...value }));

/**
 * The whole student quiz flow: rules → start (a fresh random draw) → answers
 * autosaved → submit → result → try again while attempts remain. Keyed on the
 * parent's parts so an inline `parent` object never reloads every render.
 */
export function useQuizFlow(parent: QuizParent, onPassed?: () => void) {
  const { kind, id } = parent;
  const [quiz, setQuiz] = useState<StudentQuiz | null>(null);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<'load' | 'staff' | 'start' | 'submit' | null>(null);
  const [draftState, setDraftState] = useState<'idle' | 'saved' | 'failed'>('idle');
  const lastSaved = useRef('');
  const debouncedAnswers = useDebounce(answers, DRAFT_SAVE_DELAY_MS);

  const loadQuiz = useCallback(async () => {
    try {
      const loaded = await LOAD_QUIZ[kind](id);
      // Staff get the full question bank instead of a student's rules and history.
      if (Array.isArray(loaded.attempts)) setQuiz(loaded);
      else setFailure('staff');
    } catch {
      setFailure('load');
    } finally {
      setLoading(false);
    }
  }, [kind, id]);

  useEffect(() => {
    void loadQuiz();
  }, [loadQuiz]);

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

  const start = async () => {
    if (!quiz) return;
    setBusy(true);
    setFailure(null);
    try {
      const started = await startQuizAttempt(quiz.id);
      const drafts = restoreDrafts(started.Answer);
      lastSaved.current = JSON.stringify(drafts);
      setAnswers(drafts);
      setDraftState('idle');
      setAttempt(started);
    } catch {
      setFailure('start');
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    if (!attempt) return;
    setBusy(true);
    setFailure(null);
    try {
      const payload = toPayload(answers);
      if (payload.length) await saveQuizAnswers(attempt.id, payload);
      const result = await submitQuizAttempt(attempt.id);
      setAttempt(result);
      if (result.passed) onPassed?.();
      await loadQuiz();
    } catch {
      setFailure('submit');
    } finally {
      setBusy(false);
    }
  };

  const setAnswer = (questionId: string, value: AnswerValue) =>
    setAnswers((prev) => ({ ...prev, [questionId]: value }));

  return {
    quiz,
    attempt,
    answers,
    setAnswer,
    loading,
    busy,
    failure,
    draftState,
    start,
    submit,
    /** Back to the rules card, where "try again" starts a new draw. */
    backToIntro: () => setAttempt(null),
  };
}
