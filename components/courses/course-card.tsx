"use client";

import Link from "next/link";
import { MessageSquare, Star, Users, BookOpen, Clock } from "lucide-react";

import type { CourseSummary } from "@/lib/api/types";
import { buildSchoolPath, formatCurrencyWithSchool, resolveAssetUrl, truncate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardMedia } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n/hooks";

interface CourseCardProps {
  course: CourseSummary;
  schoolSlug?: string | null;
  school?: {
    currency?: string;
    currency_symbol?: string;
    currency_position?: "before" | "after";
  } | null;
}

export const CourseCard = ({ course, schoolSlug = null, school = null }: CourseCardProps) => {
  const { t, language } = useTranslation();
  const coverUrl = resolveAssetUrl(course.cover?.url) ?? "/window.svg";
  const hasDiscount = course.original_price && course.original_price > course.price;
  const detailHref = buildSchoolPath(schoolSlug, `/courses/${course.id}`);

  return (
    <Card 
      data-scroll-animate="scaleUp"
      data-scroll-delay="0"
      className="group relative overflow-hidden transition-all duration-300 hover:border-[var(--theme-primary)]/30 hover-lift hover:shadow-xl" 
      data-animation-style="dynamic"
    >
      {/* Animated gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--theme-primary)]/0 via-[var(--theme-secondary)]/0 to-[var(--theme-accent)]/0 opacity-0 transition-opacity duration-500 group-hover:opacity-5 -z-10" />
      
      {/* Enhanced floating particles effect with theme colors */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute top-4 right-4 w-2 h-2 bg-[var(--theme-primary)] rounded-full animate-float-slow shadow-lg shadow-[var(--theme-primary)]/50" style={{ animationDelay: '0s' }} />
        <div className="absolute bottom-8 left-8 w-1.5 h-1.5 bg-[var(--theme-secondary)] rounded-full animate-float-slow shadow-lg shadow-[var(--theme-secondary)]/50" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-[var(--theme-accent)] rounded-full animate-float-slow shadow-lg shadow-[var(--theme-accent)]/50" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/4 right-1/3 w-1.5 h-1.5 bg-[var(--theme-primary)]/60 rounded-full animate-float-slow shadow-lg shadow-[var(--theme-primary)]/50" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-[var(--theme-secondary)]/60 rounded-full animate-float-slow shadow-lg shadow-[var(--theme-secondary)]/50" style={{ animationDelay: '1.5s' }} />
      </div>
      
      <CardMedia src={coverUrl} alt={course.title} className="transition-transform duration-500 group-hover:scale-110" />
      <CardContent className="space-y-3 p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {course.category ? <Badge variant="soft">{course.category.name}</Badge> : null}
          {course.is_featured ? <Badge variant="warning">{t("courses.featured")}</Badge> : null}
          {course.is_certificate ? <Badge variant="success">{t("courses.certificate")}</Badge> : null}
        </div>
        <h3 className="text-lg font-semibold leading-7 text-slate-900 transition-colors group-hover:text-[var(--theme-primary)] dark:text-slate-100 dark:group-hover:text-[var(--theme-primary)]">
          {course.title}
        </h3>
        {course.short_description ? (
          <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
            {truncate(course.short_description, 160)}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
          {course.comments_count !== undefined && course.comments_count > 0 && (
            <div className="flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{course.comments_count}</span>
            </div>
          )}
          {course.rating !== undefined && course.rating > 0 && (
            <div className="flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>{course.rating.toFixed(1)}</span>
              {course.rating_count !== undefined && course.rating_count > 0 && (
                <span className="text-slate-400">({course.rating_count})</span>
              )}
            </div>
          )}
          {course.students_count !== undefined && course.students_count > 0 && (
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              <span>{course.students_count}</span>
            </div>
          )}
          {course.lessons_count !== undefined && course.lessons_count > 0 && (
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              <span>{course.lessons_count}</span>
            </div>
          )}
          {course.duration !== undefined && course.duration !== null && course.duration > 0 && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>
                {course.duration >= 60
                  ? `${Math.floor(course.duration / 60)}h ${course.duration % 60}m`
                  : `${course.duration}m`}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:text-slate-200">
          <div className="flex flex-col gap-1">
            {course.is_free ? (
              <span className="text-[var(--theme-primary)]">{t("courses.free")}</span>
            ) : hasDiscount ? (
              <>
                <span className="text-slate-500 line-through dark:text-slate-400">
                  {formatCurrencyWithSchool(course.original_price || 0, school, undefined, language)}
                </span>
                <span className="text-[var(--theme-primary)]">
                  {formatCurrencyWithSchool(course.price || 0, school, undefined, language)}
                </span>
              </>
            ) : (
              <span className="text-[var(--theme-primary)]">
                {formatCurrencyWithSchool(course.price || 0, school, undefined, language)}
              </span>
            )}
          </div>
          {course.author ? <span className="text-slate-600 dark:text-slate-400">{course.author.display_name}</span> : null}
        </div>
        <Link
          href={detailHref}
          className="inline-flex items-center text-sm font-semibold text-[var(--theme-primary)] transition-all hover:translate-x-1 hover:underline"
        >
          {t("courses.viewCourseLink")} →
        </Link>
      </CardContent>
    </Card>
  );
};

