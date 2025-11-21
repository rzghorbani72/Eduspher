import Link from "next/link";

import type { CourseSummary } from "@/lib/api/types";
import { buildSchoolPath, formatCurrency, resolveAssetUrl, truncate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardMedia } from "@/components/ui/card";

interface CourseCardProps {
  course: CourseSummary;
  schoolSlug?: string | null;
}

export const CourseCard = ({ course, schoolSlug = null }: CourseCardProps) => {
  const coverUrl = resolveAssetUrl(course.cover?.url) ?? "/window.svg";
  const priceLabel = course.is_free ? "Free" : formatCurrency(course.price || 0);
  const detailHref = buildSchoolPath(schoolSlug, `/courses/${course.id}`);

  return (
    <Card className="transition-all duration-300 hover:border-[var(--theme-primary)]/30">
      <CardMedia src={coverUrl} alt={course.title} />
      <CardContent className="space-y-3 p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {course.category ? <Badge variant="soft">{course.category.name}</Badge> : null}
          {course.is_featured ? <Badge variant="warning">Featured</Badge> : null}
          {course.is_certificate ? <Badge variant="success">Certificate</Badge> : null}
        </div>
        <h3 className="text-lg font-semibold leading-7 text-slate-900 transition-colors group-hover:text-[var(--theme-primary)] dark:text-slate-100 dark:group-hover:text-[var(--theme-primary)]">
          {course.title}
        </h3>
        {course.short_description ? (
          <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
            {truncate(course.short_description, 160)}
          </p>
        ) : null}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:text-slate-200">
          <span className="text-[var(--theme-primary)]">{priceLabel}</span>
          {course.author ? <span className="text-slate-600 dark:text-slate-400">{course.author.display_name}</span> : null}
        </div>
        <Link
          href={detailHref}
          className="inline-flex items-center text-sm font-semibold text-[var(--theme-primary)] transition-all hover:translate-x-1 hover:underline"
        >
          View course →
        </Link>
      </CardContent>
    </Card>
  );
};

