/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";

import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { getArticleById, getStoreBySlug, getCurrentStore } from "@/lib/api/server";
import { getStoreContext } from "@/lib/store-context";
import { buildStorePath, resolveAssetUrl } from "@/lib/utils";
import { getStoreLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/server-translations";
import { sanitizeRichText } from "@/lib/sanitize";

type PageParams = Promise<{
  id: string;
}>;

export default async function ArticleDetailPage({ params }: { params: PageParams }) {
  const { id } = await params;
  const [article, storeContext] = await Promise.all([
    getArticleById(id).catch(() => null),
    getStoreContext(),
  ]);
  const buildPath = (path: string) => buildStorePath(storeContext.slug, path);

  if (!article) {
    return notFound();
  }

  // Get store language for translations
  let currentStore = await getCurrentStore().catch(() => null);
  if (!currentStore && storeContext.slug) {
    currentStore = await getStoreBySlug(storeContext.slug).catch(() => null);
  }
  const language = getStoreLanguage(currentStore?.language || null, currentStore?.country_code || null);
  const translate = (key: string) => t(key, language);

  const imageUrl = resolveAssetUrl(article.featured_image?.url) ?? "/globe.svg";
  const publishedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString()
    : "";

  return (
    <article className="space-y-6">
      <header className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Badge variant="soft" className="w-fit">
          {article.category?.name ?? translate("articles.learningInsights")}
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          {article.title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {publishedDate}
          {article.author ? ` • ${article.author.display_name}` : ""}
        </p>
      </header>
      <div className="overflow-hidden rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-lg dark:border-slate-800">
          <img
            src={imageUrl}
            alt={article.title}
            className="h-auto w-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
      </div>
      {article.content ? (
        <div className="prose prose-lg max-w-none text-slate-700 prose-headings:text-slate-900 dark:prose-invert dark:text-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <div dangerouslySetInnerHTML={{ __html: sanitizeRichText(article.content) }} />
        </div>
      ) : article.description ? (
        <p className="text-base leading-7 text-slate-600 dark:text-slate-300 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
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
      <footer className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600 transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
        {translate("articles.wantGuidance")}{" "}
        <Link className="font-semibold text-[var(--theme-primary)] transition-all hover:underline hover:translate-x-0.5" href={buildPath("/contact")}>
          {translate("articles.talkToAdvisors")}
        </Link>
        .
      </footer>
    </article>
  );
}

