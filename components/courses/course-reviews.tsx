"use client";

import { useCallback, useEffect, useState } from "react";
import { Clock3, Star } from "lucide-react";

import { useTranslation } from "@/lib/i18n/hooks";
import { cn } from "@/lib/utils";
import { CourseQnA } from "@/components/courses/course-qna";
import { CourseReviewCard } from "@/components/courses/course-review-card";
import { CourseReviewForm } from "@/components/courses/course-review-form";
import { CourseReviewSummary } from "@/components/courses/course-review-summary";
import { EmptyState } from "@/components/ui/empty-state";
import {
  getCourseReviews,
  type CourseReviewsResponse,
  type RatingCounts,
} from "@/lib/api/client";

interface CourseReviewsProps {
  courseId: string;
  isLoggedIn: boolean;
}

const formatReviewDate = (iso: string, language: string) =>
  new Date(iso).toLocaleDateString(language === "fa" ? "fa-IR" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

function countsOf(data: CourseReviewsResponse | null): RatingCounts {
  const fromApi = data?.summary.counts;
  if (fromApi?.length === 5) {
    return [
      fromApi[0] ?? 0,
      fromApi[1] ?? 0,
      fromApi[2] ?? 0,
      fromApi[3] ?? 0,
      fromApi[4] ?? 0,
    ];
  }
  const counts = [0, 0, 0, 0, 0];
  for (const review of data?.reviews ?? []) {
    if (review.rating >= 1 && review.rating <= 5) {
      counts[review.rating - 1] += 1;
    }
  }
  return [counts[0] ?? 0, counts[1] ?? 0, counts[2] ?? 0, counts[3] ?? 0, counts[4] ?? 0];
}

export function CourseReviews({ courseId, isLoggedIn }: CourseReviewsProps) {
  const { t, language } = useTranslation();
  const [data, setData] = useState<CourseReviewsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  const loadReviews = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadFailed(false);
      setData(await getCourseReviews(courseId));
    } catch {
      setLoadFailed(true);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const reviews = data?.reviews ?? [];
  const avgRating = data?.summary.avg_rating ?? 0;
  const totalReviews = data?.summary.total_reviews ?? reviews.length;
  const counts = countsOf(data);
  const showSummary = totalReviews > 0;

  return (
    <section className="animate-in fade-in slide-in-from-bottom-3 space-y-6 duration-300">
      <h2 className="text-xl font-black text-(--theme-foreground)">
        {t("courses.studentReviewsTitle")}
      </h2>

      {showSummary && (
        <CourseReviewSummary
          avgRating={avgRating}
          totalReviews={totalReviews}
          counts={counts}
        />
      )}

      {data?.summary.can_review && (
        <CourseReviewForm courseId={courseId} onSubmitted={loadReviews} />
      )}

      {isLoggedIn && data?.summary.is_enrolled && !data.summary.can_review && (
        <p className="cd-review-card flex items-start gap-3 rounded-2xl border p-5 text-sm leading-relaxed text-(--theme-muted)">
          <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-(--theme-primary)" />
          {t("courses.reviewWatchHalf")}
        </p>
      )}

      {isLoading ? (
        <div className="cd-review-card h-36 animate-pulse rounded-2xl border" />
      ) : loadFailed ? (
        <p className="cd-review-card rounded-2xl border p-5 text-sm text-red-600">
          {t("courses.reviewError")}
        </p>
      ) : reviews.length === 0 ? (
        <EmptyState
          compact
          icon={<Star className={cn("h-6 w-6", showSummary ? "" : "cd-star-fill")} />}
          title={t("courses.noReviewsYet")}
          description={t("courses.noReviewsDescription")}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {reviews.map((review) => (
            <CourseReviewCard
              key={review.id}
              review={review}
              dateLabel={formatReviewDate(review.created_at, language)}
              verifiedLabel={t("courses.verifiedPurchase")}
            />
          ))}
        </div>
      )}

      <div className="border-theme border-t pt-6">
        <CourseQnA courseId={courseId} isLoggedIn={isLoggedIn} />
      </div>
    </section>
  );
}
