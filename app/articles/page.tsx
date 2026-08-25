/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "@/components/ui/link";

import { EmptyState } from "@/components/ui/empty-state";
import { PlatformOrganizationJsonLd } from "@/components/seo/platform-organization-json-ld";
import { getArticles } from "@/lib/api/server";
import { buildAcademyPath, resolveAssetUrl, truncate } from "@/lib/utils";
import { getAcademyContext } from "@/lib/store-context";
import { buildSiteMetadata } from "@/lib/seo/build-metadata";
import { getPlatformPageSeo } from "@/lib/seo/platform-pages";
import { getSeoRequestContext } from "@/lib/seo/request-context";

export async function generateMetadata(): Promise<Metadata> {
  const ctx = await getSeoRequestContext();
  if (ctx.isPlatform) {
    const pageSeo = getPlatformPageSeo("/articles");
    return buildSiteMetadata({
      title: pageSeo?.title,
      description: pageSeo?.description,
      ctx,
    });
  }
  return buildSiteMetadata({
    title: "Articles",
    description: "Insights and stories from this academy.",
    ctx,
  });
}

export default async function ArticlesPage() {
  const storeContext = await getAcademyContext();
  const seoCtx = await getSeoRequestContext();
  const buildPath = (path: string) =>
    buildAcademyPath(storeContext.isSubdomain ? null : storeContext.slug, path);
  const articles = await getArticles().catch(() => []);
  const pageSeo = seoCtx.isPlatform ? getPlatformPageSeo("/articles") : null;
  const heading = pageSeo?.navLabel ?? "Insights & stories";
  const intro =
    pageSeo?.description ??
    "Deep dives on emerging skills, career growth strategies, and behind-the-scenes stories from mentors and students.";

  if (!articles.length) {
    return (
      <>
        {seoCtx.isPlatform ? <PlatformOrganizationJsonLd /> : null}
        <EmptyState
          title="Learning insights coming soon"
          description="Our editorial team is crafting new stories, guides, and community spotlights. Check back shortly."
        />
      </>
    );
  }

  return (
    <>
      {seoCtx.isPlatform ? <PlatformOrganizationJsonLd /> : null}
    <div className="space-y-6">
      <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: 'var(--theme-foreground)' }}>
          {heading}
        </h1>
        <p className="max-w-2xl text-base leading-7" style={{ color: 'var(--theme-muted)' }}>
          {intro}
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {articles.map((article, index) => {
          const imageUrl = resolveAssetUrl(article.featured_image?.publicUrl) ?? "/file.svg";
          const publishedDate = article.published_at
            ? new Date(article.published_at).toLocaleDateString()
            : "";
          return (
            <article
              key={article.id}
              className="group flex flex-col overflow-hidden rounded-2xl border animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{
                animationDelay: `${index * 100}ms`,
                backgroundColor: 'var(--theme-card-bg)',
                borderColor: 'var(--theme-border-color)',
              }}
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src={imageUrl}
                  alt={article.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-center justify-between text-xs uppercase tracking-wide opacity-55" style={{ color: 'var(--theme-foreground)' }}>
                  <span>{publishedDate || "Just published"}</span>
                  {article.author ? <span>{article.author.display_name}</span> : null}
                </div>
                <h2 className="text-xl font-semibold leading-7 transition-colors group-hover:text-[var(--theme-primary)]" style={{ color: 'var(--theme-foreground)' }}>
                  {article.title}
                </h2>
                <p className="text-sm leading-6 text-muted opacity-70">
                  {truncate(article.excerpt ?? article.description ?? "", 180)}
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
    </div>
    </>
  );
}

