import Link from '@/components/ui/link';
import { BookOpen } from 'lucide-react';
import { TemplatedCourseCard } from '@/components/courses/templated-course-card';
import { COURSE_CARD_GRID_CLASS } from '@/components/courses/course-card-layout';
import { EmptyState } from '@/components/ui/empty-state';
import { CourseSummary } from '@/lib/api/types';
import { ResolvedAcademy } from '@/lib/store-context';

export function ContentSection({
  buildPath,
  featuredCourses,
  hasCatalogAccess,
  storeContext,
  translate,
}: {
  buildPath: (path: string) => string;
  featuredCourses: CourseSummary[];
  hasCatalogAccess: boolean;
  storeContext: ResolvedAcademy;
  translate: (key: string) => string;
}) {
  return (
    <section className="py-28" style={{ backgroundColor: 'var(--theme-background)' }}>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div
          data-gsap="fade-up"
          className="mb-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p
              className="mb-2 text-xs font-bold tracking-[0.18em] uppercase"
              style={{ color: 'var(--theme-primary)' }}
            >
              {translate('courses.featuredCourses')}
            </p>
            <h2
              className="text-3xl font-black tracking-tight sm:text-4xl"
              style={{
                color: 'var(--theme-foreground)',
                letterSpacing: '-0.025em',
              }}
            >
              {hasCatalogAccess
                ? translate('home.featuredCoursesDescription')
                : translate('home.loginToUnlock')}
            </h2>
          </div>
          {hasCatalogAccess ? (
            <Link
              href={buildPath('/courses')}
              className="group inline-flex shrink-0 items-center gap-1 text-sm font-bold transition-all duration-200"
              style={{ color: 'var(--theme-primary)' }}
            >
              {translate('home.exploreFullCatalogue')}
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </Link>
          ) : null}
        </div>

        {/* Courses grid */}
        {featuredCourses.length ? (
          <div data-gsap="stagger" className={COURSE_CARD_GRID_CLASS}>
            {featuredCourses.map((course, index) => (
              <TemplatedCourseCard
                key={course.id}
                course={course}
                index={index}
                storeSlug={storeContext.isSubdomain ? null : storeContext.slug}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<BookOpen size={28} />}
            title={
              hasCatalogAccess
                ? translate('home.noFeaturedCourses')
                : translate('home.signInToExplore')
            }
            description={
              hasCatalogAccess
                ? translate('home.checkBackSoon')
                : translate('home.createAccountToView')
            }
            action={
              hasCatalogAccess ? (
                <Link
                  href={buildPath('/courses')}
                  className="inline-flex h-12 items-center justify-center rounded-full px-7 text-sm font-bold transition-all duration-200 hover:scale-105"
                  style={{
                    backgroundColor: 'var(--theme-primary)',
                    color: 'var(--theme-on-primary)',
                  }}
                >
                  {translate('home.browseCourses')}
                </Link>
              ) : (
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href={buildPath('/auth/login')}
                    className="inline-flex h-12 items-center justify-center rounded-full px-7 text-sm font-bold"
                    style={{
                      backgroundColor: 'var(--theme-primary)',
                      color: 'var(--theme-on-primary)',
                    }}
                  >
                    {translate('auth.login')}
                  </Link>
                  <Link
                    href={buildPath('/auth/register')}
                    className="inline-flex h-12 items-center justify-center rounded-full border-2 px-7 text-sm font-bold"
                    style={{
                      borderColor: 'var(--theme-border-strong)',
                      color: 'var(--theme-foreground)',
                    }}
                  >
                    {translate('auth.register')}
                  </Link>
                </div>
              )
            }
          />
        )}
      </div>
    </section>
  );
}
