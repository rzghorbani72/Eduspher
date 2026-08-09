"use client";

import { Check } from "lucide-react";

import { useTranslation } from "@/lib/i18n/hooks";
import { toPersianDigits } from "@/lib/utils";
import { renderMarkdown } from "@/lib/markdown";
import {
  getAboutDemo,
  getLearnPoints,
} from "@/components/courses/course-detail-demo";

interface CourseOverviewProps {
  description?: string | null;
  lessonCount: number;
  durationHours: number | null;
}

export function CourseOverview({
  description,
  lessonCount,
  durationHours,
}: CourseOverviewProps) {
  const { t, language } = useTranslation();
  const learnPoints = getLearnPoints(language);

  const stats = [
    {
      value: toPersianDigits(lessonCount, language),
      label: t("courses.lesson"),
    },
    {
      value: durationHours ? toPersianDigits(durationHours, language) : "—",
      label: t("courses.statHoursLabel"),
    },
    { value: t("courses.statLiveValue"), label: t("courses.statLiveLabel") },
    {
      value: t("courses.statAccessValue"),
      label: t("courses.statAccessLabel"),
    },
  ];

  return (
    <section className="animate-in fade-in slide-in-from-bottom-3 space-y-8 duration-300">
      <div>
        <h2 className="mb-3 text-xl font-black text-(--theme-foreground)">
          {t("courses.aboutCourse")}
        </h2>
        <div
          className="prose-description text-sm leading-loose text-(--theme-muted)"
          dangerouslySetInnerHTML={{
            __html: renderMarkdown(description || getAboutDemo(language)),
          }}
        />
      </div>

      <div>
        <h2 className="mb-4 text-xl font-black text-(--theme-foreground)">
          {t("courses.whatYouWillLearn")}
        </h2>
        <ul className="grid gap-x-8 gap-y-3 md:grid-cols-2">
          {learnPoints.map((point) => (
            <li
              key={point}
              className="flex items-center justify-end gap-2 text-sm text-(--theme-foreground)"
            >
              {point}
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,#22c55e_15%,transparent)]">
                <Check className="h-3 w-3 text-[#16a34a]" />
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="cd-review-card rounded-2xl border p-4 text-center"
          >
            <div className="cd-price text-2xl font-black text-(--theme-primary)">
              {stat.value}
            </div>
            <div className="mt-1 text-xs text-(--theme-muted)">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
