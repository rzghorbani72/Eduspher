"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/lib/i18n/hooks";
import { cn, toPersianDigits } from "@/lib/utils";
import { createCourseQnA } from "@/lib/api/client";

type CourseQnAFormProps = {
  courseId: string;
  onSubmitted: () => void | Promise<void>;
};

export function CourseQnAForm({ courseId, onSubmitted }: CourseQnAFormProps) {
  const { t, language } = useTranslation();
  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim().length < 10) {
      setMessage({ type: "error", text: t("courseQnA.questionTooShort") });
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage(null);
      await createCourseQnA(courseId, question.trim());
      setQuestion("");
      await onSubmitted();
      setMessage({ type: "success", text: t("courseQnA.submittedPending") });
    } catch {
      setMessage({ type: "error", text: t("courseQnA.submitFailed") });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="cd-review-card space-y-4 rounded-2xl border p-5">
      <div>
        <label
          htmlFor="course-qna-question"
          className="text-sm font-black text-(--theme-foreground)"
        >
          {t("courseQnA.askQuestion")}
        </label>
        <p className="mt-1 text-xs text-(--theme-muted)">
          {t("courseQnA.reviewHint")}
        </p>
      </div>
      <Textarea
        id="course-qna-question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder={t("courseQnA.questionPlaceholder")}
        rows={4}
        minLength={10}
        maxLength={2000}
        className="cd-review-field min-h-[7.5rem] rounded-xl border px-4 py-3 text-base shadow-sm placeholder:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--theme-primary)"
      />
      <p className="cd-price text-end text-xs text-(--theme-muted)">
        {t("courseQnA.charactersCount").replace(
          "{count}",
          toPersianDigits(question.length, language),
        )}
      </p>
      {message && (
        <p
          className={cn(
            "text-sm font-semibold",
            message.type === "success" ? "text-green-700" : "text-red-600",
          )}
        >
          {message.text}
        </p>
      )}
      <Button
        type="submit"
        disabled={isSubmitting || question.trim().length < 10}
        className="cd-cta-btn h-11 px-6 text-sm font-extrabold text-white hover:scale-100"
      >
        {isSubmitting ? t("courseQnA.submitting") : t("courseQnA.submitQuestion")}
      </Button>
    </form>
  );
}
