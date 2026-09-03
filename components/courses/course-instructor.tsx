"use client";

 
import { useTranslation } from "@/lib/i18n/hooks";
import { toPersianDigits } from "@/lib/utils";
import type { AuthorSummary } from "@/lib/api/types";
import { EmptyState } from "@/components/ui/empty-state";
import { AppImage } from "@/components/ui/app-image";

interface CourseInstructorProps {
  author: AuthorSummary | null;
  avatarUrl: string | null;
  /** Course-level numbers, so the panel never has to duplicate them per teacher. */
  rating: number | null;
  studentsCount: number | null;
}

export function CourseInstructor({
  author,
  avatarUrl,
  rating,
  studentsCount,
}: CourseInstructorProps) {
  const { t, language } = useTranslation();

  if (!author) {
    return <EmptyState title={t("courses.noInstructorInfo")} />;
  }

  const stats = [
    rating != null &&
      rating > 0 && {
        value: toPersianDigits(rating.toFixed(1), language),
        label: t("courses.statAvgRating"),
      },
    studentsCount != null &&
      studentsCount > 0 && {
        value: toPersianDigits(studentsCount.toLocaleString("en-US"), language),
        label: t("courses.statStudentsLabel"),
      },
    author.courses_count != null &&
      author.courses_count > 0 && {
        value: toPersianDigits(author.courses_count, language),
        label: t("courses.statCoursesLabel"),
      },
  ].filter((stat): stat is { value: string; label: string } => Boolean(stat));

  return (
    <section className="animate-in fade-in slide-in-from-bottom-3 space-y-5 duration-300">
      <h2 className="text-xl font-black text-(--theme-foreground)">
        {t("courses.instructor")}
      </h2>

      <div className="cd-review-card rounded-2xl border p-6">
        <div className="flex items-start gap-4">
          {avatarUrl ? (
            <AppImage
              src={avatarUrl}
              alt={author.display_name}
              preset="thumb"
              width={64}
              height={64}
              sizes="64px"
              className="h-16 w-16 shrink-0 rounded-2xl object-cover"
            />
          ) : (
            <span className="cd-teacher-avatar grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-2xl font-black text-white">
              {author.display_name.charAt(0)}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-lg font-black text-(--theme-foreground)">
              {author.display_name}
            </p>
            {author.expertise && (
              <p className="mt-0.5 text-sm font-semibold text-(--theme-primary)">
                {author.expertise}
              </p>
            )}
            {author.bio && (
              <p className="mt-3 whitespace-pre-line text-[13.5px] leading-loose text-(--theme-muted)">
                {author.bio}
              </p>
            )}
          </div>
        </div>

        {stats.length > 0 && (
          <div className="mt-5 grid gap-3 border-t border-(--theme-border-color) pt-5"
            style={{ gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))` }}
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="cd-price text-lg font-black text-(--theme-primary)">
                  {stat.value}
                </div>
                <div className="mt-0.5 text-xs text-(--theme-muted)">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
