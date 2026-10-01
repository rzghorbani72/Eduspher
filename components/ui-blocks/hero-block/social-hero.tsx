import Link from '@/components/ui/link';
import { Button } from '@/components/ui/button';
import { buildAcademyPath, cn } from '@/lib/utils';
import { HeroMedia } from './hero-media';
import { HeroBlockProps } from './shared';

// ── Social / Stan-inspired ─────────────────────────────────────────────────────

export function SocialHero({ id, config, storeContext }: HeroBlockProps) {
  const title = config?.title || 'فروشگاه جامع مدرسان محتوا';
  const subtitle = config?.subtitle || 'به بیش از ۱۰۰٬۰۰۰ صاحب کسب‌وکار موفق بپیوندید';
  const ctaText = config?.ctaText || 'شروع رایگان';
  const hasIllustration = !!(config?.illustration || config?.illustrationPreset);

  return (
    <section
      id={id || 'hero'}
      className="relative overflow-hidden py-20 text-(--theme-on-primary) sm:py-28"
      style={{
        background:
          'linear-gradient(135deg, var(--theme-primary), var(--theme-secondary) 60%, color-mix(in srgb, var(--theme-secondary) 60%, var(--theme-accent)))',
      }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-10 left-1/4 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute right-1/4 bottom-10 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div
          className={cn(
            'grid grid-cols-1 items-center gap-10',
            hasIllustration && 'lg:grid-cols-2',
          )}
        >
          <div>
            <h1
              data-scroll-animate="slideLeft"
              className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
            >
              {title}
            </h1>
            <p
              data-scroll-animate="slideLeft"
              data-scroll-delay="0.15"
              className="mt-5 text-lg leading-relaxed opacity-80"
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
                className="rounded-full bg-(--theme-accent) px-8 font-semibold text-(--theme-on-accent) shadow-xl hover:opacity-90"
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
