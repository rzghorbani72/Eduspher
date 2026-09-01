/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "@/components/ui/link";

import { EmptyState } from "@/components/ui/empty-state";
import { PlatformOrganizationJsonLd } from "@/components/seo/platform-organization-json-ld";
import { getBlogArticles, getCurrentAcademy } from "@/lib/api/server";
import { buildAcademyPath, resolveAssetUrl, truncate } from "@/lib/utils";
import { getAcademyContext } from "@/lib/store-context";
import { getAcademyLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/server-translations";
import { buildSiteMetadata } from "@/lib/seo/build-metadata";
import { getPlatformPageSeo } from "@/lib/seo/platform-pages";
import { getSeoRequestContext } from "@/lib/seo/request-context";

export async function generateMetadata(): Promise<Metadata> {
  const ctx = await getSeoRequestContext();
  if (ctx.isPlatform) {
    const pageSeo = getPlatformPageSeo("/blog");
    return buildSiteMetadata({
      title: pageSeo?.title,
      description: pageSeo?.description,
      ctx,
    });
  }
  return buildSiteMetadata({
    title: "Blog",
    description: "Articles and stories from this academy.",
    ctx,
  });
}

export default async function BlogPage() {
  const [storeContext, seoCtx] = await Promise.all([
    getAcademyContext(),
    getSeoRequestContext(),
  ]);
  const buildPath = (path: string) =>
    buildAcademyPath(storeContext.isSubdomain ? null : storeContext.slug, path);

  // On the platform host there is no academy, and the scope must stay empty —
  // passing a stale slug would show one academy's blog on mentoma.ir.
  const academySlug = seoCtx.isPlatform ? null : storeContext.slug;
  const articles = await getBlogArticles(academySlug).catch(() => []);

  const currentAcademy = seoCtx.isPlatform
    ? null
    : await getCurrentAcademy().catch(() => null);
  const language = getAcademyLanguage(
    currentAcademy?.language || null,
    currentAcademy?.country_code || null,
  );
  const translate = (key: string) => t(key, language);

  const pageSeo = seoCtx.isPlatform ? getPlatformPageSeo("/blog") : null;
  const heading = pageSeo?.navLabel ?? translate("articles.blogHeading");
  const intro = pageSeo?.description ?? translate("articles.blogIntro");

  if (!articles.length) {
    return (
      <>
        {seoCtx.isPlatform ? <PlatformOrganizationJsonLd /> : null}
        <EmptyState
          title={translate("articles.emptyTitle")}
          description={translate("articles.emptyDescription")}
        />
      </>
    );
  }

  return (
    <>
      {seoCtx.isPlatform ? <PlatformOrganizationJsonLd /> : null}
      <div className="space-y-6">
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1
            className="text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ color: "var(--theme-foreground)" }}
          >
            {heading}
          </h1>
          <p
            className="max-w-2xl text-base leading-7"
            style={{ color: "var(--theme-muted)" }}
          >
            {intro}
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {articles.map((article, index) => {
            const imageUrl =
              resolveAssetUrl(article.featured_image?.publicUrl) ?? "/file.svg";
            const publishedDate = article.published_at
              ? new Date(article.published_at).toLocaleDateString()
              : "";
            return (
              <article
                key={article.id}
                className="group flex flex-col overflow-hidden rounded-2xl border animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{
                  animationDelay: `${index * 100}ms`,
                  backgroundColor: "var(--theme-card-bg)",
                  borderColor: "var(--theme-border-color)",
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
                  <div
                    className="flex items-center justify-between text-xs uppercase tracking-wide opacity-55"
                    style={{ color: "var(--theme-foreground)" }}
                  >
                    <span>
                      {publishedDate || translate("articles.justPublished")}
                    </span>
                    {article.author ? (
                      <span>{article.author.display_name}</span>
                    ) : null}
                  </div>
                  <h2
                    className="text-xl font-semibold leading-7 transition-colors group-hover:text-[var(--theme-primary)]"
                    style={{ color: "var(--theme-foreground)" }}
                  >
                    {article.title}
                  </h2>
                  <p className="text-sm leading-6 text-muted opacity-70">
                    {truncate(
                      article.excerpt ?? article.description ?? "",
                      180,
                    )}
                  </p>
                  <Link
                    href={buildPath(`/blog/${article.slug}`)}
                    className="mt-auto inline-flex items-center text-sm font-semibold text-[var(--theme-primary)] transition-all hover:translate-x-1 hover:underline"
                  >
                    {translate("articles.readArticle")} →
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
