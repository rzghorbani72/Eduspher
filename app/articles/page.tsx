/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

import { EmptyState } from "@/components/ui/empty-state";
import { getArticles } from "@/lib/api/server";
import { buildStorePath, resolveAssetUrl, truncate } from "@/lib/utils";
import { getStoreContext } from "@/lib/store-context";

export default async function ArticlesPage() {
  const storeContext = await getStoreContext();
  const buildPath = (path: string) => buildStorePath(storeContext.slug, path);
  const articles = await getArticles().catch(() => []);

  if (!articles.length) {
    return (
      <EmptyState
        title="Learning insights coming soon"
        description="Our editorial team is crafting new stories, guides, and community spotlights. Check back shortly."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          Insights & stories
        </h1>
        <p className="max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
          Deep dives on emerging skills, career growth strategies, and behind-the-scenes stories from
          mentors and students at EduSpher.
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
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--theme-primary)]/30 hover:shadow-xl dark:border-slate-800 dark:bg-slate-950 animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: `${index * 100}ms` }}
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
                <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  <span>{publishedDate || "Just published"}</span>
                  {article.author ? <span>{article.author.display_name}</span> : null}
                </div>
                <h2 className="text-xl font-semibold leading-7 text-slate-900 transition-colors group-hover:text-[var(--theme-primary)] dark:text-white dark:group-hover:text-[var(--theme-primary)]">
                  {article.title}
                </h2>
                <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
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
  );
}

