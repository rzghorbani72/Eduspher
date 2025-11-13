/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

import { EmptyState } from "@/components/ui/empty-state";
import { getArticles } from "@/lib/api/server";
import { buildSchoolPath, resolveAssetUrl, truncate } from "@/lib/utils";
import { getSchoolContext } from "@/lib/school-context";

export default async function ArticlesPage() {
  const schoolContext = await getSchoolContext();
  const buildPath = (path: string) => buildSchoolPath(schoolContext.slug, path);
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
    <div className="space-y-12">
      <div className="space-y-3">
        <h1 className="text-4xl font-semibold text-slate-900 dark:text-white">Insights & stories</h1>
        <p className="max-w-2xl text-base text-slate-600 dark:text-slate-300">
          Deep dives on emerging skills, career growth strategies, and behind-the-scenes stories from
          mentors and students at EduSpher.
        </p>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        {articles.map((article) => {
          const imageUrl = resolveAssetUrl(article.featured_image?.url) ?? "/file.svg";
          const publishedDate = article.published_at
            ? new Date(article.published_at).toLocaleDateString()
            : "";
          return (
            <article
              key={article.id}
              className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src={imageUrl}
                  alt={article.title}
                  className="h-full w-full object-cover transition duration-500 hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col gap-4 p-6">
                <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  <span>{publishedDate || "Just published"}</span>
                  {article.author ? <span>{article.author.display_name}</span> : null}
                </div>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{article.title}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {truncate(article.excerpt ?? article.description ?? "", 180)}
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
    </div>
  );
}

