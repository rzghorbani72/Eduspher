"use client";

import Link from "next/link";
import { CourseCard } from "@/components/courses/course-card";
import { buildSchoolPath } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/hooks";
import type { CourseSummary } from "@/lib/api/types";

interface RelatedCoursesProps {
  courses: CourseSummary[];
  schoolSlug?: string | null;
  school?: {
    currency?: string;
    currency_symbol?: string;
    currency_position?: "before" | "after";
  } | null;
}

export const RelatedCourses = ({ courses, schoolSlug, school }: RelatedCoursesProps) => {
  const { t } = useTranslation();
  
  if (!courses || courses.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t("products.relatedCourses")}
        </h2>
        <Link
          href={buildSchoolPath(schoolSlug, "/courses")}
          className="text-sm font-semibold text-[var(--theme-primary)] transition-all hover:translate-x-1 hover:underline"
        >
          {t("products.viewAllCourses")} →
        </Link>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {courses.map((course, index) => (
          <div
            key={course.id}
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CourseCard course={course} schoolSlug={schoolSlug} school={school} />
          </div>
        ))}
      </div>
    </section>
  );
};

