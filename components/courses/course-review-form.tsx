'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ReviewStarPicker } from '@/components/courses/review-stars';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';
import { createCourseReview } from '@/lib/api/client';

interface CourseReviewFormProps {
  courseId: string;
  onSubmitted: () => void | Promise<void>;
}

export function CourseReviewForm({ courseId, onSubmitted }: CourseReviewFormProps) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const shown = hover || rating;
  const ratingLabel = shown > 0 ? t(`courses.ratingLabel${shown}`) : t('courses.selectARating');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) return;

    try {
      setIsSubmitting(true);
      setMessage(null);
      await createCourseReview(courseId, {
        rating,
        title: title.trim() || undefined,
        content: content.trim() || undefined,
      });
      await onSubmitted();
      setRating(0);
      setTitle('');
      setContent('');
      setMessage({ type: 'success', text: t('courses.reviewSubmitted') });
    } catch (error) {
      const blocked =
        error instanceof Error && (/enroll/i.test(error.message) || /half/i.test(error.message));
      setMessage({
        type: 'error',
        text: blocked ? t('courses.reviewWatchHalf') : t('courses.reviewError'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="cd-review-card space-y-4 rounded-2xl border p-5">
      <div>
        <p className="text-sm font-black text-(--theme-foreground)">
          {t('courses.writeReviewHeading')}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <ReviewStarPicker
            rating={rating}
            hover={hover}
            onChange={setRating}
            onHover={setHover}
            labelFor={(value) => t(`courses.ratingLabel${value}`)}
          />
          <span className="text-sm font-semibold text-(--theme-muted)">{ratingLabel}</span>
        </div>
      </div>

      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t('courses.reviewTitlePlaceholder')}
        maxLength={255}
        className="cd-review-field h-11 rounded-xl"
      />
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t('courses.reviewContentPlaceholder')}
        rows={4}
        maxLength={2000}
        className="cd-review-field min-h-[7.5rem] rounded-xl border px-4 py-3 text-base shadow-sm placeholder:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--theme-primary)"
      />

      {message && (
        <p
          className={cn(
            'text-sm font-semibold',
            message.type === 'success' ? 'text-green-600' : 'text-red-600',
          )}
        >
          {message.text}
        </p>
      )}

      <Button
        type="submit"
        disabled={isSubmitting || rating < 1}
        className="cd-cta-btn h-11 px-6 text-sm font-extrabold text-white hover:scale-100"
      >
        {isSubmitting ? t('courses.submittingReview') : t('courses.submitReview')}
      </Button>
    </form>
  );
}
