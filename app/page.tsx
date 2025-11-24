/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

import {
  getArticles,
  getCategories,
  getCourses,
  getSchoolsPublic,
  getCurrentUser,
  getCurrentSchool,
} from "@/lib/api/server";
import { CourseCard } from "@/components/courses/course-card";
import { buildOgImageUrl, resolveAssetUrl, truncate, buildSchoolPath } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { getSchoolContext } from "@/lib/school-context";
import { getSchoolThemeAndTemplate } from "@/lib/theme-config";
import { BlocksRenderer } from "@/components/ui-blocks/blocks-renderer";

export default async function Home() {
  const schoolContext = await getSchoolContext();
  const buildPath = (path: string) => buildSchoolPath(schoolContext.slug, path);
  const [schools, categories, articles, coursePayload, themeAndTemplate, user, currentSchool] = await Promise.all([
    getSchoolsPublic().catch(() => []),
    getCategories().catch(() => []),
    getArticles().catch(() => []),
    getCourses({ limit: 3, published: true, is_featured: true} as any).catch(() => null),
    getSchoolThemeAndTemplate().catch(() => ({ theme: null, template: null })),
    getCurrentUser().catch(() => null),
    getCurrentSchool().catch(() => null),
  ]);

  const hasCatalogAccess = coursePayload !== null;
  const featuredCourses = coursePayload?.courses ?? [];
  const schoolMatchById = schoolContext.id
    ? schools.find((school) => school.id === schoolContext.id)
    : null;
  const schoolMatchBySlug = schoolContext.slug
    ? schools.find((school) => (school as any).slug === schoolContext.slug)
    : null;
  const primarySchool = schoolMatchById ?? schoolMatchBySlug ?? schools[0] ?? null;
  const schoolDisplayName = primarySchool?.name ?? schoolContext.name;
  const schoolCurrency = user?.currentSchool || (currentSchool as any) || null;
  const schoolHeroLabel = primarySchool?.domain?.public_address ?? primarySchool?.domain?.private_address ?? "Premier digital campus";
  const stats = {
    students: (primarySchool as any)?.student_count ?? null,
    mentors: (primarySchool as any)?.mentor_count ?? null,
    courses:
      (primarySchool as any)?.course_count ?? coursePayload?.pagination?.total ?? null,
    rating: (primarySchool as any)?.average_rating ?? null,
  };

  // If we have a UI template, render blocks dynamically
  // Otherwise, use the default static layout
  const hasUITemplate = themeAndTemplate.template?.blocks && themeAndTemplate.template.blocks.length > 0;
  
  // Log template status in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Home Page] Template status:', {
      hasTemplate: !!themeAndTemplate.template,
      blocksCount: themeAndTemplate.template?.blocks?.length || 0,
      blocks: themeAndTemplate.template?.blocks?.map(b => ({
        id: b.id,
        type: b.type,
        order: b.order,
        isVisible: b.isVisible
      }))
    });
  }
  
  // If we have a UI template, render blocks directly without wrapper
  // Blocks handle their own full-width layouts (header, hero, footer)
  if (hasUITemplate && themeAndTemplate.template) {
    return (
      <BlocksRenderer
        blocks={themeAndTemplate.template.blocks}
        schoolContext={schoolContext}
        includeHeaderFooter={false}
      />
    );
  }

  // Default static layout
  return (
    <div className="space-y-6">
      <>
      <section className="grid gap-6 lg:grid-cols-[1.25fr_1fr] lg:items-center py-6 sm:py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="space-y-4">
          <Badge variant="soft" className="w-fit">New • Winter learning festival</Badge>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Learn faster with {schoolDisplayName}. Real mentors, real-world projects, real growth.
          </h1>
          <p className="max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">
            Build job-ready skills with curated courses, guided learning paths, and support from
            industry mentors. Join thousands of learners finding confidence through mastery.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={buildPath("/courses")}
              className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--theme-primary)] px-6 text-sm font-semibold text-white shadow-lg shadow-[var(--theme-primary)]/30 transition-all hover:scale-105 hover:bg-[var(--theme-primary)]/90 hover:shadow-xl hover:shadow-[var(--theme-primary)]/40"
            >
              Browse courses
            </Link>
            <Link
              href={buildPath("/auth/login")}
              className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 px-6 text-sm font-semibold text-slate-700 transition-all hover:scale-105 hover:bg-slate-100 hover:border-[var(--theme-primary)]/30 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900"
            >
              Start for free
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Learners", value: stats.students ? stats.students.toLocaleString() : "—" },
              { label: "Mentors", value: stats.mentors ? stats.mentors.toLocaleString() : "—" },
              { label: "Courses", value: stats.courses ? stats.courses.toLocaleString() : "—" },
              { label: "Avg. Rating", value: stats.rating ? `${stats.rating.toFixed(1)}/5` : "—" },
            ].map((stat, index) => (
              <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-950 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${index * 50}ms` }}>
                <p className="text-xl font-semibold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-6 shadow-lg transition-all hover:shadow-xl dark:border-slate-800 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 animate-in fade-in slide-in-from-right-4 duration-500 delay-200">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--theme-primary)]">
              {schoolHeroLabel}
            </p>
            <p className="text-base font-semibold text-slate-900 dark:text-white">
              Personalised learning paths matched to your ambitions.
            </p>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
              Enjoy adaptive recommendations, cohort-based mentorship, and progress analytics
              designed to keep you motivated from day one to job-ready.
            </p>
          </div>
          <div className="mt-6 grid gap-3">
            <div className="rounded-xl bg-white/90 p-4 shadow-md shadow-sky-100 transition-all hover:shadow-lg dark:bg-slate-900/80 dark:shadow-slate-900/40">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Guided projects</p>
              <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                Pair theory with hands-on builds, get timely feedback, refine your craft.
              </p>
            </div>
            <div className="rounded-xl bg-white/90 p-4 shadow-md shadow-emerald-100 transition-all hover:shadow-lg dark:bg-slate-900/80 dark:shadow-slate-900/40">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Mentor check-ins</p>
              <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                Weekly touch-points that unblock challenges and maintain positive momentum.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4 py-6 sm:py-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Featured courses</h2>
            <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
              {hasCatalogAccess
                ? "Curated picks based on trending skills and student success outcomes."
                : "Log in to unlock full course details, lessons, and enrollment."}
            </p>
          </div>
          {hasCatalogAccess ? (
            <Link
              className="text-sm font-semibold text-[var(--theme-primary)] transition-all hover:translate-x-1 hover:underline"
              href={buildPath("/courses")}
            >
              Explore full catalogue →
            </Link>
          ) : null}
        </div>
        {featuredCourses.length ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {featuredCourses.map((course, index) => (
              <div
                key={course.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CourseCard course={course} schoolSlug={schoolContext.slug} school={schoolCurrency} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title={hasCatalogAccess ? "No featured courses yet" : "Sign in to explore courses"}
            description={
              hasCatalogAccess
                ? "Check back soon for newly published programs and guided learning paths."
                : "Create a free account or log in to view available courses, pricing, and enrollment options."
            }
            action={
              hasCatalogAccess ? null : (
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href={buildPath("/auth/login")}
                    className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--theme-primary)] px-6 text-sm font-semibold text-white shadow-lg shadow-[var(--theme-primary)]/30 transition-all hover:scale-105 hover:bg-[var(--theme-primary)]/90 hover:shadow-xl hover:shadow-[var(--theme-primary)]/40"
                  >
                    Log in
                  </Link>
                  <Link
                    href={buildPath("/auth/register")}
                    className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 px-6 text-sm font-semibold text-slate-700 transition-all hover:scale-105 hover:bg-slate-100 hover:border-[var(--theme-primary)]/30 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900"
                  >
                    Create account
                  </Link>
                </div>
              )
            }
          />
        )}
      </section>

      {categories.length ? (
        <section className="space-y-4 py-6 sm:py-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Top categories</h2>
            <Link
              href={buildPath("/courses?view=categories")}
              className="text-sm font-semibold text-[var(--theme-primary)] transition-all hover:translate-x-1 hover:underline"
            >
              Browse by interest →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.slice(0, 6).map((category, index) => (
              <div
                key={category.id}
                className="group flex items-center justify-between rounded-xl border border-slate-200 bg-gradient-to-r from-white to-slate-50 px-5 py-4 shadow-sm transition-all hover:-translate-y-1 hover:border-[var(--theme-primary)]/30 hover:shadow-md dark:border-slate-800 dark:from-slate-950 dark:to-slate-900 animate-in fade-in slide-in-from-bottom-2 duration-500"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Category
                  </p>
                  <p className="text-base font-semibold text-slate-900 dark:text-white">
                    {category.name}
                  </p>
                  {category.description ? (
                    <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                      {truncate(category.description, 80)}
                    </p>
                  ) : null}
                </div>
                <span className="text-xl transition-transform group-hover:translate-x-1">→</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {articles.length ? (
        <section className="space-y-4 py-6 sm:py-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">From the journal</h2>
            <Link
              href={buildPath("/articles")}
              className="text-sm font-semibold text-[var(--theme-primary)] transition-all hover:translate-x-1 hover:underline"
            >
              Read all insights →
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {articles.slice(0, 3).map((article, index) => {
              const imageUrl = resolveAssetUrl(article.featured_image?.url) ?? "/globe.svg";
              const description = article.excerpt ?? article.description ?? "";
              const publishedDate = article.published_at
                ? new Date(article.published_at).toLocaleDateString()
                : "";

              return (
                <article
                  key={article.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--theme-primary)]/30 hover:shadow-xl dark:border-slate-800 dark:bg-slate-950 animate-in fade-in slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={article.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {publishedDate}
                    </p>
                    <h3 className="text-lg font-semibold leading-7 text-slate-900 transition-colors group-hover:text-[var(--theme-primary)] dark:text-white dark:group-hover:text-[var(--theme-primary)]">
                      {article.title}
                    </h3>
                    <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                      {truncate(description, 140)}
                    </p>
                    <Link
                      href={buildPath(`/articles/${article.id}`)}
                      className="mt-auto inline-flex items-center text-sm font-semibold text-[var(--theme-primary)] transition-all hover:translate-x-1 hover:underline"
                    >
                      Read article →
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--theme-primary)] via-[var(--theme-secondary)] to-[var(--theme-accent)] p-8 text-white shadow-2xl transition-all hover:shadow-3xl animate-in fade-in slide-in-from-bottom-4 duration-500 delay-600">
        <div className="relative z-10 max-w-3xl space-y-3">
          <Badge variant="soft" className="bg-white/20 text-white">Ready to begin?</Badge>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Create your learning account today and unlock personalised onboarding in minutes.
          </h2>
          <p className="text-sm leading-6 text-white/90">
            Choose a learning path, meet your mentor, and access premium content with a flexible
            monthly plan. Cancel anytime.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={buildPath("/auth/login")}
              className="inline-flex h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-[var(--theme-primary)] shadow-lg shadow-white/20 transition-all hover:scale-105 hover:bg-slate-100"
            >
              Join {schoolDisplayName}
            </Link>
            <Link href={buildPath("/pricing")} className="text-sm font-semibold text-white transition-all hover:translate-x-1 hover:underline">
              View pricing →
            </Link>
          </div>
        </div>
        <img
          src={buildOgImageUrl(schoolDisplayName, "Flexible online learning for ambitious students")}
          alt=""
          className="pointer-events-none absolute -right-32 -top-32 hidden h-80 w-80 opacity-10 lg:block"
        />
      </section>
      </>
    </div>
  );
}
