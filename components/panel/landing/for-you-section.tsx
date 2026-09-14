'use client';

import { useCallback, useRef, type UIEvent } from 'react';

import { cn } from '@/lib/utils';

import { CircledWord } from './circled-word';
import { Container } from './landing-container';
import { LANDING } from './landing.messages';
import { LandingShot } from './landing-shot';
import { SectionHeading } from './section-heading';
import { useSlidePosition } from './use-slide-position';

const SLIDES = LANDING.forYou.slides;

/** Open panel takes 6 shares, closed ones 1; the gap is crossed continuously. */
const flexGrowAt = (index: number, position: number) =>
  1 + 5 * Math.max(0, 1 - Math.abs(position - index));

export function ForYouSection() {
  const { nodeRef, position, active, goTo, setPosition } = useSlidePosition(
    SLIDES.length,
    'lp:for-you',
  );

  const slide = SLIDES[active];

  // Mobile has no scroll-driven pin (see landing-motion.tsx) — the rail is a
  // plain horizontal-scroll carousel there, so it reports its own nearest
  // slide from scrollLeft instead of a GSAP-computed position. This is a
  // no-op on desktop, where the rail isn't scrollable (overflow is hidden).
  const railTickingRef = useRef(false);

  const handleRailScroll = useCallback(
    (event: UIEvent<HTMLDivElement>) => {
      if (railTickingRef.current) return;
      railTickingRef.current = true;

      const rail = event.currentTarget;
      requestAnimationFrame(() => {
        railTickingRef.current = false;

        const railRect = rail.getBoundingClientRect();
        const center = railRect.left + railRect.width / 2;

        let closest = 0;
        let closestDistance = Infinity;
        rail.querySelectorAll<HTMLElement>('[data-slide-index]').forEach((el) => {
          const rect = el.getBoundingClientRect();
          const distance = Math.abs(rect.left + rect.width / 2 - center);
          if (distance < closestDistance) {
            closestDistance = distance;
            closest = Number(el.dataset.slideIndex);
          }
        });

        setPosition(closest);
      });
    },
    [setPosition],
  );

  const goToSlide = useCallback(
    (index: number) => {
      goTo(index);
      document.querySelector<HTMLElement>(`[data-slide-index="${index}"]`)?.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    },
    [goTo],
  );

  return (
    <section
      id="features"
      ref={nodeRef}
      data-lp="for-you"
      data-lp-reveal
      className="bg-lp-surface scroll-mt-32 py-20 lg:py-28"
    >
      <Container>
        <SectionHeading
          title={
            <>
              <CircledWord>{LANDING.forYou.titleCircled}</CircledWord>
              {LANDING.forYou.titleAfter}
            </>
          }
        />

        {/* Images and copy are pinned as one block: the copy changes with the
            open panel, so it has to stay on screen while the panels hand off.
            The rail is capped well under the viewport to leave room for it. */}
        <div data-lp="for-you-stage" data-lp-slide-count={SLIDES.length} className="mt-12">
          <div
            onScroll={handleRailScroll}
            className="flex h-[340px] snap-x snap-mandatory items-stretch gap-3 overflow-x-auto overscroll-x-contain scroll-smooth sm:h-[440px] lg:h-[56vh] lg:max-h-[540px] lg:min-h-[380px] lg:snap-none lg:gap-4 lg:overflow-visible"
          >
            {SLIDES.map((item, index) => (
              <button
                key={item.src}
                type="button"
                data-slide-index={index}
                onClick={() => goToSlide(index)}
                aria-current={index === active}
                style={{ flexGrow: flexGrowAt(index, position) }}
                className="border-lp-line relative w-[78%] shrink-0 basis-auto snap-center overflow-hidden rounded-2xl border sm:w-[60%] lg:w-auto lg:min-w-0 lg:flex-1 lg:shrink lg:basis-0 lg:snap-align-none"
              >
                <LandingShot
                  src={item.src}
                  alt={item.alt}
                  fill
                  loading="eager"
                  sizes="(max-width: 1024px) 90vw, 42vw"
                  style={{ objectPosition: item.focus }}
                  className="object-cover"
                />
              </button>
            ))}
          </div>

          {/* Keyed so the copy fades in again on every change instead of
              silently replacing itself. */}
          <div
            key={slide.src}
            className="animate-in fade-in mx-auto mt-8 w-fit max-w-[720px] text-start [animation-duration:500ms]"
          >
            <h3 className="text-lp-ink text-[17px] leading-[1.9] font-extrabold text-balance lg:text-[19px]">
              {slide.headline}
            </h3>

            {/* stretch, not start: the mint bars line up in one column at the
                start (right) edge instead of following each line's own end. */}
            <ul className="mt-3 flex flex-col items-stretch gap-2">
              {slide.points.map((point) => (
                <li
                  key={point}
                  className="border-lp-mint text-lp-muted border-s-2 ps-4 text-[14px] leading-[1.9] lg:text-[15px]"
                >
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-7 flex items-center justify-center gap-2">
            {SLIDES.map((item, index) => (
              <button
                key={item.src}
                type="button"
                onClick={() => goToSlide(index)}
                aria-label={item.headline}
                aria-current={index === active}
                className={cn(
                  'h-2 rounded-full transition-all',
                  index === active ? 'bg-lp-mint w-8' : 'bg-lp-line w-2',
                )}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
