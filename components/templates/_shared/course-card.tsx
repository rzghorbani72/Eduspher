import type { ReactNode } from "react";

import { COURSE_CARD_THUMB_CLASS } from "@/components/courses/course-card-layout";
import { sizedImageUrl } from "@/lib/images/sized-image-url";
import { cn, resolveAssetUrl } from "@/lib/utils";
import { Initials } from "./primitives";
import type { TemplateCourse } from "./courses-data";
import { isSampleRecord } from "./sample-data";

/**
 * The per-template look of a single course card, kept apart from the section
 * that lists them. The academy's chosen template owns this spec, so the same
 * card renders on the home page, the courses list and the course detail page.
 */
export interface CourseCardSpec {
  /** Per-template thumbnail gradients, applied round-robin. */
  thumbTones: readonly string[];
  thumbClassName: string;
  /** `rating` closes the card with a score, `action` with a details button. */
  footer?: "rating" | "action";
}

export function TemplateCourseCard({
  course,
  spec,
  index = 0,
  footer,
}: {
  course: TemplateCourse;
  spec: CourseCardSpec;
  index?: number;
  /** Replaces the price/rating row — the account pages close with progress. */
  footer?: ReactNode;
}) {
  const thumbClassName = `${spec.thumbClassName} ${spec.thumbTones[index % spec.thumbTones.length]}`;
  // The cover is painted as a background over the template's gradient, so a
  // missing or unreachable image simply leaves the gradient — an <img> would
  // leave a broken-image box instead.
  const coverUrl = sizedImageUrl(resolveAssetUrl(course.coverUrl), 640);

  return (
    <article className="group flex h-full w-full min-w-0 flex-col overflow-hidden rounded-(--theme-border-radius) border border-(--theme-border-color) bg-(--theme-surface) shadow-(--theme-shadow) transition-[transform,border-color] duration-200 hover:-translate-y-1 hover:border-(--theme-primary)">
      <a href={course.href} className="flex flex-1 flex-col cursor-pointer">
        <div
          className={cn(thumbClassName, COURSE_CARD_THUMB_CLASS)}
          style={
            coverUrl
              ? {
                  backgroundImage: `url(${coverUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        >
          {isSampleRecord(course.id) ? (
            <span className="absolute top-3 end-3 z-[2] rounded-(--theme-border-radius) bg-(--theme-deep)/85 px-2.5 py-1 text-[11px] font-bold text-(--theme-on-deep)">
              نمونهٔ پیش‌نمایش
            </span>
          ) : null}
          {course.isLive ? (
            <span className="absolute top-3 start-3 z-[2] inline-flex items-center gap-1.5 rounded-(--theme-border-radius) bg-[#e11d48] px-2.5 py-1 text-[11px] font-bold text-white">
              <span data-motion="live" className="size-1.5 rounded-full bg-white" />
              کلاس زنده
            </span>
          ) : course.levelLabel ? (
            <span className="absolute top-3 start-3 z-[2] rounded-(--theme-border-radius) bg-(--theme-surface)/90 px-2.5 py-1 text-[11px] font-bold text-(--theme-foreground)">
              {course.levelLabel}
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-3 p-5">
          <h3 className="text-[18.5px] font-bold leading-[1.45] group-hover:text-(--theme-primary)">
            {course.title}
          </h3>

          {course.teacherName ? (
            <p className="flex items-center gap-2.5 text-[13.5px] text-(--theme-muted)">
              <Initials value={course.teacherInitials} className="size-7" />
              {course.teacherName}
            </p>
          ) : null}

          {course.durationLabel || course.lessonsLabel ? (
            <p className="flex flex-wrap gap-3.5 border-t border-(--theme-border-color) pt-3 text-[13px] text-(--theme-muted)">
              {course.durationLabel ? <span>{course.durationLabel}</span> : null}
              {course.lessonsLabel ? <span>{course.lessonsLabel}</span> : null}
            </p>
          ) : null}

          <div className="mt-auto border-t border-(--theme-border-color) pt-3.5">
            {footer ?? (
              <div className="flex items-center justify-between gap-3">
                <span className="text-[17px] font-bold">{course.priceLabel}</span>
                {spec.footer === "action" ? (
                  <span
                    className={`inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-(--theme-border-radius) border border-transparent bg-(--theme-deep) px-4 py-2.5 text-[14px] font-bold text-(--theme-on-deep) transition-opacity duration-150 group-hover:opacity-90`}
                  >
                    جزئیات
                  </span>
                ) : course.ratingLabel ? (
                  <span className="text-[13px] font-bold text-(--theme-accent)">
                    ★ {course.ratingLabel}
                  </span>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </a>
    </article>
  );
}
