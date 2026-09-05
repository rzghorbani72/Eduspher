import { Button } from '../_shared/primitives';
import { templateHref } from '../_shared/routes';
import { loadTemplateCourses } from '../_shared/courses-data';
import { TemplateCourseCard } from '../_shared/course-card';
import { SectionEmptyState } from '@/components/ui-blocks/slot-grid';
import { text, type TemplateSectionProps } from '../_shared/types';
import { ROUZAN_DEFAULTS } from './defaults';
import { ROUZAN_COURSE_CARD } from './course-card-spec';
import { Wrap, SectionHead } from './layout';

/**
 * The real catalogue, in Rouzan's shell.
 *
 * Data comes from `loadTemplateCourses` and the card is the shared one, so the
 * home page, the catalogue and the course detail page keep showing the same
 * course the same way — only the section frame is this template's own.
 */
export async function RouzanCourses({ id, config, storeContext }: TemplateSectionProps) {
  const d = ROUZAN_DEFAULTS.courses;
  const limit = typeof config?.limit === 'number' ? config.limit : 6;
  const courses = await loadTemplateCourses(storeContext, limit);

  return (
    <section
      id={id || 'courses'}
      className="border-y border-(--theme-border-color) bg-(--theme-surface-alt) text-(--theme-foreground)"
    >
      <div className="py-(--theme-section-padding-y)">
        <Wrap>
          <SectionHead
            eyebrow={text(config, 'eyebrow', d.eyebrow)}
            title={text(config, 'title', d.title)}
            aside={
              <Button
                tone="outline"
                size="sm"
                editableKey="ctaText"
                href={templateHref(storeContext, 'courses')}
                className="!rounded-lg"
              >
                {text(config, 'ctaText', d.ctaText)}
              </Button>
            }
          />

          {courses.length === 0 ? (
            <SectionEmptyState
              title="هنوز دوره‌ای منتشر نشده است"
              subtitle="اولین دورهٔ خود را از بخش «دوره‌ها» در داشبورد بسازید تا اینجا نمایش داده شود."
            />
          ) : (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course, index) => (
                <TemplateCourseCard
                  key={course.id}
                  course={course}
                  spec={ROUZAN_COURSE_CARD}
                  index={index}
                />
              ))}
            </div>
          )}
        </Wrap>
      </div>
    </section>
  );
}
