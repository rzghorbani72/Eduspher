'use client';

import { BadgeCheck } from 'lucide-react';

import { AppImage } from '@/components/ui/app-image';
import { ReviewStars } from '@/components/courses/review-stars';
import type { CourseReview } from '@/lib/api/client';

type CourseReviewCardProps = {
  review: CourseReview;
  dateLabel: string;
  verifiedLabel: string;
};

export function CourseReviewCard({ review, dateLabel, verifiedLabel }: CourseReviewCardProps) {
  const name = review.Profile?.display_name ?? '';
  const avatar = review.Profile?.Image_Profile_avatar_idToImage?.publicUrl;

  return (
    <article className="cd-review-card rounded-2xl border p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {avatar ? (
            <AppImage
              src={avatar}
              alt={name}
              preset="thumb"
              width={40}
              height={40}
              sizes="40px"
              className="h-10 w-10 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="cd-teacher-avatar grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-extrabold text-white">
              {name.charAt(0)}
            </span>
          )}
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-extrabold text-(--theme-foreground)">{name}</p>
            <p className="mt-0.5 text-xs text-(--theme-muted)">{dateLabel}</p>
          </div>
        </div>
        <ReviewStars rating={review.rating} />
      </div>
      {review.is_verified && (
        <p className="mt-3 flex items-center gap-1 text-xs font-bold text-(--theme-primary)">
          <BadgeCheck className="h-3.5 w-3.5" />
          {verifiedLabel}
        </p>
      )}
      {review.title && (
        <p className="mt-3 text-sm font-bold text-(--theme-foreground)">{review.title}</p>
      )}
      {review.content && (
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-(--theme-muted)">
          {review.content}
        </p>
      )}
    </article>
  );
}
