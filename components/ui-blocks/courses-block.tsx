import { getCourses } from "@/lib/api/server";
import { CourseCard } from "@/components/courses/course-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface CoursesBlockProps {
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
}

export async function CoursesBlock({ config }: CoursesBlockProps) {
  const title = config?.title || "Featured Courses";
  const subtitle = config?.subtitle || "Start your learning journey";
  const limit = config?.limit || 6;
  const gridColumns = config?.gridColumns || 3;
  const showViewAll = config?.showViewAll !== false;

  const gridColClasses: Record<number, string> = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  const coursePayload = await getCourses({
    limit,
    published: true,
    is_featured: config?.featured || false,
  }).catch(() => null);

  const courses = coursePayload?.courses || [];

  if (courses.length === 0) {
    return null;
  }

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          {title && (
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-2 text-lg leading-8 text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
        <div
          className={`mx-auto mt-16 grid max-w-2xl gap-8 ${gridColClasses[gridColumns]} sm:mt-20 lg:mx-0 lg:max-w-none`}
        >
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
        {showViewAll && (
          <div className="mt-12 text-center">
            <Button size="lg" asChild>
              <Link href="/courses">View All Courses</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

