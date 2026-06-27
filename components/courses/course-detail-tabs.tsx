"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n/hooks";
import type { CourseSummary } from "@/lib/api/types";
import { CourseOverview } from "@/components/courses/course-overview";
import { CourseCurriculum } from "@/components/courses/course-curriculum";
import { CourseInstructor } from "@/components/courses/course-instructor";
import { CourseReviews } from "@/components/courses/course-reviews";

interface CourseDetailTabsProps {
  course: CourseSummary;
  isLoggedIn: boolean;
  lessonCount: number;
  durationHours: number | null;
}

type TabKey = "overview" | "curriculum" | "instructor" | "reviews";

export function CourseDetailTabs({
  course,
  isLoggedIn,
  lessonCount,
  durationHours,
}: CourseDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("curriculum");
  const { t } = useTranslation();

  const tabs: { key: TabKey; label: string }[] = [
    { key: "overview", label: t("courses.tabIntro") },
    { key: "curriculum", label: t("courses.tabCurriculum") },
    { key: "instructor", label: t("courses.tabInstructor") },
    { key: "reviews", label: t("courses.tabReviews") },
  ];

  return (
    <div className="space-y-7">
      {/* Pill tab bar — sliding indicator follows the active tab */}
      <div className="sticky top-[70px] z-30 flex gap-1 rounded-full border border-(--theme-border-color) bg-(--theme-surface) p-[5px]">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex-1 rounded-full px-3 py-2.5 text-sm font-extrabold transition-colors duration-200 ${
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
          description={course.description}
          lessonCount={lessonCount}
          durationHours={durationHours}
        />
      )}

      {activeTab === "curriculum" && (
        <CourseCurriculum lessonCount={lessonCount} durationHours={durationHours} />
      )}

      {activeTab === "instructor" && (
        <CourseInstructor name={course.author?.display_name} />
      )}

      {activeTab === "reviews" && (
        <CourseReviews courseId={course.id} isLoggedIn={isLoggedIn} />
      )}
    </div>
  );
}
