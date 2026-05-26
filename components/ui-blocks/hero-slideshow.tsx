'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from '@/components/ui/link';
import { Button } from '@/components/ui/button';
import { buildAcademyPath } from '@/lib/utils';
import { cn } from '@/lib/utils';

export interface SlideConfig {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaSecondary?: string;
  backgroundImage?: string;
  /** Tailwind gradient classes, e.g. "from-violet-600 via-purple-600 to-indigo-700" */
  gradient?: string;
}

interface HeroSlideshowProps {
  slides: SlideConfig[];
  alignment?: 'left' | 'center' | 'right';
  height?: 'small' | 'medium' | 'large';
  showArrows?: boolean;
  showDots?: boolean;
  autoplay?: boolean;
  interval?: number;
  storeContext?: { id: number | null; slug: string | null; name: string | null };
  /** Override text/button colours when needed (e.g. dark slide) */
  dark?: boolean;
  className?: string;
}

const DEFAULT_GRADIENTS = [
  'from-indigo-600 via-blue-600 to-cyan-600',
  'from-violet-600 via-purple-600 to-pink-600',
  'from-rose-600 via-pink-500 to-orange-500',
];

const heightCls = { small: 'min-h-[320px]', medium: 'min-h-[460px]', large: 'min-h-[580px]' };
const alignCls  = { left: 'text-left items-start', center: 'text-center items-center mx-auto', right: 'text-right items-end' };

export function HeroSlideshow({
  slides,
  alignment = 'center',
  height = 'large',
  showArrows = true,
  showDots = true,
  autoplay = true,
  interval = 5000,
  storeContext,
  dark = false,
  className,
}: HeroSlideshowProps) {
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const count = slides.length;

  const goTo = useCallback((idx: number) => {
    if (transitioning || idx === current) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurrent(idx);
      setTransitioning(false);
    }, 400);
  }, [transitioning, current]);

  const next = useCallback(() => goTo((current + 1) % count), [goTo, current, count]);
  const prev = useCallback(() => goTo((current - 1 + count) % count), [goTo, current, count]);

  useEffect(() => {
    if (!autoplay || count <= 1) return;
    const id = setInterval(next, interval);
    return () => clearInterval(id);
  }, [autoplay, count, interval, next]);

  const slide = slides[current];
  const gradient = slide.gradient ?? DEFAULT_GRADIENTS[current % DEFAULT_GRADIENTS.length];
  const hasBg = !!slide.backgroundImage;

  const textColor = dark || hasBg ? 'text-white' : 'text-gray-900';
  const subColor  = dark || hasBg ? 'text-white/70' : 'text-gray-600';

  return (
    <div className={cn('relative overflow-hidden', heightCls[height], className)}>
      {/* Background layer */}
      <div
        className={cn(
          'absolute inset-0 transition-opacity duration-700 ease-in-out',
          hasBg ? 'bg-cover bg-center' : `bg-gradient-to-br ${gradient}`,
          transitioning ? 'opacity-0' : 'opacity-100',
        )}
        style={hasBg ? { backgroundImage: `url(${slide.backgroundImage})` } : undefined}
      />
      {hasBg && <div className="absolute inset-0 bg-black/45" />}

      {/* Decorative blobs (non-image slides) */}
      {!hasBg && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-3xl" />
        </div>
      )}

      {/* Slide content */}
      <div
        className={cn(
          'relative mx-auto max-w-5xl px-6 pt-20 pb-16 flex flex-col justify-center h-full transition-all duration-500',
          transitioning ? 'opacity-0 translate-y-3' : 'opacity-100 translate-y-0',
        )}
      >
        <div className={cn('flex flex-col gap-4 max-w-2xl', alignCls[alignment])}>
          {/* Eyebrow */}
          {!transitioning && (
            <span
              data-scroll-animate="fadeIn"
              className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white/90 border border-white/25"
            >
              ✦ {storeContext?.name ?? 'Your Academy'}
            </span>
          )}

          <h1
            data-scroll-animate="fadeIn"
            data-scroll-delay="0.1"
            className={cn('text-4xl font-bold tracking-tight leading-tight sm:text-5xl', textColor)}
          >
            {slide.title ?? 'Transform Your Skills'}
          </h1>

          {slide.subtitle && (
            <p
              data-scroll-animate="fadeIn"
              data-scroll-delay="0.2"
              className={cn('text-lg leading-relaxed max-w-xl', subColor)}
            >
              {slide.subtitle}
            </p>
          )}

          {(slide.ctaText || slide.ctaSecondary) && (
            <div
              data-scroll-animate="slideLeft"
              data-scroll-delay="0.3"
              className={cn('flex flex-wrap gap-3 mt-2', alignment === 'center' ? 'justify-center' : 'justify-start')}
            >
              {slide.ctaText && (
                <Button
                  size="lg"
                  className="bg-white text-gray-900 hover:bg-gray-100 font-semibold shadow-lg"
                  asChild
                >
                  <Link href={buildAcademyPath(storeContext?.slug ?? null, '/courses')}>
                    {slide.ctaText}
                  </Link>
                </Button>
              )}
              {slide.ctaSecondary && (
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/40 text-white hover:bg-white/10 backdrop-blur-sm"
                  asChild
                >
                  <Link href={buildAcademyPath(storeContext?.slug ?? null, '/about')}>
                    {slide.ctaSecondary}
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Arrow controls */}
      {showArrows && count > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50 focus:outline-none"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50 focus:outline-none"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {showDots && count > 1 && (
        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                'rounded-full transition-all duration-300 focus:outline-none',
                i === current
                  ? 'w-6 h-2 bg-white'
                  : 'w-2 h-2 bg-white/40 hover:bg-white/70',
              )}
            />
          ))}
        </div>
      )}

      {/* Progress bar */}
      {autoplay && count > 1 && (
        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-white/10">
          <div
            key={current}
            className="h-full bg-white/50 rounded-full"
            style={{
              animation: `slide-progress ${interval}ms linear`,
              animationFillMode: 'forwards',
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes slide-progress {
          from { width: 0% }
          to   { width: 100% }
        }
      `}</style>
    </div>
  );
}
