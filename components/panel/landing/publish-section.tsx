'use client';

import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import { Container } from './landing-container';
import { LANDING } from './landing.messages';
import { LandingShot } from './landing-shot';
import { ProductFrame } from './product-frame';
import { SectionHeading } from './section-heading';
import { StartFreeLink } from './quick-signup/start-free-link';

const VIEWS = LANDING.publish.views;
const CYCLE_MS = 10000;

type Side = 'student' | 'owner';

type Props = {
  registerUrl: string;
  pricingUrl: string;
};

/** One shot at a time: the student view and the manager view alternate. */
export function PublishSection({ registerUrl, pricingUrl }: Props) {
  const [side, setSide] = useState<Side>('student');
  const [cycle, setCycle] = useState(0);
  const [running, setRunning] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = panelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(([entry]) => setRunning(entry.isIntersecting), {
      threshold: 0,
      rootMargin: '-15% 0px -15% 0px',
    });
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  // Restarts on every `cycle` bump (auto flip or click), so the CSS bar and
  // this timer always begin the same 10s window together.
  useEffect(() => {
    if (!running) return;
    const timer = setTimeout(() => {
      setSide((value) => (value === 'student' ? 'owner' : 'student'));
      setCycle((value) => value + 1);
    }, CYCLE_MS);
    return () => clearTimeout(timer);
  }, [running, cycle]);

  const selectSide = (next: Side) => {
    setSide(next);
    setCycle((value) => value + 1);
  };

  const active = VIEWS.find((view) => view.id === side) ?? VIEWS[0];

  return (
    <section id="publish" data-lp-reveal className="bg-lp-surface scroll-mt-32 py-20 lg:py-28">
      <Container>
        <SectionHeading title={LANDING.publish.title} subtitle={LANDING.publish.subtitle} />

        <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <StartFreeLink
            href={registerUrl}
            className="rounded-lp bg-lp-mint text-lp-ink shadow-lp-mint flex h-14 items-center justify-center px-8 text-[16px] font-bold transition-transform hover:-translate-y-0.5"
          >
            {LANDING.publish.ctaPrimary}
          </StartFreeLink>
          <a
            href={pricingUrl}
            className="rounded-lp border-lp-line-2 text-lp-ink hover:border-lp-ink/25 flex h-14 items-center justify-center border bg-white px-8 text-[15px] font-semibold transition-colors"
          >
            {LANDING.publish.ctaSecondary}
          </a>
        </div>

        <div
          ref={panelRef}
          className="border-lp-line bg-lp-surface-2 mt-16 overflow-hidden rounded-[28px] border"
        >
          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-2 lg:gap-12">
            {VIEWS.map((view) => {
              const isActive = view.id === side;
              return (
                <button
                  key={view.id}
                  type="button"
                  onClick={() => selectSide(view.id as Side)}
                  aria-pressed={isActive}
                  aria-controls="publish-panel-image"
                  className={cn(
                    'flex flex-col gap-2.5 rounded-2xl border p-5 text-start transition-colors',
                    isActive
                      ? 'border-lp-mint/45 bg-white'
                      : 'border-transparent bg-transparent hover:bg-white/60',
                  )}
                >
                  <span className="text-lp-ink flex items-center gap-2.5 text-[17px] font-bold">
                    <span
                      aria-hidden="true"
                      className={cn(
                        'h-2 w-2 shrink-0 rounded-full transition-colors',
                        isActive ? 'bg-lp-mint' : 'bg-lp-line',
                      )}
                    />
                    {view.title}
                  </span>
                  <span className="text-lp-muted text-[14.5px] leading-[1.85]">{view.body}</span>
                  <span className="bg-lp-line/70 mt-2 h-1 w-full overflow-hidden rounded-full">
                    <span
                      key={`${view.id}-${cycle}`}
                      className={cn(
                        'bg-lp-mint block h-full rounded-full',
                        isActive && running && 'lp-progress',
                      )}
                      style={
                        isActive && running
                          ? { animationDuration: `${CYCLE_MS}ms` }
                          : { width: '0%' }
                      }
                    />
                  </span>
                </button>
              );
            })}
          </div>

          <div className="px-6 pb-6 sm:px-8 sm:pb-8">
            <ProductFrame
              id="publish-panel-image"
              aria-live="polite"
              className="mx-auto w-full max-w-4xl"
            >
              <div className="relative aspect-1440/768 w-full">
                <LandingShot
                  key={active.id}
                  src={active.image}
                  alt={active.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 896px"
                  className="lp-fade-in object-cover object-top"
                />
              </div>
            </ProductFrame>
          </div>
        </div>
      </Container>
    </section>
  );
}
