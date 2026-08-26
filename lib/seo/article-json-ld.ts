import type { ArticleSummary } from "@/lib/api/types";

type ArticleJsonLdInput = {
  article: ArticleSummary;
  canonicalUrl: string;
  siteName: string;
  imageUrl: string | null;
};

export function buildArticleJsonLd({
  article,
  canonicalUrl,
  siteName,
  imageUrl,
}: ArticleJsonLdInput): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description:
      article.meta_description ||
      article.excerpt ||
      article.description ||
      article.title,
    url: canonicalUrl,
    mainEntityOfPage: canonicalUrl,
    datePublished: article.published_at ?? undefined,
    author: article.author?.display_name
      ? { "@type": "Person", name: article.author.display_name }
      : { "@type": "Organization", name: siteName },
    publisher: {
      "@type": "Organization",
      name: siteName,
    },
    ...(imageUrl ? { image: [imageUrl] } : {}),
    ...(article.category?.name
      ? { articleSection: article.category.name }
      : {}),
  };
}
