"use client";

import { Star } from "lucide-react";

import { useTranslation } from "@/lib/i18n/hooks";
import { toPersianDigits, cn } from "@/lib/utils";
import { CourseQnA } from "@/components/courses/course-qna";
import {
  getDemoReviews,
  DEMO_RATING,
  DEMO_REVIEW_COUNT,
} from "@/components/courses/course-mock-data";

interface CourseReviewsProps {
  courseId: number;
  isLoggedIn: boolean;
}

const Stars = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={cn(
          "h-3.5 w-3.5",
          index < rating ? "fill-[#f5a623] text-[#f5a623]" : "text-(--theme-border-strong)",
        )}
      />
    ))}
  </div>
);

export function CourseReviews({ courseId, isLoggedIn }: CourseReviewsProps) {
  const { t, language } = useTranslation();
  const reviews = getDemoReviews(language);

  return (
    <section className="animate-in fade-in slide-in-from-bottom-3 space-y-6 duration-300">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black text-(--theme-foreground)">
          {t("courses.studentReviewsTitle")}
        </h2>
        <span className="cd-rating-pill flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold">
          <Star className="h-4 w-4 fill-[#f5a623] text-[#f5a623]" />
          <span className="cd-price">
            {toPersianDigits(DEMO_RATING.toFixed(1), language)} {t("courses.reviewsOutOf")}{" "}
            {toPersianDigits(DEMO_REVIEW_COUNT, language)} {t("courses.reviewsWord")}
          </span>
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {reviews.map((review) => (
          <div key={review.id} className="cd-review-card rounded-2xl border p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="cd-teacher-avatar grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-extrabold text-white">
                  {review.initial}
                </span>
                <div className="leading-tight">
                  <div className="text-sm font-extrabold text-(--theme-foreground)">
                    {review.name}
                  </div>
                  <div className="text-xs text-(--theme-muted)">{review.timeAgo}</div>
                </div>
              </div>
              <Stars rating={review.rating} />
            </div>
            <p className="mt-3 text-[13.5px] leading-relaxed text-(--theme-muted)">{review.text}</p>
          </div>
        ))}
      </div>

      {isLoggedIn && (
        <div className="pt-2">
          <CourseQnA courseId={courseId} isLoggedIn={isLoggedIn} userRole={undefined} />
        </div>
      )}
    </section>
  );
}
