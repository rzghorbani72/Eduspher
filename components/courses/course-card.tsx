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
    <Card>
      <CardMedia src={coverUrl} alt={course.title} />
      <CardContent>
        <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {course.category ? <Badge variant="soft">{course.category.name}</Badge> : null}
          {course.is_featured ? <Badge variant="warning">Featured</Badge> : null}
          {course.is_certificate ? <Badge variant="success">Certificate</Badge> : null}
        </div>
        <h3 className="text-xl font-semibold text-slate-900 transition group-hover:text-sky-600 dark:text-slate-100 dark:group-hover:text-sky-400">
          {course.title}
        </h3>
        {course.short_description ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {truncate(course.short_description, 160)}
          </p>
        ) : null}
        <div className="flex items-center justify-between pt-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
          <span>{priceLabel}</span>
          {course.author ? <span>{course.author.display_name}</span> : null}
        </div>
        <Link
          href={detailHref}
          className="inline-flex items-center text-sm font-semibold text-sky-600 transition hover:translate-x-1 dark:text-sky-400"
        >
          View course →
        </Link>
      </CardContent>
    </Card>
  );
};

