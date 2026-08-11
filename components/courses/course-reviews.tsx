"use client";

import { useCallback, useEffect, useState } from "react";
import { Star } from "lucide-react";

import { useTranslation } from "@/lib/i18n/hooks";
import { toPersianDigits, cn } from "@/lib/utils";
import { CourseQnA } from "@/components/courses/course-qna";
import { CourseReviewForm } from "@/components/courses/course-review-form";
import {
  getCourseReviews,
  type CourseReview,
  type CourseReviewsResponse,
} from "@/lib/api/client";

interface CourseReviewsProps {
  courseId: string;
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

const formatRelativeDate = (iso: string, language: string) =>
  new Date(iso).toLocaleDateString(language === "fa" ? "fa-IR" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export function CourseReviews({ courseId, isLoggedIn }: CourseReviewsProps) {
  const { t, language } = useTranslation();
  const [data, setData] = useState<CourseReviewsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadReviews = useCallback(async () => {
    try {
      setIsLoading(true);
      setData(await getCourseReviews(courseId));
    } catch (error) {
      console.error("Failed to load reviews:", error);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const reviews: CourseReview[] = data?.reviews ?? [];
  const avgRating = data?.summary.avg_rating ?? 0;
  const totalReviews = data?.summary.total_reviews ?? 0;

  return (
    <section className="animate-in fade-in slide-in-from-bottom-3 space-y-6 duration-300">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black text-(--theme-foreground)">
          {t("courses.studentReviewsTitle")}
        </h2>
        {totalReviews > 0 && (
          <span className="cd-rating-pill flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold">
            <Star className="h-4 w-4 fill-[#f5a623] text-[#f5a623]" />
            <span className="cd-price">
              {toPersianDigits(avgRating.toFixed(1), language)} {t("courses.reviewsOutOf")}{" "}
              {toPersianDigits(totalReviews, language)} {t("courses.reviewsWord")}
            </span>
          </span>
        )}
      </div>

      {data?.summary.can_review && (
        <CourseReviewForm courseId={courseId} onSubmitted={loadReviews} />
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-(--theme-primary)" />
        </div>
      ) : reviews.length === 0 ? (
        <p className="py-8 text-center text-sm text-(--theme-muted)">
          {t("courses.noReviewsYet")}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {reviews.map((review) => {
            const name = review.Profile?.display_name ?? "";
            return (
              <div key={review.id} className="cd-review-card rounded-2xl border p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="cd-teacher-avatar grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-extrabold text-white">
                      {name.charAt(0)}
                    </span>
                    <div className="leading-tight">
                      <div className="text-sm font-extrabold text-(--theme-foreground)">{name}</div>
                      <div className="text-xs text-(--theme-muted)">
                        {formatRelativeDate(review.created_at, language)}
                      </div>
                    </div>
                  </div>
                  <Stars rating={review.rating} />
                </div>
                {review.title && (
                  <p className="mt-3 text-sm font-bold text-(--theme-foreground)">{review.title}</p>
                )}
                {review.content && (
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-(--theme-muted)">
                    {review.content}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {isLoggedIn && (
        <div className="pt-2">
          <CourseQnA courseId={courseId} isLoggedIn={isLoggedIn} userRole={undefined} />
        </div>
      )}
    </section>
  );
}
