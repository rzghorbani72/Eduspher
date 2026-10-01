import Link from '@/components/ui/link';
import { Button } from '@/components/ui/button';
import { buildAcademyPath } from '@/lib/utils';
import { DarkProgrammerShowcase } from './dark-programmer-showcase';
import { HeroMedia } from './hero-media';
import { HeroBlockProps } from './shared';

// ── Dark Programmer / Rocket ──────────────────────────────────────────────────

export function DarkProgrammerHero({ id, config, storeContext }: HeroBlockProps) {
  const title = config?.title || 'کدنویسی را جدی بگیر';
  const subtitle = config?.subtitle || 'بیش از ۵۰۰ دوره برنامه‌نویسی با ضمانت کیفیت';
  const ctaText = config?.ctaText || 'شروع یادگیری';
  const ctaSecondary = config?.ctaSecondary || 'مشاهده دوره‌ها';
  const hasIllustration = !!(config?.illustration || config?.illustrationPreset);

  return (
    <section
      id={id || 'hero'}
      className="relative overflow-hidden bg-(--theme-background) py-20 sm:py-28"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-20 h-96 w-96 rounded-full bg-(--theme-primary)/20 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-(--theme-accent)/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <div
              data-scroll-animate="fadeIn"
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-(--theme-primary)/40 bg-(--theme-primary-subtle) px-4 py-1.5 text-sm font-medium text-(--theme-primary)"
            >
              <span className="h-2 w-2 animate-pulse rounded-full bg-(--theme-primary)" />
              ۵۰۰+ دوره تخصصی
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
              className="mt-5 text-lg leading-relaxed text-(--theme-foreground)/65"
            >
              {subtitle}
            </p>
            <div
              data-scroll-animate="slideLeft"
              data-scroll-delay="0.3"
              className="mt-8 flex flex-wrap gap-4"
            >
              <Button
                size="lg"
                asChild
                className="rounded-full bg-(--theme-primary) px-8 font-bold text-(--theme-on-primary) shadow-xl hover:opacity-90"
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
                  className="rounded-full border-(--theme-border-strong) text-(--theme-foreground)/70 hover:bg-(--theme-surface-alt)"
                >
                  <Link
                    href={buildAcademyPath(
                      storeContext?.isSubdomain ? null : (storeContext?.slug ?? null),
                      '/courses',
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
              className="mt-8 flex items-center gap-4"
            >
              <div className="flex -space-x-3 rtl:space-x-reverse">
                {['👨‍💻', '👩‍💻', '🧑‍🎓', '👩‍🔬'].map((a, i) => (
                  <span
                    key={i}
                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-(--theme-background) bg-(--theme-card-bg) text-base"
                  >
                    {a}
                  </span>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {'★★★★★'.split('').map((s, i) => (
                    <span key={i} className="text-sm text-(--theme-accent)">
                      {s}
                    </span>
                  ))}
                  <span className="ms-1 text-sm font-semibold text-(--theme-foreground)">۴.۸</span>
                </div>
                <p className="mt-0.5 text-xs text-(--theme-foreground)/55">
                  ۱۲۰,۰۰۰ دانش‌آموز در سراسر ایران
                </p>
              </div>
            </div>
          </div>
          {hasIllustration ? (
            <div data-scroll-animate="slideRight" className="flex justify-center lg:justify-end">
              <HeroMedia config={config} />
            </div>
          ) : (
            <DarkProgrammerShowcase storeContext={storeContext} />
          )}
        </div>
      </div>
    </section>
  );
}
