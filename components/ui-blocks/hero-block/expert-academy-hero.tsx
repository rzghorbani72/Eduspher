import Link from '@/components/ui/link';
import { Button } from '@/components/ui/button';
import { buildAcademyPath, cn } from '@/lib/utils';
import { HeroMedia } from './hero-media';
import { HeroBlockProps } from './shared';

// ── Expert Academy (Kajabi-inspired) ─────────────────────────────────────────

export function ExpertAcademyHero({ id, config, storeContext }: HeroBlockProps) {
  const title = config?.title || 'تخصص خود را به شهرت تبدیل کنید';
  const subtitle = config?.subtitle || 'پلتفرم جامع برای ساخت، فروش و رشد کسب‌وکار تخصصی شما';
  const ctaText = config?.ctaText || 'شروع رایگان';
  const ctaSecondary = config?.ctaSecondary || 'نحوه کار را ببین';
  const hasIllustration = !!(config?.illustration || config?.illustrationPreset);

  return (
    <section
      id={id || 'hero'}
      className="relative overflow-hidden bg-(--theme-background) py-20 sm:py-28"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-(--theme-primary)/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-(--theme-accent)/15 blur-2xl" />
        <div className="absolute top-20 left-1/2 h-1 w-32 bg-linear-to-r from-transparent via-(--theme-primary)/40 to-transparent" />
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
              className="mb-4 inline-flex items-center gap-2 rounded-full bg-(--theme-primary-subtle) px-4 py-1.5 text-sm font-medium text-(--theme-primary)"
            >
              <span className="h-2 w-2 animate-pulse rounded-full bg-(--theme-primary)" />
              مورد اعتماد ۱۰۰هزار+ مدرس
            </div>
            <h1
              data-scroll-animate="slideLeft"
              data-scroll-delay="0.1"
              className="text-4xl leading-tight font-bold tracking-tight text-(--theme-foreground) sm:text-5xl md:text-6xl"
            >
              {title}
            </h1>
            <p
              data-scroll-animate="slideLeft"
              data-scroll-delay="0.2"
              className="mt-5 max-w-xl text-lg leading-relaxed text-(--theme-foreground)/70"
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
                className="bg-(--theme-primary) px-8 font-semibold text-(--theme-on-primary) shadow-xl hover:opacity-90"
              >
                <Link
                  href={buildAcademyPath(
                    storeContext?.isSubdomain ? null : (storeContext?.slug ?? null),
                    '/courses',
                  )}
                  className="text-(--theme-on-primary)"
                >
                  {ctaText}
                </Link>
              </Button>
              {ctaSecondary && (
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-(--theme-border-strong) font-semibold text-(--theme-foreground)/70 hover:bg-(--theme-surface-alt)"
                >
                  <Link
                    href={buildAcademyPath(
                      storeContext?.isSubdomain ? null : (storeContext?.slug ?? null),
                      '/pricing',
                    )}
                    className="text-(--theme-foreground)/70"
                  >
                    {ctaSecondary}
                  </Link>
                </Button>
              )}
            </div>

            {config?.showExpertPhotos !== false && (
              <div
                data-scroll-animate="fadeIn"
                data-scroll-delay="0.45"
                className="mt-10 flex items-center gap-3"
              >
                <div className="flex -space-x-3">
                  {['👩‍🏫', '👨‍💼', '👩‍🎤', '👨‍🎨', '👩‍⚕️'].map((e, i) => (
                    <div
                      key={i}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-(--theme-card-bg) text-lg shadow-md ring-2 ring-(--theme-background)"
                    >
                      {e}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex gap-0.5">
                    {'★★★★★'.split('').map((s, i) => (
                      <span key={i} className="text-sm text-(--theme-accent)">
                        {s}
                      </span>
                    ))}
                  </div>
                  <p className="mt-0.5 text-xs text-(--theme-foreground)/55">
                    به ۱۰۰هزار+ مدرس موفق بپیوندید
                  </p>
                </div>
              </div>
            )}
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
