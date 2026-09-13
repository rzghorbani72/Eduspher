"use client";

import { CalendarClock } from "lucide-react";

import { ClassRequestForm } from "@/components/courses/class-request-form";
import { useTranslation } from "@/lib/i18n/hooks";

interface LiveCoursePanelProps {
  courseId: string;
  hasOpenClasses: boolean;
  isLoggedIn: boolean;
  loginHref: string;
}

/**
 * The buy box of a live course. Seats are bought per class (listed on the
 * page), so this side card only explains that and takes a time request.
 */
export function LiveCoursePanel({
  courseId,
  hasOpenClasses,
  isLoggedIn,
  loginHref,
}: LiveCoursePanelProps) {
  const { t } = useTranslation();

  return (
    <div className="cd-side-card overflow-hidden rounded-2xl border shadow-2xl">
      <div className="space-y-2 px-6 pt-6 pb-4">
        <h2 className="flex items-center gap-2 text-lg font-black text-(--theme-foreground)">
          <CalendarClock
            className="size-5 text-(--theme-primary)"
            aria-hidden="true"
          />
          {t("courses.liveCourse")}
        </h2>
        <p className="text-[13px] text-(--theme-muted)">
          {hasOpenClasses
            ? t("courses.liveSeatsSoldPerClass")
            : t("courses.liveNoClassesYet")}
        </p>
      </div>
      <div className="border-t border-theme px-6 py-5">
        <h3 className="text-sm font-black text-(--theme-foreground)">
          {t("courses.requestClassTitle")}
        </h3>
        <p className="mt-1 mb-4 text-xs text-(--theme-muted)">
          {t("courses.requestClassHint")}
        </p>
        <ClassRequestForm
          courseId={courseId}
          isLoggedIn={isLoggedIn}
          loginHref={loginHref}
        />
      </div>
    </div>
  );
}
