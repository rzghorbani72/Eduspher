import { RichHtml } from '@/components/rich-html';
import type { CSSProperties } from 'react';
import Link from '@/components/ui/link';
import { Button } from '@/components/ui/button';
import { buildAcademyPath, cn, resolveAssetUrl } from '@/lib/utils';
import { hexContrast } from '@/lib/theme-apply';
import { HeroSlideshow } from '../hero-slideshow';
import { HeroMedia } from './hero-media';
import { HeroOverlay } from './hero-overlay';
import { HeroBg, HeroBlockProps, speedToMs } from './shared';

export const heightCls = {
  small: 'py-8 sm:py-10',
  medium: 'py-12 sm:py-16',
  large: 'py-20 sm:py-28',
};

export const GRADIENT_BG =
  'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-secondary) 65%, color-mix(in srgb, var(--theme-secondary) 55%, var(--theme-accent)) 100%)';

// Resolves the Style-tab background config into one shape. Accepts both the new
// keys (bgType/bgColor/bgImage/overlayOpacity) and the legacy `backgroundImage`.
export function resolveHeroBg(config?: HeroBlockProps['config']): HeroBg {
  const url = resolveAssetUrl(config?.bgImage ?? config?.backgroundImage);
  const bgType = config?.bgType ?? (url ? 'image' : 'gradient');
  if (bgType === 'image' && url) {
    return { kind: 'image', url, overlay: config?.overlayOpacity ?? 40 };
  }
  if (bgType === 'solid' && config?.bgColor) {
    return { kind: 'solid', color: config.bgColor };
  }
  return { kind: 'gradient' };
}

export function heroBgStyle(bg: HeroBg): CSSProperties {
  if (bg.kind === 'image') return { backgroundImage: `url(${bg.url})` };
  if (bg.kind === 'solid') return { background: bg.color };
  return { background: GRADIENT_BG };
}

export function heroContentColorFor(bg: HeroBg): string {
  if (bg.kind === 'image') return '#ffffff';
  if (bg.kind === 'solid') return hexContrast(bg.color);
  return 'var(--theme-on-primary)';
}

// ── Default ───────────────────────────────────────────────────────────────────

