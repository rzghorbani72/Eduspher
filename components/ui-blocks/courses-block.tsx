import { getCourses, getCurrentUser, getCurrentStore, getStoreBySlug } from "@/lib/api/server";
import { CourseCard } from "@/components/courses/course-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { buildStorePath } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { getStoreLanguage } from "@/lib/i18n/server";
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

  const [coursePayload, user, currentStore] = await Promise.all([
    getCourses({
      limit,
      published: true,
    }).catch(() => null),
    getCurrentUser().catch(() => null),
    getCurrentStore().catch(() => null),
  ]);

  const courses = coursePayload?.courses || [];
  const storeCurrency = user?.currentStore || (currentStore as any) || null;

  // Get store language for translations
  let storeForLang = currentStore;
  if (!storeForLang && storeContext?.slug) {
    storeForLang = await getStoreBySlug(storeContext.slug).catch(() => null);
  }
  const language = getStoreLanguage(storeForLang?.language || null, storeForLang?.country_code || null);
  const translate = (key: string) => t(key, language);

  if (courses.length === 0) {
    return null;
  }

  // Minimal layout
  if (layout === "minimal") {
    return (
      <section id={id || "courses"} className="py-6 sm:py-8 bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {(title || subtitle) && (
            <div className="mb-6">
              {title && (
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
                  {subtitle}
                </p>
              )}
            </div>
          )}
          <div
            className={cn(
              "grid gap-6",
              gridColClasses[gridColumns]
            )}
          >
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} storeSlug={storeContext?.slug ?? null} store={storeCurrency} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Compact layout
  if (layout === "compact") {
    return (
      <section id={id || "courses"} className="py-6 sm:py-8 bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {(title || subtitle) && (
            <div className="mb-6">
              {title && (
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {subtitle}
                </p>
              )}
            </div>
          )}
          <div
            className={cn(
              "grid gap-4",
              gridColClasses[gridColumns]
            )}
          >
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} storeSlug={storeContext?.slug ?? null} store={storeCurrency} />
            ))}
          </div>
          {showViewAll && (
            <div className="mt-6 text-center">
              <Button
                variant="outline"
                size="default"
                asChild
                className="border-slate-300 dark:border-slate-600"
              >
                <Link href={buildStorePath(storeContext?.slug ?? null, "/courses")}>
                  {translate("home.viewAllCourses")}
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Featured layout
  if (layout === "featured") {
  return (
      <section id={id || "courses"} className="py-8 sm:py-10 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {(title || subtitle) && (
            <div className="mx-auto max-w-2xl text-center mb-8">
          {title && (
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-1 text-base leading-7 text-slate-600 dark:text-slate-300">
              {subtitle}
            </p>
          )}
        </div>
          )}
        <div
            className={cn(
              "mx-auto grid gap-6",
              gridColClasses[gridColumns],
              "lg:max-w-none"
            )}
          >
            {courses.map((course) => (
              <div key={course.id} className="transform transition-all hover:scale-105">
                <CourseCard course={course} storeSlug={storeContext?.slug ?? null} store={storeCurrency} />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // List layout
  if (layout === "list") {
    return (
      <section id={id || "courses"} className="py-8 sm:py-10 bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {(title || subtitle) && (
            <div className="mb-6">
              {title && (
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="mt-1 text-base text-slate-600 dark:text-slate-300">
                  {subtitle}
                </p>
              )}
            </div>
          )}
          <div className="space-y-4">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} storeSlug={storeContext?.slug ?? null} />
          ))}
        </div>
        {showViewAll && (
          <div className="mt-6 text-center">
            <Button 
              size="lg" 
              asChild
              className="bg-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/90 text-white shadow-lg shadow-[var(--theme-primary)]/30 transition-all hover:scale-105"
              >
                <Link href={buildStorePath(storeContext?.slug ?? null, "/courses")}>
                  {translate("home.viewAllCourses")}
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Default: grid layout
  return (
    <section id={id || "courses"} className="py-8 sm:py-10 bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {(title || subtitle) && (
          <div className="mx-auto max-w-2xl text-center mb-8">
            {title && (
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-1 text-base leading-7 text-slate-600 dark:text-slate-300">
                {subtitle}
              </p>
            )}
          </div>
        )}
        <div
          className={cn(
            "mx-auto grid gap-6",
            gridColClasses[gridColumns],
            "lg:max-w-none"
          )}
        >
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} storeSlug={storeContext?.slug ?? null} />
          ))}
        </div>
        {showViewAll && (
          <div className="mt-6 text-center">
            <Button
              size="lg"
              asChild
              className="bg-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/90 text-white shadow-lg shadow-[var(--theme-primary)]/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-[var(--theme-primary)]/40"
            >
              <Link href={buildStorePath(storeContext?.slug ?? null, "/courses")}>
                View All Courses
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

