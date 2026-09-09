"use client";

import { useState } from "react";
import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/lib/i18n/hooks";
import { cn } from "@/lib/utils";
import { createCourseReview, type CourseReview } from "@/lib/api/client";

interface CourseReviewFormProps {
  courseId: string;
  onSubmitted: (review: CourseReview) => void;
}

export function CourseReviewForm({ courseId, onSubmitted }: CourseReviewFormProps) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) return;

    try {
      setIsSubmitting(true);
      setMessage(null);
      const review = await createCourseReview(courseId, {
        rating,
        title: title.trim() || undefined,
        content: content.trim() || undefined,
      });
      onSubmitted(review);
      setRating(0);
      setTitle("");
      setContent("");
      setMessage({ type: "success", text: t("courses.reviewSubmitted") });
    } catch (error) {
      const blocked =
        error instanceof Error &&
        (/enroll/i.test(error.message) || /half/i.test(error.message));
      setMessage({
        type: "error",
        text: blocked ? t("courses.reviewWatchHalf") : t("courses.reviewError"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="cd-review-card space-y-4 rounded-2xl border p-5">
      <div>
        <p className="mb-2 text-sm font-bold text-(--theme-foreground)">{t("courses.yourRating")}</p>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, index) => {
            const value = index + 1;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                onMouseEnter={() => setHover(value)}
                onMouseLeave={() => setHover(0)}
                aria-label={`${value}`}
                className="p-0.5"
              >
                <Star
                  className={cn(
                    "h-6 w-6 transition-colors",
                    value <= (hover || rating)
                      ? "fill-[#f5a623] text-[#f5a623]"
                      : "text-(--theme-border-strong)",
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>

      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t("courses.reviewTitlePlaceholder")}
        maxLength={255}
      />
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t("courses.reviewContentPlaceholder")}
        rows={3}
        maxLength={2000}
      />

      {message && (
        <p
          className={cn(
            "text-sm",
            message.type === "success" ? "text-green-600" : "text-red-600",
          )}
        >
          {message.text}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting || rating < 1}>
        {isSubmitting ? t("courses.submittingReview") : t("courses.submitReview")}
      </Button>
    </form>
  );
}
