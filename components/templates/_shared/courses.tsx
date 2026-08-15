import { Container, SectionHead } from './section';
import { Button, Initials } from './primitives';
import { loadTemplateCourses, type TemplateCourse } from './courses-data';
import { SectionEmptyState } from '@/components/ui-blocks/slot-grid';
import { text, type SectionConfig, type TemplateStoreContext } from './types';
import { isSampleRecord } from './sample-data';

export interface CoursesDefaults {
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaText: string;
}

interface TemplateCoursesProps {
  id?: string;
  config?: SectionConfig;
  storeContext?: TemplateStoreContext;
  defaults: CoursesDefaults;
  /** Per-template thumbnail gradients, applied round-robin. */
  thumbTones: readonly string[];
  thumbClassName: string;
  tone?: 'page' | 'surface';
  /** `rating` closes the card with a score, `action` with a details button. */
  footer?: 'rating' | 'action';
  bordered?: boolean;
}

const TONE_CLASS = {
  page: 'bg-(--theme-background) text-(--theme-foreground)',
  surface: 'bg-(--theme-surface-alt) text-(--theme-foreground)',
} as const;

/**
 * Live course grid shared by every template. Courses come from the academy's
 * real catalogue; the per-template look is carried by the thumbnail tones and
 * the footer variant, so seven designs do not mean seven data paths.
 */
export async function TemplateCourses({
  id,
  config,
  storeContext,
  defaults,
  thumbTones,
  thumbClassName,
  tone = 'surface',
  footer = 'rating',
  bordered = true,
}: TemplateCoursesProps) {
  const limit = typeof config?.limit === 'number' ? config.limit : 9;
  const courses = await loadTemplateCourses(storeContext, limit);

  return (
    <section
      id={id || 'courses'}
      className={`${TONE_CLASS[tone]} ${bordered ? 'border-y border-(--theme-border-color)' : ''}`}
    >
      <Container className="py-(--theme-section-padding-y)">
        <SectionHead
          eyebrow={text(config, 'eyebrow', defaults.eyebrow)}
          title={text(config, 'title', defaults.title)}
          subtitle={text(config, 'subtitle', defaults.subtitle)}
        />

        {courses.length === 0 ? (
          <SectionEmptyState
            title="هنوز دوره‌ای منتشر نشده است"
            subtitle="اولین دورهٔ خود را از بخش «دوره‌ها» در داشبورد بسازید تا اینجا نمایش داده شود."
          />
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course, index) => (
                <TemplateCourseCard
                  key={course.id}
                  course={course}
                  thumbClassName={`${thumbClassName} ${thumbTones[index % thumbTones.length]}`}
                  footer={footer}
                />
              ))}
            </div>
            <div className="mt-10">
              <Button tone="outline" href="/courses" editableKey="ctaText">
                {text(config, 'ctaText', defaults.ctaText)}
              </Button>
            </div>
          </>
        )}
      </Container>
    </section>
  );
}

function TemplateCourseCard({
  course,
  thumbClassName,
  footer,
}: {
  course: TemplateCourse;
  thumbClassName: string;
  footer: 'rating' | 'action';
}) {
  return (
    <article className="flex flex-col overflow-hidden rounded-(--theme-border-radius) border border-(--theme-border-color) bg-(--theme-surface) transition-[transform,border-color] duration-200 hover:-translate-y-1 hover:border-(--theme-primary)">
      <a href={course.href} className="block">
        <div className={thumbClassName}>
          {isSampleRecord(course.id) ? (
            <span className="absolute top-3 end-3 z-[2] rounded-(--theme-border-radius) bg-(--theme-deep)/85 px-2.5 py-1 text-[11px] font-bold text-(--theme-on-deep)">
              نمونهٔ پیش‌نمایش
            </span>
          ) : null}
          {course.levelLabel ? (
            <span className="absolute top-3 start-3 z-[2] rounded-(--theme-border-radius) bg-(--theme-surface)/90 px-2.5 py-1 text-[11px] font-bold text-(--theme-foreground)">
              {course.levelLabel}
            </span>
          ) : null}
        </div>
      </a>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-[18.5px] font-bold leading-[1.45]">
          <a href={course.href} className="hover:text-(--theme-primary)">
            {course.title}
          </a>
        </h3>

        {course.teacherName ? (
          <p className="flex items-center gap-2.5 text-[13.5px] text-(--theme-muted)">
            <Initials value={course.teacherInitials} className="size-7" />
            {course.teacherName}
          </p>
        ) : null}

        <p className="flex flex-wrap gap-3.5 border-t border-(--theme-border-color) pt-3 text-[13px] text-(--theme-muted)">
          {course.durationLabel ? <span>{course.durationLabel}</span> : null}
          {course.lessonsLabel ? <span>{course.lessonsLabel}</span> : null}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-(--theme-border-color) pt-3.5">
          <span className="text-[17px] font-bold">{course.priceLabel}</span>
          {footer === 'action' ? (
            <Button tone="deep" size="sm" href={course.href}>
              جزئیات
            </Button>
          ) : course.ratingLabel ? (
            <span className="text-[13px] font-bold text-(--theme-accent)">★ {course.ratingLabel}</span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
