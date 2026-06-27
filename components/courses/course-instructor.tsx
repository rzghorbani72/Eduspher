"use client";

import { useTranslation } from "@/lib/i18n/hooks";
import { getInstructorDemo } from "@/components/courses/course-detail-demo";

interface CourseInstructorProps {
  name?: string | null;
}

export function CourseInstructor({ name }: CourseInstructorProps) {
  const { t, language } = useTranslation();
  const demo = getInstructorDemo(language);
  const displayName = name || demo.name;

  const stats = [
    { value: demo.rating, label: t("courses.statAvgRating") },
    { value: demo.students, label: t("courses.statStudentsLabel") },
    { value: demo.courses, label: t("courses.statCoursesLabel") },
  ];

  return (
    <section className="animate-in fade-in slide-in-from-bottom-3 space-y-5 duration-300">
      <h2 className="text-xl font-black text-(--theme-foreground)">{t("courses.instructor")}</h2>

      <div className="cd-review-card rounded-2xl border p-6">
        <div className="flex items-start gap-4">
          <span className="cd-teacher-avatar grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-2xl font-black text-white">
            {displayName.charAt(0)}
          </span>
          <div className="min-w-0 flex-1 text-right">
            <p className="text-lg font-black text-(--theme-foreground)">{displayName}</p>
            <p className="mt-0.5 text-sm font-semibold text-(--theme-primary)">{demo.role}</p>
            <p className="mt-3 text-[13.5px] leading-loose text-(--theme-muted)">{demo.bio}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-(--theme-border-color) pt-5">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="cd-price text-lg font-black text-(--theme-primary)">{stat.value}</div>
              <div className="mt-0.5 text-xs text-(--theme-muted)">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
