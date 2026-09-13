"use client";

import { useTranslation } from "@/lib/i18n/hooks";
import { toPersianDigits } from "@/lib/utils";
import type { CourseTopic } from "@/lib/api/account-types";

export function CourseTopicList({ topics }: { topics: CourseTopic[] }) {
  const { t, language } = useTranslation();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-(--theme-foreground)">
          {t("courses.syllabusTitle")}
        </h2>
        <p className="mt-1 text-[13px] text-(--theme-muted)">
          {t("courses.syllabusSubtitle")}
        </p>
      </div>

      <ol className="space-y-3">
        {topics.map((topic, index) => (
          <li
            key={topic.id}
            className="cd-review-card flex items-start gap-3 rounded-2xl border p-4"
          >
            <span className="cd-price grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--theme-primary)_12%,transparent)] text-sm font-extrabold text-(--theme-primary)">
              {toPersianDigits(index + 1, language)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-base font-extrabold text-(--theme-foreground)">
                {topic.title}
              </span>
              {topic.description ? (
                <span className="mt-0.5 block text-xs text-(--theme-muted)">
                  {topic.description}
                </span>
              ) : null}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
