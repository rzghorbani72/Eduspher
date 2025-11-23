'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getCourseQnAs, createCourseQnA, type CourseQnA } from '@/lib/api/client';

interface CourseQnAProps {
  courseId: number;
  isLoggedIn: boolean;
}

export function CourseQnA({ courseId, isLoggedIn }: CourseQnAProps) {
  const [qnas, setQnas] = useState<CourseQnA[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  if (!isLoggedIn) {
    return null;
  }

  const approvedQnas = qnas.filter((qna) => qna.is_approved);

  return (
    <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
          Questions & Answers
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
              Ask a question about this course
            </label>
            <Textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type your question here..."
              rows={4}
              className="w-full"
              minLength={10}
              maxLength={2000}
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {question.length}/2000 characters
            </p>
          </div>
          <Button
            type="submit"
            disabled={isSubmitting || question.trim().length < 10}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Question'}
          </Button>
        </form>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-slate-900 dark:border-slate-100"></div>
          </div>
        ) : approvedQnas.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <p>No questions yet. Be the first to ask!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {approvedQnas.map((qna) => (
              <div
                key={qna.id}
                className="border-b border-slate-200 pb-6 last:border-0 dark:border-slate-800"
              >
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {qna.profile?.display_name || qna.user?.name || 'Anonymous'}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(qna.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">{qna.question}</p>
                  </div>
                  {qna.answer && (
                    <div className="ml-4 pl-4 border-l-2 border-[var(--theme-primary)]">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-[var(--theme-primary)]">
                          {qna.answerer?.display_name || 'Instructor'}
                        </span>
                        {qna.answered_at && (
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {new Date(qna.answered_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 dark:text-slate-400">{qna.answer}</p>
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

