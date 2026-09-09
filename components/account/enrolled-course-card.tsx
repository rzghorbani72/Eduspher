import Link from "@/components/ui/link";
import { COURSE_CARD_THUMB_CLASS } from "@/components/courses/course-card-layout";
import { TemplateCourseCard } from "@/components/templates/_shared/course-card";
import type { TemplateCourse } from "@/components/templates/_shared/courses-data";
import { resolveTemplateCourseCard } from "@/components/templates/registry";
import { getActiveTemplateKey } from "@/lib/active-template";
import type { LanguageCode } from "@/lib/i18n/config";
import { t } from "@/lib/i18n/server-translations";
import { learnPath } from "@/lib/content-paths";
import { buildAcademyPath, cn, formatPercent } from "@/lib/utils";

interface EnrolledCourse {
  id: string | number;
  title: string;
  slug: string;
  is_free: boolean;
  Image?: { publicUrl: string } | null;
  Category?: { name: string } | null;
  author?: { display_name: string } | null;
  /** The teacher, as the enrollments endpoint returns them. */
  Profile?: { display_name: string } | null;
}

interface EnrolledCourseCardProps {
  enrollment: {
    id: string | number;
    status: string;
    progress_percent: number;
    last_accessed: string;
    course?: EnrolledCourse | null;
  };
  storeSlug: string | null;
  language: LanguageCode;
  /** Position in the grid — picks the template's thumbnail tone round-robin. */
  index?: number;
}

/**
 * A purchased course in "my courses". It draws the academy's own course card —
 * the same one the storefront uses — and only swaps the price footer for the
 * progress bar and the continue button, so a student sees one card design
 * everywhere on the academy.
 */
export async function EnrolledCourseCard({
  enrollment,
  storeSlug,
  language,
  index = 0,
}: EnrolledCourseCardProps) {
  const course = enrollment.course;
  if (!course) return null;

  const translate = (key: string) => t(key, language);
  const href = buildAcademyPath(storeSlug, learnPath(course.slug));
  const progress = Math.min(Math.round(enrollment.progress_percent), 100);
  const isCompleted = enrollment.status === "COMPLETED";
  const teacherName =
    course.author?.display_name ?? course.Profile?.display_name ?? null;

  const templateCourse: TemplateCourse = {
    id: String(course.id),
    title: course.title,
    href,
    priceLabel: "",
    isFree: course.is_free,
    isLive: false,
    teacherName,
    teacherInitials: teacherName?.trim().charAt(0) ?? "—",
    levelLabel: course.Category?.name ?? null,
    lessonsLabel: null,
    durationLabel: null,
    ratingLabel: null,
    coverUrl: course.Image?.publicUrl ?? null,
  };

  const footer = (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[13px] text-(--theme-muted)">
          <span>
            {isCompleted
              ? translate("account.statusCompleted")
              : translate("account.progress")}
          </span>
          <span className="font-bold text-(--theme-foreground)">
            {formatPercent(progress, language)}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-(--theme-surface-alt)">
          <div
            className="h-1.5 rounded-full bg-(--theme-primary)"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <Link
        href={href}
        className="inline-flex h-10 w-full items-center justify-center rounded-(--theme-border-radius) bg-(--theme-primary) text-sm font-bold text-(--theme-on-primary) transition-opacity hover:opacity-90"
      >
        {translate("account.continueLearning")} →
      </Link>
    </div>
  );

  const spec = resolveTemplateCourseCard(await getActiveTemplateKey());
  if (!spec) {
    return <FallbackCard course={templateCourse} footer={footer} />;
  }

  return (
    <TemplateCourseCard
      course={templateCourse}
      spec={spec}
      index={index}
      footer={footer}
    />
  );
}

/** Academies on no template keep a plain card in the same shape. */
function FallbackCard({
  course,
  footer,
}: {
  course: TemplateCourse;
  footer: React.ReactNode;
}) {
  return (
    <article className="flex h-full w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-theme bg-card shadow-sm">
      <div
        className={cn(
          COURSE_CARD_THUMB_CLASS,
          "bg-(--theme-primary)/15 bg-cover bg-center",
        )}
        style={
          course.coverUrl ? { backgroundImage: `url(${course.coverUrl})` } : undefined
        }
      />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="font-bold leading-snug text-(--theme-foreground)">
          {course.title}
        </p>
        {course.teacherName ? (
          <p className="text-sm text-muted">{course.teacherName}</p>
        ) : null}
        <div className="mt-auto border-t border-theme pt-3.5">{footer}</div>
      </div>
    </article>
  );
}
