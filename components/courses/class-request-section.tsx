"use client";

import { CalendarPlus } from "lucide-react";

import { ClassRequestForm } from "@/components/courses/class-request-form";
import { CLASS_REQUEST_ANCHOR_ID } from "@/components/courses/live-course-panel";
import { useTranslation } from "@/lib/i18n/hooks";

interface ClassRequestSectionProps {
  courseId: string;
  hasOpenClasses: boolean;
  isLoggedIn: boolean;
  loginHref: string;
}

export function ClassRequestSection({
  courseId,
  hasOpenClasses,
  isLoggedIn,
  loginHref,
}: ClassRequestSectionProps) {
  const { t } = useTranslation();

  return (
    <section
      id={CLASS_REQUEST_ANCHOR_ID}
      aria-labelledby="request-class-title"
      className="scroll-mt-24 space-y-4"
    >
      <div className="space-y-1">
        <h2
          id="request-class-title"
          className="flex items-center gap-2 text-xl font-bold text-(--theme-foreground)"
        >
          <CalendarPlus
            className="size-5 text-(--theme-primary)"
            aria-hidden="true"
          />
          {t("courses.requestClassTitle")}
        </h2>
        <p className="text-sm text-muted">
          {hasOpenClasses
            ? t("courses.requestClassHintWithClasses")
            : t("courses.requestClassHint")}
        </p>
      </div>
      <div className="rounded-2xl border border-theme bg-card p-5 md:p-6">
        <div className="max-w-xl">
          <ClassRequestForm
            courseId={courseId}
            isLoggedIn={isLoggedIn}
            loginHref={loginHref}
          />
        </div>
      </div>
    </section>
  );
}
