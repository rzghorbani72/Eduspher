import { getCourses, getCurrentUser, getCurrentAcademy, getAcademyBySlug } from "@/lib/api/server";
import { CourseCard } from "@/components/courses/course-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { buildAcademyPath } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { getAcademyLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/server-translations";

interface CoursesBlockProps {
  id?: string;
  config?: {
    title?: string;
    subtitle?: string;
    showFilters?: boolean;
    gridColumns?: number;
    limit?: number;
    layout?: "grid" | "list" | "minimal" | "featured" | "compact";
    showViewAll?: boolean;
    featured?: boolean;
  };
  storeContext?: {
    id: number | null;
    slug: string | null;
    name: string | null;
  };
}

const sectionStyle = { backgroundColor: 'var(--theme-background)', color: 'var(--theme-foreground)' };
const featuredSectionStyle = {
  background: 'linear-gradient(180deg, var(--theme-surface-alt), var(--theme-background))',
  color: 'var(--theme-foreground)',
};

export async function CoursesBlock({ id, config, storeContext }: CoursesBlockProps) {
  const title = config?.title;
  const subtitle = config?.subtitle;
  const limit = config?.limit || 6;
  const gridColumns = config?.gridColumns || 3;
  const layout = config?.layout || "grid";
  const showViewAll = config?.showViewAll !== false;

  const gridColClasses: Record<number, string> = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  const [coursePayload, user, currentAcademy] = await Promise.all([
    getCourses({ limit, published: true }).catch(() => null),
    getCurrentUser().catch(() => null),
    getCurrentAcademy().catch(() => null),
  ]);

  const courses = coursePayload?.courses || [];
  const storeCurrency = user?.currentAcademy || (currentAcademy as any) || null;

  let storeForLang = currentAcademy;
  if (!storeForLang && storeContext?.slug) {
    storeForLang = await getAcademyBySlug(storeContext.slug).catch(() => null);
  }
  const language = getAcademyLanguage(storeForLang?.language || null, storeForLang?.country_code || null);
  const translate = (key: string) => t(key, language);

  if (courses.length === 0) return null;

  const SectionHeader = ({ centered = false }: { centered?: boolean }) =>
    title || subtitle ? (
      <div className={cn("mb-6", centered && "mx-auto max-w-2xl text-center")}>
        {title && (
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
        )}
        {subtitle && (
          <p className="mt-1 text-base leading-7 opacity-60">{subtitle}</p>
        )}
      </div>
    ) : null;

  const ViewAllButton = ({ variant = "primary" }: { variant?: "primary" | "outline" }) =>
    showViewAll ? (
      <div className="mt-6 text-center">
        {variant === "outline" ? (
          <Button
            variant="outline"
            size="md"
            asChild
            style={{ borderColor: 'var(--theme-border-color)', color: 'var(--theme-foreground)' }}
          >
            <Link href={buildAcademyPath(storeContext?.slug ?? null, "/courses")}>
              {translate("home.viewAllCourses")}
            </Link>
          </Button>
        ) : (
          <Button
            size="lg"
            asChild
            className="shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            style={{
              backgroundColor: 'var(--theme-primary)',
              color: 'var(--theme-on-primary)',
              boxShadow: '0 4px 14px color-mix(in srgb, var(--theme-primary) 40%, transparent)',
            }}
          >
            <Link href={buildAcademyPath(storeContext?.slug ?? null, "/courses")}>
              {translate("home.viewAllCourses")}
            </Link>
          </Button>
        )}
      </div>
    ) : null;

  if (layout === "minimal") {
    return (
      <section id={id || "courses"} className="py-6 sm:py-8" style={sectionStyle}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeader />
          <div className={cn("grid gap-6", gridColClasses[gridColumns])}>
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} storeSlug={storeContext?.slug ?? null} store={storeCurrency} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (layout === "compact") {
    return (
      <section id={id || "courses"} className="py-6 sm:py-8" style={sectionStyle}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeader />
          <div className={cn("grid gap-4", gridColClasses[gridColumns])}>
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} storeSlug={storeContext?.slug ?? null} store={storeCurrency} />
            ))}
          </div>
          <ViewAllButton variant="outline" />
        </div>
      </section>
    );
  }

  if (layout === "featured") {
    return (
      <section id={id || "courses"} className="py-8 sm:py-10" style={featuredSectionStyle}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeader centered />
          <div className={cn("mx-auto grid gap-6 lg:max-w-none", gridColClasses[gridColumns])}>
            {courses.map((course) => (
              <div key={course.id} className="transform transition-all hover:scale-105">
                <CourseCard course={course} storeSlug={storeContext?.slug ?? null} store={storeCurrency} />
              </div>
            ))}
          </div>
          <ViewAllButton />
        </div>
      </section>
    );
  }

  if (layout === "list") {
    return (
      <section id={id || "courses"} className="py-8 sm:py-10" style={sectionStyle}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeader />
          <div className="space-y-4">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} storeSlug={storeContext?.slug ?? null} />
            ))}
          </div>
          <ViewAllButton />
        </div>
      </section>
    );
  }

  // Default: grid layout
  return (
    <section id={id || "courses"} className="py-8 sm:py-10" style={sectionStyle}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeader centered />
        <div className={cn("mx-auto grid gap-6 lg:max-w-none", gridColClasses[gridColumns])}>
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} storeSlug={storeContext?.slug ?? null} />
          ))}
        </div>
        <ViewAllButton />
      </div>
    </section>
  );
}
