import { Button } from '../_shared/primitives';
import { templateHref } from '../_shared/routes';
import { loadTemplateCourses } from '../_shared/courses-data';
import { TemplateCourseCard } from '../_shared/course-card';
import { COURSE_CARD_GRID_CLASS } from '@/components/courses/course-card-layout';
import { SectionEmptyState } from '@/components/ui-blocks/slot-grid';
import { text, type TemplateSectionProps } from '../_shared/types';
import { PARTOW_DEFAULTS } from './defaults';
import { PARTOW_COURSE_CARD } from './course-card-spec';
import { Wrap, SectionHead } from './layout';
import styles from './partow.module.css';

/**
 * The real catalogue, in Partow's shell.
 *
 * Data comes from `loadTemplateCourses` and the card is the shared one, so the
 * home page, the catalogue and the course detail page keep showing the same
 * course the same way — only the section frame is this template's own.
 */
export async function PartowCourses({ id, config, storeContext }: TemplateSectionProps) {
  const d = PARTOW_DEFAULTS.courses;
  const limit = typeof config?.limit === 'number' ? config.limit : 6;
  const courses = await loadTemplateCourses(storeContext, limit);

  return (
    <section id={id || 'courses'} className="bg-(--theme-background) text-(--theme-foreground)">
      <div className="py-(--theme-section-padding-y)">
        <Wrap>
          <SectionHead
            eyebrow={text(config, 'eyebrow', d.eyebrow)}
            title={text(config, 'title', d.title)}
          />

          <div className="mt-6.5 flex flex-wrap items-center justify-center gap-3 text-[13px] text-(--theme-muted)">
            <b data-editable="ratingValue" className="font-medium text-(--theme-foreground)">
              {text(config, 'ratingValue', d.ratingValue)}
            </b>
            <span className={styles.rateBox} aria-hidden="true">
              ★★★★★
            </span>
            <span data-editable="ratingNote">{text(config, 'ratingNote', d.ratingNote)}</span>
          </div>

          {courses.length === 0 ? (
            <SectionEmptyState
              title="هنوز دوره‌ای منتشر نشده است"
              subtitle="اولین دورهٔ خود را از بخش «دوره‌ها» در داشبورد بسازید تا اینجا نمایش داده شود."
            />
          ) : (
            <div className={`mt-11 text-start ${COURSE_CARD_GRID_CLASS}`}>
              {courses.map((course, index) => (
                <TemplateCourseCard
                  key={course.id}
                  course={course}
                  spec={PARTOW_COURSE_CARD}
                  index={index}
                />
              ))}
            </div>
          )}

          <div className="mt-10 grid justify-items-center gap-3.5">
            <Button
              tone="primary"
              size="lg"
              editableKey="ctaText"
              href={templateHref(storeContext, 'courses')}
              className="!rounded-full"
            >
              {text(config, 'ctaText', d.ctaText)}
            </Button>
            <p data-editable="note" className="text-[13.5px] text-(--theme-muted)">
              {text(config, 'note', d.note)}
            </p>
          </div>
        </Wrap>
      </div>
    </section>
  );
}
