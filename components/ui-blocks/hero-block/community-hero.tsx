import Link from '@/components/ui/link';
import { Button } from '@/components/ui/button';
import { buildAcademyPath, cn } from '@/lib/utils';
import { HeroMedia } from './hero-media';
import { HeroBlockProps } from './shared';

// ── Community (Circle-inspired, dark) ─────────────────────────────────────────

export function CommunityHero({ id, config, storeContext }: HeroBlockProps) {
  const title = config?.title || 'جایی که جامعه شما زنده می‌شود';
  const subtitle = config?.subtitle || 'فضاهایی برای ارتباط، یادگیری و رشد مخاطبانتان بسازید';
  const ctaText = config?.ctaText || 'جامعه خود را بسازید';
  const ctaSecondary = config?.ctaSecondary || 'نمونه‌ها را ببین';
  const hasIllustration = !!(config?.illustration || config?.illustrationPreset);

  return (
    <section
      id={id || 'hero'}
      className="relative overflow-hidden bg-(--theme-background) py-24 sm:py-32"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 right-0 h-96 w-96 rounded-full bg-(--theme-primary)/30 blur-3xl" />
        <div className="absolute top-40 -left-20 h-72 w-72 rounded-full bg-(--theme-secondary)/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div
          className={cn(
            'grid grid-cols-1 items-center gap-12',
            hasIllustration && 'lg:grid-cols-2',
          )}
        >
          {/* Text side */}
          <div>
            <div
              data-scroll-animate="fadeIn"
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-(--theme-border-color) bg-(--theme-primary-subtle) px-4 py-1.5 text-sm font-medium text-(--theme-primary) backdrop-blur-sm"
            >
              <span className="h-2 w-2 animate-pulse rounded-full bg-(--theme-primary)" />
              در نسخه بتا عمومی
            </div>

            <h1
              data-scroll-animate="slideLeft"
              data-scroll-delay="0.1"
              className="text-4xl leading-tight font-bold tracking-tight text-(--theme-foreground) sm:text-5xl lg:text-6xl"
            >
              {title}
            </h1>
            <p
              data-scroll-animate="slideLeft"
              data-scroll-delay="0.2"
              className="mt-6 text-lg leading-relaxed text-(--theme-foreground)/65"
            >
              {subtitle}
            </p>

            <div
              data-scroll-animate="slideLeft"
              data-scroll-delay="0.3"
              className="mt-10 flex flex-wrap gap-4"
            >
              <Button
                size="lg"
                asChild
                className="rounded-xl bg-(--theme-primary) px-8 font-semibold text-(--theme-on-primary) shadow-xl hover:opacity-90"
              >
                <Link
                  href={buildAcademyPath(
                    storeContext?.isSubdomain ? null : (storeContext?.slug ?? null),
                    '/courses',
                  )}
                >
                  {ctaText}
                </Link>
              </Button>
              {ctaSecondary && (
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="rounded-xl border-(--theme-border-strong) text-(--theme-foreground)/70 hover:bg-(--theme-surface-alt) hover:text-(--theme-foreground)"
                >
                  <Link
                    href={buildAcademyPath(
                      storeContext?.isSubdomain ? null : (storeContext?.slug ?? null),
                      '/about',
                    )}
                  >
                    {ctaSecondary}
                  </Link>
                </Button>
              )}
            </div>

            <div
              data-scroll-animate="fadeIn"
              data-scroll-delay="0.45"
              className="mt-10 flex items-center gap-3"
            >
              <div className="flex -space-x-3">
                {['🧑‍💼', '👩‍🎓', '👨‍🔬', '👩‍🎨', '🧑‍🏫'].map((e, i) => (
                  <div
                    key={i}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-(--theme-card-bg) text-lg ring-2 ring-(--theme-background)"
                  >
                    {e}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {'★★★★★'.split('').map((s, i) => (
                    <span key={i} className="text-xs text-(--theme-accent)">
                      {s}
                    </span>
                  ))}
                </div>
                <p className="mt-0.5 text-xs text-(--theme-foreground)/55">۱۰٬۰۰۰+ عضو فعال</p>
              </div>
            </div>
          </div>

          {hasIllustration && (
            <div data-scroll-animate="slideRight" className="flex justify-center lg:justify-end">
              <HeroMedia config={config} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
