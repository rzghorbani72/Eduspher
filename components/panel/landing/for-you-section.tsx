"use client";

import { cn } from "@/lib/utils";

import { CircledWord } from "./circled-word";
import { Container } from "./landing-container";
import { LANDING } from "./landing.messages";
import { LandingShot } from "./landing-shot";
import { SectionHeading } from "./section-heading";
import { useSlidePosition } from "./use-slide-position";

const SLIDES = LANDING.forYou.slides;

/** Open panel takes 6 shares, closed ones 1; the gap is crossed continuously. */
const flexGrowAt = (index: number, position: number) =>
  1 + 5 * Math.max(0, 1 - Math.abs(position - index));

export function ForYouSection() {
  const { nodeRef, position, active, goTo } = useSlidePosition(
    SLIDES.length,
    "lp:for-you",
  );

  const slide = SLIDES[active];

  return (
    <section
      id="features"
      ref={nodeRef}
      data-lp="for-you"
      data-lp-reveal
      className="scroll-mt-32 bg-lp-surface py-20 lg:py-28"
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
        <div
          data-lp="for-you-stage"
          data-lp-slide-count={SLIDES.length}
          className="mt-12"
        >
          <div className="flex h-[340px] items-stretch gap-3 sm:h-[440px] lg:h-[56vh] lg:max-h-[540px] lg:min-h-[380px] lg:gap-4">
            {SLIDES.map((item, index) => (
              <button
                key={item.src}
                type="button"
                onClick={() => goTo(index)}
                aria-current={index === active}
                style={{ flexGrow: flexGrowAt(index, position) }}
                className="relative min-w-0 flex-1 basis-0 overflow-hidden rounded-2xl border border-lp-line"
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
            className="mx-auto mt-8 w-fit max-w-[720px] animate-in text-start fade-in [animation-duration:500ms]"
          >
            <h3 className="text-balance text-[17px] font-extrabold leading-[1.9] text-lp-ink lg:text-[19px]">
              {slide.headline}
            </h3>

            {/* stretch, not start: the mint bars line up in one column at the
                start (right) edge instead of following each line's own end. */}
            <ul className="mt-3 flex flex-col items-stretch gap-2">
              {slide.points.map((point) => (
                <li
                  key={point}
                  className="border-s-2 border-lp-mint ps-4 text-[14px] leading-[1.9] text-lp-muted lg:text-[15px]"
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
                onClick={() => goTo(index)}
                aria-label={item.headline}
                aria-current={index === active}
                className={cn(
                  "h-2 rounded-full transition-all",
                  index === active ? "w-8 bg-lp-mint" : "w-2 bg-lp-line",
                )}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
