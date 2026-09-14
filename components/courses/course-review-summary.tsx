'use client';

import { useTranslation } from '@/lib/i18n/hooks';
import { toPersianDigits } from '@/lib/utils';
import type { RatingCounts } from '@/lib/api/client';
import { ReviewStars } from '@/components/courses/review-stars';

type CourseReviewSummaryProps = {
  avgRating: number;
  totalReviews: number;
  counts: RatingCounts;
};

export function CourseReviewSummary({ avgRating, totalReviews, counts }: CourseReviewSummaryProps) {
  const { t, language } = useTranslation();
  return (
    <div className="cd-review-card grid gap-6 rounded-2xl border p-5 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-8">
      <div className="flex flex-col items-center text-center">
        <p className="cd-price text-5xl leading-none font-black text-(--theme-foreground)">
          {toPersianDigits(avgRating.toFixed(1), language)}
        </p>
        <ReviewStars rating={Math.round(avgRating)} size="md" className="mt-2 justify-center" />
        <p className="mt-2 text-sm font-semibold text-(--theme-muted)">
          {t('courses.reviewsCountLabel').replace(
            '{count}',
            toPersianDigits(totalReviews, language),
          )}
        </p>
      </div>

      <ol className="flex w-full flex-col gap-1.5">
        {([5, 4, 3, 2, 1] as const).map((star) => {
          const count = counts[star - 1] ?? 0;
          const width = totalReviews === 0 ? 0 : Math.round((count / totalReviews) * 100);
          return (
            <li key={star} className="flex items-center gap-2.5">
              <span className="cd-price w-4 shrink-0 text-xs font-bold text-(--theme-muted)">
                {toPersianDigits(star, language)}
              </span>
              <div className="cd-rating-bar-track h-2 min-w-0 flex-1 overflow-hidden rounded-full">
                <div
                  className="cd-rating-bar h-full rounded-full transition-[width] duration-300"
                  style={{ width: `${width}%` }}
                />
              </div>
              <span className="cd-price w-6 shrink-0 text-end text-xs font-bold text-(--theme-muted)">
                {toPersianDigits(count, language)}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
