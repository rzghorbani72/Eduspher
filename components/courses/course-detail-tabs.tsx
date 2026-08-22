"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

import { useTranslation } from "@/lib/i18n/hooks";
import type { CourseSummary } from "@/lib/api/types";
import { buildContentStats, buildCurriculum } from "@/lib/courses/curriculum";
import { CourseOverview } from "@/components/courses/course-overview";
import { CourseCurriculum } from "@/components/courses/curriculum";
import { CourseLiveSchedule } from "@/components/courses/course-live-schedule";
import { CourseInstructor } from "@/components/courses/course-instructor";
import { CourseReviews } from "@/components/courses/course-reviews";

interface CourseDetailTabsProps {
  course: CourseSummary;
  isLoggedIn: boolean;
  previewBasePath: string | null;
  prerequisiteHref: string | null;
  instructorAvatarUrl: string | null;
}

type TabKey = "overview" | "curriculum" | "live" | "instructor" | "reviews";

export function CourseDetailTabs({
  course,
  isLoggedIn,
  previewBasePath,
  prerequisiteHref,
  instructorAvatarUrl,
}: CourseDetailTabsProps) {
  const { t } = useTranslation();
  const seasons = useMemo(() => buildCurriculum(course), [course]);
  const stats = useMemo(
    () => buildContentStats(seasons, course.lessons_count, course.duration),
    [seasons, course.lessons_count, course.duration],
  );

  const tabs = useMemo(() => {
    const list: { key: TabKey; label: string }[] = [
      { key: "overview", label: t("courses.tabIntro") },
      { key: "curriculum", label: t("courses.tabCurriculum") },
    ];
    if (stats.liveCount > 0) {
      list.push({ key: "live", label: t("courses.tabLive") });
    }
    list.push(
      { key: "instructor", label: t("courses.tabInstructor") },
      { key: "reviews", label: t("courses.tabReviews") },
    );
    return list;
  }, [stats.liveCount, t]);

  const [activeTab, setActiveTab] = useState<TabKey>("curriculum");

  return (
    <div className="space-y-7">
      <div
        role="tablist"
        className="sticky top-[70px] z-30 flex gap-1 overflow-x-auto rounded-full border border-(--theme-border-color) bg-(--theme-surface) p-[5px]"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.key)}
              className={`relative min-w-fit flex-1 whitespace-nowrap rounded-full px-3 py-2.5 text-sm font-extrabold transition-colors duration-200 ${
                isActive
                  ? "text-(--theme-foreground)"
                  : "text-(--theme-muted) hover:text-(--theme-foreground)"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="cd-tab-bg"
                  className="absolute inset-0 rounded-full bg-(--theme-card-bg) shadow-sm"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === "overview" && (
        <CourseOverview
          course={course}
          stats={stats}
          prerequisiteHref={prerequisiteHref}
        />
      )}

      {activeTab === "curriculum" && (
        <CourseCurriculum
          seasons={seasons}
          stats={stats}
          previewBasePath={previewBasePath}
        />
      )}

      {activeTab === "live" && <CourseLiveSchedule seasons={seasons} />}

      {activeTab === "instructor" && (
        <CourseInstructor
          author={course.author ?? course.Profile ?? null}
          avatarUrl={instructorAvatarUrl}
          rating={course.rating ?? null}
          studentsCount={course.students_count ?? null}
        />
      )}

      {activeTab === "reviews" && (
        <CourseReviews courseId={course.id} isLoggedIn={isLoggedIn} />
      )}
    </div>
  );
}
