'use client';

import { useState } from 'react';
import { BadgeCheck, Clock3 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';
import { answerCourseQnA, approveCourseQnA, type CourseQnA } from '@/lib/api/client';

type CourseQnAItemProps = {
  item: CourseQnA;
  canModerate: boolean;
  dateLabel: string;
  onChanged: () => void | Promise<void>;
};

export function CourseQnAItem({ item, canModerate, dateLabel, onChanged }: CourseQnAItemProps) {
  const { t } = useTranslation();
  const [answer, setAnswer] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const name = item.profile?.display_name ?? t('courseQnA.student');

  const run = async (work: () => Promise<void>) => {
    try {
      setBusy(true);
      setError(null);
      await work();
      await onChanged();
    } catch {
      setError(t('courseQnA.submitFailed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <article
      className={cn('cd-review-card rounded-2xl border p-5', !item.is_approved && 'border-dashed')}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-extrabold text-(--theme-foreground)">{name}</p>
          <p className="mt-0.5 text-xs text-(--theme-muted)">{dateLabel}</p>
        </div>
        {item.is_approved ? (
          <span className="cd-rating-pill inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold">
            <BadgeCheck className="h-3.5 w-3.5" />
            {t('courseQnA.published')}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-[color-mix(in_srgb,var(--theme-primary)_12%,transparent)] px-2.5 py-1 text-xs font-bold text-(--theme-primary)">
            <Clock3 className="h-3.5 w-3.5" />
            {item.mine ? t('courseQnA.pendingYours') : t('courseQnA.pending')}
          </span>
        )}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-(--theme-foreground)">{item.question}</p>

      {item.answer && (
        <div className="mt-4 border-s-2 border-(--theme-primary) ps-4">
          <p className="text-xs font-bold text-(--theme-primary)">
            {item.answerer?.display_name ?? t('courseQnA.instructor')}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-(--theme-muted)">{item.answer}</p>
        </div>
      )}

      {canModerate && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {!item.is_approved && (
            <Button
              type="button"
              size="sm"
              disabled={busy}
              onClick={() =>
                run(async () => {
                  await approveCourseQnA(item.course_id, item.id, true);
                })
              }
              className="cd-cta-btn h-9 px-4 text-xs font-extrabold text-white hover:scale-100"
            >
              {t('courseQnA.publish')}
            </Button>
          )}
          {item.is_approved && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() =>
                run(async () => {
                  await approveCourseQnA(item.course_id, item.id, false);
                })
              }
              className="h-9 px-4 text-xs hover:scale-100"
            >
              {t('courseQnA.unpublish')}
            </Button>
          )}
          {!item.answer && !isAnswering && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => setIsAnswering(true)}
              className="h-9 px-4 text-xs hover:scale-100"
            >
              {t('courseQnA.answer')}
            </Button>
          )}
        </div>
      )}

      {canModerate && isAnswering && (
        <div className="mt-3 space-y-3">
          <Textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={t('courseQnA.answerPlaceholder')}
            rows={3}
            maxLength={2000}
            className="cd-review-field min-h-[5.5rem] rounded-xl border px-4 py-3 text-sm shadow-sm placeholder:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--theme-primary)"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              disabled={busy || answer.trim().length < 10}
              onClick={() =>
                run(async () => {
                  await answerCourseQnA(item.course_id, item.id, answer.trim());
                  setIsAnswering(false);
                  setAnswer('');
                })
              }
              className="cd-cta-btn h-9 px-4 text-xs font-extrabold text-white hover:scale-100"
            >
              {t('courseQnA.submitAnswer')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={busy}
              onClick={() => {
                setIsAnswering(false);
                setAnswer('');
              }}
              className="h-9 px-4 text-xs hover:scale-100"
            >
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      )}

      {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
    </article>
  );
}
