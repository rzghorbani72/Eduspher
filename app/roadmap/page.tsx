import { notFound } from "next/navigation";

import { getCategories, getCourses, getArticles, getCurrentAcademy, getAcademyBySlug } from "@/lib/api/server";
import { getAcademyContext } from "@/lib/store-context";
import { buildAcademyPath, formatCurrencyWithAcademy, resolveAssetUrl } from "@/lib/utils";
import { getAcademyLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/server-translations";
import { RoadmapTabs } from "@/components/courses/roadmap-tabs";

export default async function RoadmapPage() {
  const storeContext = await getAcademyContext();
  if (!storeContext.slug) notFound();

  const buildPath = (path: string) => buildAcademyPath(storeContext.isSubdomain ? null : storeContext.slug, path);

  const [categories, coursePayload, articles, currentAcademy] = await Promise.all([
    getCategories().catch(() => []),
    getCourses({ limit: 100, published: true }).catch(() => null),
    getArticles().catch(() => []),
    getCurrentAcademy().catch(() => null),
  ]);

  let academy = currentAcademy;
  if (!academy && storeContext.slug) {
    academy = await getAcademyBySlug(storeContext.slug).catch(() => null);
  }

  const language = getAcademyLanguage(academy?.language ?? null, academy?.country_code ?? null);
  const translate = (key: string) => t(key, language);

  const courses = coursePayload?.courses ?? [];

  // Group courses by category to create roadmaps
  const roadmaps = categories
    .filter((cat) => courses.some((c) => c.Category?.id === cat.id))
    .map((cat) => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon ?? "📚",
      description: cat.description ?? "",
      courses: courses
        .filter((c) => c.Category?.id === cat.id)
        .map((c, idx) => ({
          id: c.id,
          step: idx + 1,
          title: c.title,
          short_description: c.short_description ?? "",
          price: c.price,
          is_free: c.is_free,
          lessons_count: c.lessons_count,
          duration: c.duration,
          level: c.is_certificate ? "پیشرفته" : idx === 0 ? "مقدماتی" : "متوسط",
        })),
    }))
    .filter((r) => r.courses.length > 0);

  const store = academy as Parameters<typeof formatCurrencyWithAcademy>[1] ?? null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--theme-foreground)] sm:text-4xl">
          {translate("roadmap.title") || "مرکز یادگیری"}
        </h1>
        <p className="max-w-2xl text-base leading-7 text-muted">
          {translate("roadmap.subtitle") || "یک مسیر ساختارمند را دنبال کنید یا دنبال آخرین مقالات ما را بخوانید."}
        </p>
      </section>

      {/* Tabs: Roadmaps / Articles */}
      <RoadmapTabs
        roadmaps={roadmaps}
        articles={articles.map((a) => ({
          id: a.id,
          title: a.title,
          excerpt: a.excerpt ?? a.description ?? "",
          read_time: a.read_time ?? null,
          published_at: a.published_at ?? null,
          href: buildPath(`/articles/${a.id}`),
          image: a.featured_image?.publicUrl ? resolveAssetUrl(a.featured_image.publicUrl) : null,
          category: a.category?.name ?? null,
        }))}
        store={store}
        language={language}
      />
    </div>
  );
}
