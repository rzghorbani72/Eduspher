import { Container, SectionHead } from "./section";
import { Button } from "./primitives";
import { templateHref } from "./routes";
import { loadTemplateCourses } from "./courses-data";
import { TemplateCourseCard, type CourseCardSpec } from "./course-card";
import { COURSE_CARD_GRID_CLASS } from "@/components/courses/course-card-layout";
import { SectionEmptyState } from "@/components/ui-blocks/slot-grid";
import { text, type SectionConfig, type TemplateStoreContext } from "./types";

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
  /** The template's card look, shared with the courses list and detail pages. */
  card: CourseCardSpec;
  tone?: "page" | "surface";
  bordered?: boolean;
}

const TONE_CLASS = {
  page: "bg-(--theme-background) text-(--theme-foreground)",
  surface: "bg-(--theme-surface-alt) text-(--theme-foreground)",
} as const;

/**
 * Live course grid shared by every template. Courses come from the academy's
 * real catalogue; the per-template look is carried by the card spec, so seven
 * designs do not mean seven data paths.
 */
export async function TemplateCourses({
  id,
  config,
  storeContext,
  defaults,
  card,
  tone = "surface",
  bordered = true,
}: TemplateCoursesProps) {
  const limit = typeof config?.limit === "number" ? config.limit : 9;
  const courses = await loadTemplateCourses(storeContext, limit);

  return (
    <section
      id={id || "courses"}
      className={`${TONE_CLASS[tone]} ${bordered ? "border-y border-(--theme-border-color)" : ""}`}
    >
      <Container className="py-(--theme-section-padding-y)">
        <SectionHead
          eyebrow={text(config, "eyebrow", defaults.eyebrow)}
          title={text(config, "title", defaults.title)}
          subtitle={text(config, "subtitle", defaults.subtitle)}
        />

        {courses.length === 0 ? (
          <SectionEmptyState
            title="هنوز دوره‌ای منتشر نشده است"
            subtitle="اولین دورهٔ خود را از بخش «دوره‌ها» در داشبورد بسازید تا اینجا نمایش داده شود."
          />
        ) : (
          <>
            <div className={COURSE_CARD_GRID_CLASS}>
              {courses.map((course, index) => (
                <TemplateCourseCard
                  key={course.id}
                  course={course}
                  spec={card}
                  index={index}
                />
              ))}
            </div>
            <div className="mt-10">
              <Button tone="outline" href={templateHref(storeContext, 'courses')} editableKey="ctaText">
                {text(config, "ctaText", defaults.ctaText)}
              </Button>
            </div>
          </>
        )}
      </Container>
    </section>
  );
}
