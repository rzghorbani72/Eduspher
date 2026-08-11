"use client";

import Link from "@/components/ui/link";
import { useTranslation } from "@/lib/i18n/hooks";
import { buildAcademyPath, resolveAssetUrl } from "@/lib/utils";

interface EnrolledCourseCardProps {
  enrollment: {
    id: string | number;
    status: string;
    progress_percent: number;
    last_accessed: string;
    course?: {
      id: string | number;
      title: string;
      slug: string;
      is_free: boolean;
      Image?: { publicUrl: string } | null;
      Category?: { name: string } | null;
      author?: { display_name: string } | null;
      Season?: Array<{ Lesson?: Array<{ lesson_type?: string | null }> }> | null;
    } | null;
  };
  storeSlug: string | null;
}

export function EnrolledCourseCard({ enrollment, storeSlug }: EnrolledCourseCardProps) {
  const { t } = useTranslation();
  const course = enrollment.course;
  if (!course) return null;

  const coverUrl = resolveAssetUrl(course.Image?.publicUrl) ?? "/window.svg";
  const href = buildAcademyPath(storeSlug, `/learn/${course.id}`);
  const progress = Math.min(Math.round(enrollment.progress_percent), 100);

  return (
    <div className="flex flex-col rounded-2xl border border-theme bg-card shadow-sm overflow-hidden transition-all hover:shadow-md hover:border-(--theme-primary)/30">
      {/* Cover */}
      <div className="relative h-44 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={coverUrl} alt={course.title} className="h-full w-full object-cover" />
        {enrollment.status === "COMPLETED" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white">
              {t("account.statusCompleted")}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* Tags */}
        <div className="flex flex-wrap gap-2 text-xs">
          {course.Category && (
            <span className="rounded-full border border-theme px-2.5 py-0.5 text-muted">
              {course.Category.name}
            </span>
          )}
        </div>

        {/* Title */}
        <p className="font-bold text-(--theme-foreground) leading-snug line-clamp-2">{course.title}</p>

        {/* Author */}
        {course.author && (
          <p className="text-sm text-muted">{course.author.display_name}</p>
        )}

        {/* Progress */}
        <div className="space-y-1.5 mt-auto">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>{t("account.progress")}</span>
            <span className="font-semibold text-(--theme-primary)">{progress}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-surface-alt overflow-hidden">
            <div
              className="h-1.5 rounded-full bg-(--theme-primary) transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* CTA */}
        <Link
          href={href}
          className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-full bg-(--theme-primary) text-(--theme-on-primary) text-sm font-semibold shadow-sm transition-all hover:opacity-90 hover:scale-[1.02]"
        >
          {t("account.continueLearning")} →
        </Link>
      </div>
    </div>
  );
}
