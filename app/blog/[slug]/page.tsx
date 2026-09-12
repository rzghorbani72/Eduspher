/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "@/components/ui/link";
import { notFound } from "next/navigation";

import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  getBlogArticleBySlug,
  getAcademyBySlug,
  getCurrentAcademy,
} from "@/lib/api/server";
import { getAcademyContext } from "@/lib/store-context";
import { buildAcademyPath, resolveAssetUrl, truncate } from "@/lib/utils";
import { getAcademyLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/server-translations";
import { SafeHtml } from "@/components/safe-html";
import { buildArticleJsonLd } from "@/lib/seo/article-json-ld";
import { buildBreadcrumbJsonLd } from "@/lib/seo/course-json-ld";
import { buildSiteMetadata } from "@/lib/seo/build-metadata";
import { buildAbsoluteUrl, seoDomains } from "@/lib/seo/domains";
import { getSeoRequestContext } from "@/lib/seo/request-context";
import { sizedImageUrl } from "@/lib/images/sized-image-url";
import { serializeJsonLd } from "@/lib/seo/json-ld-script";

type PageParams = Promise<{
  slug: string;
}>;

/** Platform posts have no academy; an academy's own posts are read in its scope. */
async function resolveAcademySlug(): Promise<string | null> {
  const [storeContext, ctx] = await Promise.all([
    getAcademyContext(),
    getSeoRequestContext(),
  ]);
  return ctx.isPlatform ? null : storeContext.slug;
}

export async function generateMetadata({
  params,
}: {
  params: PageParams;
}): Promise<Metadata> {
  const { slug } = await params;
  const academySlug = await resolveAcademySlug();
  const [article, ctx] = await Promise.all([
    getBlogArticleBySlug(slug, academySlug).catch(() => null),
    getSeoRequestContext(),
  ]);
  if (!article)
    return { title: "404", robots: { index: false, follow: false } };

  const description = truncate(
    article.meta_description ||
      article.excerpt ||
      article.description ||
      article.title,
    160,
  );
  const shareImage = resolveAssetUrl(article.featured_image?.publicUrl);
  const meta = await buildSiteMetadata({
    title: article.meta_title || article.title,
    description,
    ctx,
  });

  return {
    ...meta,
    openGraph: {
      ...meta.openGraph,
      type: "article",
      ...(shareImage ? { images: [{ url: shareImage }] } : {}),
    },
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: PageParams;
}) {
  const { slug } = await params;
  const [storeContext, ctx] = await Promise.all([
    getAcademyContext(),
    getSeoRequestContext(),
  ]);
  const academySlug = ctx.isPlatform ? null : storeContext.slug;
  const article = await getBlogArticleBySlug(slug, academySlug).catch(
    () => null,
  );

  const buildPath = (path: string) =>
    buildAcademyPath(storeContext.isSubdomain ? null : storeContext.slug, path);

  if (!article) {
    return notFound();
  }

  let currentAcademy = ctx.isPlatform
    ? null
    : await getCurrentAcademy().catch(() => null);
  if (!currentAcademy && !ctx.isPlatform && storeContext.slug) {
    currentAcademy = await getAcademyBySlug(storeContext.slug).catch(
      () => null,
    );
  }
  const language = getAcademyLanguage(
    currentAcademy?.language || null,
    currentAcademy?.country_code || null,
  );
  const translate = (key: string) => t(key, language);
  const siteName = currentAcademy?.name ?? seoDomains.siteName;

  const imageUrl =
    resolveAssetUrl(article.featured_image?.publicUrl) ?? "/globe.svg";
  const publishedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString()
    : "";

  const articleLd = buildArticleJsonLd({
    article,
    canonicalUrl: ctx.canonicalUrl,
    siteName,
    imageUrl: resolveAssetUrl(article.featured_image?.publicUrl),
  });
  const breadcrumbLd = buildBreadcrumbJsonLd([
    { name: siteName, url: buildAbsoluteUrl(ctx.host, "/") },
    {
      name: translate("articles.blogTitle"),
      url: buildAbsoluteUrl(ctx.host, buildPath("/blog")),
    },
    { name: article.title, url: ctx.canonicalUrl },
  ]);

  return (
    <article className="space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbLd) }}
      />
      <header className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Badge variant="soft" className="w-fit">
          {article.category?.name ?? translate("articles.learningInsights")}
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          {article.title}
        </h1>
        <p className="text-sm text-muted opacity-70">
          {publishedDate}
          {article.author ? ` • ${article.author.display_name}` : ""}
        </p>
      </header>
      <div className="overflow-hidden rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-lg ">
          { }
          <img
            src={sizedImageUrl(imageUrl, 1080) ?? imageUrl}
            alt={article.title}
            loading="lazy"
            decoding="async"
            className="h-auto w-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
      </div>
      {article.content ? (
        <div className="prose prose-lg max-w-none text-slate-700 prose-headings:text-slate-900 dark:prose-invert dark:text-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <SafeHtml html={article.content} />
        </div>
      ) : article.description ? (
        <p className="text-base leading-7 text-muted animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          {article.description}
        </p>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <EmptyState
            title={translate("articles.fullArticleComingSoon")}
            description={translate("articles.fullArticleDescription")}
          />
        </div>
      )}
      <footer className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600 transition-all hover:shadow-md    animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
        {translate("articles.wantGuidance")}{" "}
        <Link
          className="font-semibold text-[var(--theme-primary)] transition-all hover:underline hover:translate-x-0.5"
          href={buildPath("/contact")}
        >
          {translate("articles.talkToAdvisors")}
        </Link>
        .
      </footer>
    </article>
  );
}
