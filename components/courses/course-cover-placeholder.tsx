import { coursePreviewAccentOrbs } from '@/lib/courses/course-cover';
import { cn } from '@/lib/utils';

interface CourseCoverPlaceholderProps {
  courseId: string;
  /** Lesson title when a preview is selected, otherwise the course name. */
  heading: string;
  className?: string;
}

export function CourseCoverPlaceholder({
  courseId,
  heading,
  className,
}: CourseCoverPlaceholderProps) {
  const orbs = coursePreviewAccentOrbs(courseId);
  const monogram = heading.trim().charAt(0);

  return (
    <div className={cn('cd-preview-placeholder relative overflow-hidden', className)}>
      <div
        className="cd-preview-placeholder-orb-left"
        style={{
          background: `radial-gradient(circle, ${orbs.left}, transparent 62%)`,
        }}
      />
      <div
        className="cd-preview-placeholder-orb-right"
        style={{
          background: `radial-gradient(circle, ${orbs.right}, transparent 62%)`,
        }}
      />
      <div className="cd-preview-placeholder-grid" />

      {monogram ? (
        <span aria-hidden className="cd-preview-placeholder-monogram">
          {monogram}
        </span>
      ) : null}

      {heading ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center px-8 py-10 sm:px-12">
          <p className="cd-preview-placeholder-heading">{heading}</p>
        </div>
      ) : null}

      <div className="cd-preview-placeholder-vignette" />
    </div>
  );
}
