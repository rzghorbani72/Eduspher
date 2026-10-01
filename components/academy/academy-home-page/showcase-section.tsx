import Link from '@/components/ui/link';
import { resolveAssetUrl, truncate } from '@/lib/utils';
import { AppImage } from '@/components/ui/app-image';
import { ArticleSummary } from '@/lib/api/types';

export function ShowcaseSection({
  articles,
  buildPath,
  translate,
}: {
  articles: never[] | ArticleSummary[];
  buildPath: (path: string) => string;
  translate: (key: string) => string;
}) {
  return (
    <section
      className="py-28"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--theme-foreground) 3%, var(--theme-background))',
      }}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          data-gsap="fade-up"
          className="mb-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p
              className="mb-2 text-xs font-bold tracking-[0.18em] uppercase"
              style={{ color: 'var(--theme-primary)' }}
            >
              {translate('home.fromTheJournal')}
            </p>
            <h2
              className="text-3xl font-black tracking-tight sm:text-4xl"
              style={{
                color: 'var(--theme-foreground)',
                letterSpacing: '-0.025em',
              }}
            >
              {translate('home.readAllInsights')}
            </h2>
          </div>
          <Link
            href={buildPath('/blog')}
            className="group inline-flex shrink-0 items-center gap-1 text-sm font-bold transition-all duration-200"
            style={{ color: 'var(--theme-primary)' }}
          >
            {translate('home.readAllInsights')}
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </Link>
        </div>

        <div data-gsap="stagger" className="grid gap-8 md:grid-cols-3">
          {articles.slice(0, 3).map((article) => {
            const imageUrl = resolveAssetUrl(article.featured_image?.publicUrl) ?? '/globe.svg';
            const description = article.excerpt ?? article.description ?? '';
            const publishedDate = article.published_at
              ? new Date(article.published_at).toLocaleDateString()
              : '';

            return (
              <article
                key={article.id}
                className="group flex flex-col overflow-hidden rounded-3xl border shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                style={{
                  backgroundColor: 'var(--theme-card-bg)',
                  borderColor: 'var(--theme-border-color)',
                }}
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <AppImage
                    src={imageUrl}
                    alt={article.title}
                    preset="card"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                  {publishedDate && (
                    <div className="absolute bottom-4 left-4">
                      <span
                        className="rounded-full px-3 py-1 text-[11px] font-bold text-white backdrop-blur-sm"
                        style={{
                          backgroundColor:
                            'color-mix(in srgb, var(--theme-primary) 85%, transparent)',
                        }}
                      >
                        {publishedDate}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-3 p-7">
                  <h3
                    className="text-lg leading-snug font-bold transition-colors duration-200 group-hover:text-[var(--theme-primary)]"
                    style={{ color: 'var(--theme-foreground)' }}
                  >
                    {article.title}
                  </h3>
                  <p
                    className="flex-1 text-sm leading-relaxed opacity-55"
                    style={{ color: 'var(--theme-foreground)' }}
                  >
                    {truncate(description, 120)}
                  </p>
                  <Link
                    href={buildPath(`/blog/${article.slug}`)}
                    className="group/link inline-flex items-center gap-1.5 text-sm font-bold transition-all duration-200"
                    style={{ color: 'var(--theme-primary)' }}
                  >
                    {translate('home.readArticle')}
                    <span className="transition-transform duration-200 group-hover/link:translate-x-1">
                      →
                    </span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
