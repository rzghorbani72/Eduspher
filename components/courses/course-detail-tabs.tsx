"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n/hooks";
import type { CourseSummary } from "@/lib/api/types";
import { CourseCurriculum } from "@/components/courses/course-curriculum";
import { CourseQnA } from "@/components/courses/course-qna";

interface CourseDetailTabsProps {
  course: CourseSummary;
  isLoggedIn: boolean;
  loginHref: string;
  enrollHref: string;
}

type TabKey = "intro" | "curriculum" | "instructor" | "reviews";

export function CourseDetailTabs({ course, isLoggedIn, loginHref, enrollHref }: CourseDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("intro");
  const { t } = useTranslation();

  const tabs: { key: TabKey; label: string }[] = [
    { key: "intro", label: t("courses.tabIntro") || "معرفی" },
    { key: "curriculum", label: t("courses.tabCurriculum") || "سرفصل‌ها" },
    { key: "instructor", label: t("courses.tabInstructor") || "مدرس" },
    { key: "reviews", label: t("courses.tabReviews") || "نظرات" },
  ];

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-theme">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-semibold transition-all border-b-2 -mb-px ${
              activeTab === tab.key
                ? "border-[var(--theme-primary)] text-[var(--theme-primary)]"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Intro tab */}
      {activeTab === "intro" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* What you'll learn */}
          <div className="rounded-xl border border-theme bg-card p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-3">{t("courses.whatYouWillLearn")}</h2>
            {course.description ? (
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted">{course.description}</p>
            ) : (
              <p className="text-sm text-muted opacity-70">{t("courses.detailedCurriculumComingSoon")}</p>
            )}
          </div>

          {/* Short description */}
          {course.short_description && (
            <div className="rounded-xl border border-theme bg-card p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-3">{t("courses.aboutCourse") || "درباره دوره"}</h2>
              <p className="text-sm leading-relaxed text-muted">{course.short_description}</p>
            </div>
          )}
        </div>
      )}

      {/* Curriculum tab */}
      {activeTab === "curriculum" && (
        <div className="animate-in fade-in duration-300">
          <CourseCurriculum
            courseTitle={course.title}
            seasons={course.Season ?? []}
            isLoggedIn={isLoggedIn}
            loginHref={loginHref}
            enrollHref={enrollHref}
          />
        </div>
      )}

      {/* Instructor tab */}
      {activeTab === "instructor" && (
        <div className="animate-in fade-in duration-300">
          {course.author ? (
            <div className="rounded-xl border border-theme bg-card p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-semibold text-foreground">{t("courses.instructor") || "مدرس دوره"}</h2>
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--theme-primary)] text-xl font-bold text-[var(--theme-on-primary)]">
                  {course.author.display_name.charAt(0)}
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-bold text-[var(--theme-foreground)]">{course.author.display_name}</p>
                  <p className="text-sm text-muted">{t("courses.courseInstructor") || "مدرس این دوره"}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-theme bg-card p-8 text-center text-muted">
              <p>{t("courses.noInstructorInfo") || "اطلاعات مدرس موجود نیست."}</p>
            </div>
          )}
        </div>
      )}

      {/* Reviews tab */}
      {activeTab === "reviews" && (
        <div className="animate-in fade-in duration-300">
          <CourseQnA courseId={course.id} isLoggedIn={isLoggedIn} userRole={undefined} />
        </div>
      )}
    </div>
  );
}
