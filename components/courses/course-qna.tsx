'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, XCircle, MessageSquare } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { 
  getCourseQnAs, 
  createCourseQnA, 
  approveCourseQnA,
  answerCourseQnA,
  type CourseQnA 
} from '@/lib/api/client';

interface CourseQnAProps {
  courseId: number;
  isLoggedIn: boolean;
  userRole?: string;
}

export function CourseQnA({ courseId, isLoggedIn, userRole }: CourseQnAProps) {
  const { t } = useTranslation();
  const [qnas, setQnas] = useState<CourseQnA[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [answeringQnaId, setAnsweringQnaId] = useState<number | null>(null);
  const [answerText, setAnswerText] = useState<Record<number, string>>({});
  const [processingQnaId, setProcessingQnaId] = useState<number | null>(null);

  const isModerator = userRole === 'ADMIN' || userRole === 'TEACHER' || userRole === 'MANAGER';

  useEffect(() => {
    if (isLoggedIn) {
      loadQnAs();
    }
  }, [courseId, isLoggedIn]);

  const loadQnAs = async () => {
    try {
      setIsLoading(true);
      const data = await getCourseQnAs(courseId);
      setQnas(data);
    } catch (error) {
      console.error('Failed to load Q&As:', error);
      setMessage({ type: 'error', text: 'Failed to load questions and answers' });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || question.length < 10) {
      setMessage({ type: 'error', text: 'Question must be at least 10 characters long' });
      setTimeout(() => setMessage(null), 5000);
      return;
    }

    try {
      setIsSubmitting(true);
      const newQnA = await createCourseQnA(courseId, question);
      setQnas([newQnA, ...qnas]);
      setQuestion('');
      setMessage({ type: 'success', text: 'Question submitted successfully! It will be visible after approval.' });
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error('Failed to submit question:', error);
      setMessage({ type: 'error', text: 'Failed to submit question. Please try again.' });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (qnaId: number, isApproved: boolean) => {
    try {
      setProcessingQnaId(qnaId);
      const updatedQnA = await approveCourseQnA(courseId, qnaId, isApproved);
      setQnas(qnas.map(qna => qna.id === qnaId ? updatedQnA : qna));
      setMessage({ 
        type: 'success', 
        text: isApproved ? 'Question approved successfully' : 'Question denied successfully' 
      });
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error('Failed to update Q&A:', error);
      setMessage({ type: 'error', text: 'Failed to update question. Please try again.' });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setProcessingQnaId(null);
    }
  };

  const handleAnswer = async (qnaId: number) => {
    const answer = answerText[qnaId]?.trim();
    if (!answer || answer.length < 10) {
      setMessage({ type: 'error', text: 'Answer must be at least 10 characters long' });
      setTimeout(() => setMessage(null), 5000);
      return;
    }

    try {
      setProcessingQnaId(qnaId);
      const updatedQnA = await answerCourseQnA(courseId, qnaId, answer);
      setQnas(qnas.map(qna => qna.id === qnaId ? updatedQnA : qna));
      setAnswerText({ ...answerText, [qnaId]: '' });
      setAnsweringQnaId(null);
      setMessage({ type: 'success', text: 'Answer submitted successfully' });
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error('Failed to submit answer:', error);
      setMessage({ type: 'error', text: 'Failed to submit answer. Please try again.' });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setProcessingQnaId(null);
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  const displayQnas = isModerator ? qnas : qnas.filter((qna) => qna.is_approved);

  return (
    <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
          {t("courseQnA.title")}
        </h2>

        {message && (
          <div
            className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${
              message.type === 'success'
                ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/70 dark:text-green-300'
                : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/70 dark:text-amber-300'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmitQuestion} className="mb-8 space-y-4">
          <div>
            <label
              htmlFor="question"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
            >
              {t("courseQnA.askQuestion")}
            </label>
            <Textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={t("courseQnA.questionPlaceholder")}
              rows={4}
              className="w-full"
              minLength={10}
              maxLength={2000}
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {t("courseQnA.charactersCount").replace("{count}", question.length.toString())}
            </p>
          </div>
          <Button
            type="submit"
            disabled={isSubmitting || question.trim().length < 10}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? t("courseQnA.submitting") : t("courseQnA.submitQuestion")}
          </Button>
        </form>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-slate-900 dark:border-slate-100"></div>
          </div>
        ) : displayQnas.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <p>{t("courseQnA.noQuestionsYet")}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {displayQnas.map((qna) => (
              <div
                key={qna.id}
                className={`border-b border-slate-200 pb-6 last:border-0 dark:border-slate-800 ${
                  !qna.is_approved && isModerator ? 'bg-amber-50/50 dark:bg-amber-950/20 rounded-lg p-4 border-amber-200 dark:border-amber-900' : ''
                }`}
              >
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          {qna.profile?.display_name || 'Anonymous'}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(qna.created_at).toLocaleDateString()}
                        </span>
                        {isModerator && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            qna.is_approved 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                          }`}>
                            {qna.is_approved ? t("courseQnA.approved") : t("courseQnA.pending")}
                          </span>
                        )}
                      </div>
                      {isModerator && (
                        <div className="flex items-center gap-2">
                          {!qna.is_approved ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApprove(qna.id, true)}
                              disabled={processingQnaId === qna.id}
                              className="h-8 text-green-700 border-green-200 hover:bg-green-50 dark:text-green-300 dark:border-green-800 dark:hover:bg-green-950/30"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              {t("courseQnA.approve")}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApprove(qna.id, false)}
                              disabled={processingQnaId === qna.id}
                              className="h-8 text-amber-700 border-amber-200 hover:bg-amber-50 dark:text-amber-300 dark:border-amber-800 dark:hover:bg-amber-950/30"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              {t("courseQnA.deny")}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">{qna.question}</p>
                  </div>
                  {qna.answer ? (
                    <div className="ml-4 pl-4 border-l-2 border-[var(--theme-primary)]">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-[var(--theme-primary)]">
                          {qna.answerer?.display_name || t("courseQnA.instructor")}
                        </span>
                        {qna.answered_at && (
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {new Date(qna.answered_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 dark:text-slate-400">{qna.answer}</p>
                    </div>
                  ) : isModerator && (
                    <div className="ml-4 pl-4 border-l-2 border-slate-300 dark:border-slate-700">
                      {answeringQnaId === qna.id ? (
                        <div className="space-y-3">
                          <Textarea
                            value={answerText[qna.id] || ''}
                            onChange={(e) => setAnswerText({ ...answerText, [qna.id]: e.target.value })}
                            placeholder={t("courseQnA.answerPlaceholder")}
                            rows={3}
                            className="w-full"
                            minLength={10}
                            maxLength={2000}
                          />
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleAnswer(qna.id)}
                              disabled={processingQnaId === qna.id || !answerText[qna.id]?.trim() || answerText[qna.id]?.trim().length < 10}
                              className="h-8"
                            >
                              {processingQnaId === qna.id ? t("courseQnA.submitting") : t("courseQnA.submitAnswer")}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setAnsweringQnaId(null);
                                setAnswerText({ ...answerText, [qna.id]: '' });
                              }}
                              disabled={processingQnaId === qna.id}
                              className="h-8"
                            >
                              {t("common.cancel")}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setAnsweringQnaId(qna.id)}
                          className="h-8"
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          {t("courseQnA.answer")}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