export function DefaultHero({ id, config, storeContext }: HeroBlockProps) {
  const alignment = (config?.alignment ?? 'center') as 'left' | 'center' | 'right';
  const height = (config?.height ?? 'medium') as 'small' | 'medium' | 'large';
  const hasIllustration = !!(config?.illustration || config?.illustrationPreset);

  // If slides array provided, delegate entirely to the carousel
  if (config?.slides && config.slides.length > 1) {
    return (
      <section id={id || 'hero'}>
        <HeroSlideshow
          slides={config.slides}
          alignment={alignment}
          height={height}
          storeContext={storeContext}
          dark
          interval={speedToMs(config?.speed)}
        />
      </section>
    );
  }

  const title = config?.title || 'به آکادمی ما خوش آمدید';
  const subtitle = config?.subtitle || 'بهترین دوره‌های آموزشی را اینجا بیابید';
  const showCTA = config?.showCTA !== false;
  const ctaText = config?.ctaText || 'مرور دوره‌ها';
  const titleSz =
    height === 'small'
      ? 'text-3xl sm:text-4xl md:text-5xl'
      : height === 'medium'
        ? 'text-4xl sm:text-5xl md:text-6xl'
        : 'text-5xl sm:text-6xl md:text-7xl';
  const bg = resolveHeroBg(config);
  const isGradient = bg.kind === 'gradient';
  const bgStyle = heroBgStyle(bg);
  const heroContentColor = heroContentColorFor(bg);

  // Split layout when illustration is configured (uploaded or built-in default)
  if (hasIllustration) {
    return (
      <section
        id={id || 'hero'}
        className={cn(
          'relative overflow-hidden',
          heightCls[height],
          bg.kind === 'image' ? 'bg-cover bg-center' : '',
        )}
        style={{ ...bgStyle, color: heroContentColor }}
      >
        <HeroOverlay bg={bg} />
        {isGradient && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="animate-float-slow absolute -top-40 -right-40 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
            <div
              className="animate-float-slow absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-white/8 blur-3xl"
              style={{ animationDelay: '1s' }}
            />
          </div>
        )}
        <div className="relative mx-auto max-w-7xl px-6 pt-16 pb-4 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            {/* Text side */}
            <div className={cn(alignment === 'center' ? 'text-center' : 'text-left')}>
              <h1
                data-scroll-animate="fadeIn"
                data-editable="title"
                className={cn('font-bold tracking-tight', titleSz)}
              >
                {title}
              </h1>
              {subtitle && (
                <RichHtml
                  as="p"
                  html={subtitle}
                  data-scroll-animate="fadeIn"
                  data-scroll-delay="0.15"
                  data-editable="subtitle"
                  data-editable-kind="rich"
                  className="mt-4 text-lg leading-relaxed opacity-80 sm:text-xl"
                />
              )}
              {showCTA && (
                <div
                  data-scroll-animate="slideLeft"
                  data-scroll-delay="0.3"
                  className={cn(
                    'mt-8 flex flex-wrap gap-4',
                    alignment === 'center' ? 'justify-center' : 'justify-start',
                  )}
                >
                  <Button
                    size="lg"
                    asChild
                    className="font-semibold hover:opacity-90"
                    style={
                      isGradient
                        ? {
                            backgroundColor: 'var(--theme-background)',
                            color: 'var(--theme-primary)',
                            borderRadius: 'var(--theme-border-radius)',
                            boxShadow: 'var(--theme-shadow)',
                          }
                        : { color: heroContentColor }
                    }
                  >
                    <Link
                      href={buildAcademyPath(
                        storeContext?.isSubdomain ? null : (storeContext?.slug ?? null),
                        '/courses',
                      )}
                    >
                      <span data-editable="ctaText">{ctaText}</span>
                    </Link>
                  </Button>
                  {config?.ctaSecondary && (
                    <Button
                      size="lg"
                      variant="outline"
                      asChild
                      style={{
                        borderColor: 'color-mix(in srgb, var(--theme-on-primary) 40%, transparent)',
                        color: 'var(--theme-on-primary)',
                      }}
                    >
                      <Link
                        href={buildAcademyPath(
                          storeContext?.isSubdomain ? null : (storeContext?.slug ?? null),
                          '/about',
                        )}
                      >
                        <span data-editable="ctaSecondary">{config.ctaSecondary}</span>
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </div>
            {/* Illustration side */}
            <div data-scroll-animate="slideRight" className="flex justify-center lg:justify-end">
              <HeroMedia config={config} />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Centered layout (no illustration configured)
  const alignMap = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  };
  return (
    <section
      id={id || 'hero'}
      className={cn(
        'relative overflow-hidden',
        heightCls[height],
        bg.kind === 'image' ? 'bg-cover bg-center' : '',
      )}
      style={{ ...bgStyle, color: heroContentColor }}
    >
      <HeroOverlay bg={bg} />
      {isGradient && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-float-slow absolute -top-40 -right-40 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div
            className="animate-float-slow absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-white/8 blur-3xl"
            style={{ animationDelay: '1s' }}
          />
        </div>
      )}
      <div className="relative mx-auto mt-14 max-w-7xl px-6 lg:px-8">
        <div className={cn('mx-auto flex max-w-4xl flex-col', alignMap[alignment])}>
          <h1
            data-scroll-animate="fadeIn"
            data-editable="title"
            className={cn('font-bold tracking-tight', titleSz)}
          >
            {title}
          </h1>
          {subtitle && (
            <RichHtml
              as="p"
              html={subtitle}
              data-scroll-animate="fadeIn"
              data-scroll-delay="0.15"
              data-editable="subtitle"
              data-editable-kind="rich"
              className="mt-3 text-lg leading-relaxed opacity-80 sm:text-xl"
            />
          )}
          {showCTA && (
            <div
              data-scroll-animate="slideLeft"
              data-scroll-delay="0.3"
              className={cn(
                'mt-6 flex flex-wrap gap-4',
                alignment === 'center' ? 'justify-center' : 'justify-start',
              )}
            >
              <Button
                size="lg"
                asChild
                className="font-semibold hover:opacity-90"
                style={
                  isGradient
                    ? {
                        backgroundColor: 'var(--theme-background)',
                        color: 'var(--theme-primary)',
                        borderRadius: 'var(--theme-border-radius)',
                        boxShadow: 'var(--theme-shadow)',
                      }
                    : { color: heroContentColor }
                }
              >
                <Link
                  href={buildAcademyPath(
                    storeContext?.isSubdomain ? null : (storeContext?.slug ?? null),
                    '/courses',
                  )}
                >
                  <span data-editable="ctaText">{ctaText}</span>
                </Link>
              </Button>
              {config?.ctaSecondary && (
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  style={{
                    borderColor: 'color-mix(in srgb, var(--theme-on-primary) 40%, transparent)',
                    color: 'var(--theme-on-primary)',
                  }}
                >
                  <Link
                    href={buildAcademyPath(
                      storeContext?.isSubdomain ? null : (storeContext?.slug ?? null),
                      '/about',
                    )}
                  >
                    <span data-editable="ctaSecondary">{config.ctaSecondary}</span>
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
