/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

import {
  getArticles,
  getCategories,
  getCourses,
  getSchoolsPublic,
} from "@/lib/api/server";
import { CourseCard } from "@/components/courses/course-card";
import { buildOgImageUrl, resolveAssetUrl, truncate, buildSchoolPath } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { getSchoolContext } from "@/lib/school-context";

export default async function Home() {
  const schoolContext = await getSchoolContext();
  const buildPath = (path: string) => buildSchoolPath(schoolContext.slug, path);
  const [schools, categories, articles, coursePayload] = await Promise.all([
    getSchoolsPublic().catch(() => []),
    getCategories().catch(() => []),
    getArticles().catch(() => []),
    getCourses({ limit: 3, published: true }).catch(() => null),
  ]);

  const hasCatalogAccess = coursePayload !== null;
  const courses = coursePayload?.courses ?? [];
  const schoolMatchById = schoolContext.id
    ? schools.find((school) => school.id === schoolContext.id)
    : null;
  const schoolMatchBySlug = schoolContext.slug
    ? schools.find((school) => school.slug === schoolContext.slug)
    : null;
  const primarySchool = schoolMatchById ?? schoolMatchBySlug ?? schools[0] ?? null;
  const schoolDisplayName = primarySchool?.name ?? schoolContext.name;
  const schoolHeroLabel = primarySchool?.domain?.public_address ?? primarySchool?.domain?.private_address ?? "Premier digital campus";
  const stats = {
    students: primarySchool?.student_count ?? null,
    mentors: primarySchool?.mentor_count ?? null,
    courses:
      primarySchool?.course_count ?? coursePayload?.pagination?.total ?? null,
    rating: primarySchool?.average_rating ?? null,
  };

  return (
    <div className="space-y-20">
      <section className="grid gap-12 lg:grid-cols-[1.25fr_1fr] lg:items-center">
        <div className="space-y-6">
          <Badge variant="soft" className="w-fit">New • Winter learning festival</Badge>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
            Learn faster with {schoolDisplayName}. Real mentors, real-world projects, real growth.
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">
            Build job-ready skills with curated courses, guided learning paths, and support from
            industry mentors. Join thousands of learners finding confidence through mastery.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href={buildPath("/courses")}
              className="inline-flex h-12 items-center justify-center rounded-full bg-sky-600 px-8 text-base font-semibold text-white shadow-lg shadow-sky-600/30 transition hover:-translate-y-0.5 hover:bg-sky-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400"
            >
              Browse courses
            </Link>
            <Link
              href={buildPath("/auth/login")}
              className="inline-flex h-12 items-center justify-center rounded-full border border-slate-200 px-8 text-base font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900"
            >
              Start for free
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { label: "Learners", value: stats.students ? stats.students.toLocaleString() : "—" },
              { label: "Mentors", value: stats.mentors ? stats.mentors.toLocaleString() : "—" },
              { label: "Courses", value: stats.courses ? stats.courses.toLocaleString() : "—" },
              { label: "Avg. Rating", value: stats.rating ? `${stats.rating.toFixed(1)}/5` : "—" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <p className="text-2xl font-semibold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-8 shadow-xl dark:border-slate-800 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-400">
              {schoolHeroLabel}
            </p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              Personalised learning paths matched to your ambitions.
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Enjoy adaptive recommendations, cohort-based mentorship, and progress analytics
              designed to keep you motivated from day one to job-ready.
            </p>
          </div>
          <div className="mt-8 grid gap-4">
            <div className="rounded-2xl bg-white/90 p-4 shadow-lg shadow-sky-100 dark:bg-slate-900/80 dark:shadow-slate-900/40">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Guided projects</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pair theory with hands-on builds, get timely feedback, refine your craft.
              </p>
            </div>
            <div className="rounded-2xl bg-white/90 p-4 shadow-lg shadow-emerald-100 dark:bg-slate-900/80 dark:shadow-slate-900/40">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Mentor check-ins</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Weekly touch-points that unblock challenges and maintain positive momentum.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">Featured courses</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {hasCatalogAccess
                ? "Curated picks based on trending skills and student success outcomes."
                : "Log in to unlock full course details, lessons, and enrollment."}
            </p>
          </div>
          {hasCatalogAccess ? (
            <Link
              className="text-sm font-semibold text-sky-600 transition hover:text-sky-700 dark:text-sky-400"
              href={buildPath("/courses")}
            >
              Explore full catalogue →
            </Link>
          ) : null}
        </div>
        {courses.length ? (
          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} schoolSlug={schoolContext.slug} />
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
                    className="inline-flex h-11 items-center justify-center rounded-full bg-slate-900 px-6 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-white"
                  >
                    Log in
                  </Link>
                  <Link
                    href={buildPath("/auth/register")}
                    className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900"
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
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">Top categories</h2>
            <Link
              href={buildPath("/courses?view=categories")}
              className="text-sm font-semibold text-sky-600 transition hover:text-sky-700 dark:text-sky-400"
            >
              Browse by interest →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.slice(0, 6).map((category) => (
              <div
                key={category.id}
                className="group flex items-center justify-between rounded-3xl border border-slate-200 bg-gradient-to-r from-white to-slate-50 px-6 py-5 shadow-sm transition hover:-translate-y-1 hover:border-sky-200 hover:shadow-lg dark:border-slate-800 dark:from-slate-950 dark:to-slate-900"
              >
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Category
                  </p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    {category.name}
                  </p>
                  {category.description ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {truncate(category.description, 80)}
                    </p>
                  ) : null}
                </div>
                <span className="text-2xl">→</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {articles.length ? (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">From the journal</h2>
            <Link
              href={buildPath("/articles")}
              className="text-sm font-semibold text-sky-600 transition hover:text-sky-700 dark:text-sky-400"
            >
              Read all insights →
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {articles.slice(0, 3).map((article) => {
              const imageUrl = resolveAssetUrl(article.featured_image?.url) ?? "/globe.svg";
              const description = article.excerpt ?? article.description ?? "";
              const publishedDate = article.published_at
                ? new Date(article.published_at).toLocaleDateString()
                : "";

              return (
                <article
                  key={article.id}
                  className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={article.title}
                      className="h-full w-full object-cover transition duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-6">
                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {publishedDate}
                    </p>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                      {article.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {truncate(description, 140)}
                    </p>
                    <Link
                      href={buildPath(`/articles/${article.id}`)}
                      className="mt-auto inline-flex text-sm font-semibold text-sky-600 transition hover:translate-x-1 dark:text-sky-400"
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

      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 via-sky-500 to-emerald-400 p-10 text-white shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <Badge variant="soft" className="bg-white/20 text-white">Ready to begin?</Badge>
          <h2 className="text-3xl font-semibold sm:text-4xl">
            Create your learning account today and unlock personalised onboarding in minutes.
          </h2>
          <p className="text-sm text-white/80">
            Choose a learning path, meet your mentor, and access premium content with a flexible
            monthly plan. Cancel anytime.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href={buildPath("/auth/login")}
              className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 text-base font-semibold text-sky-700 shadow-lg shadow-sky-900/20 transition hover:-translate-y-0.5 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Join {schoolDisplayName}
            </Link>
            <Link href={buildPath("/pricing")} className="text-sm font-semibold text-white underline">
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
    </div>
  );
}
