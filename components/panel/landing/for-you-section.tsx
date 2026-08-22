"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { CircledWord } from "./circled-word";
import { Container } from "./landing-container";
import { LANDING } from "./landing.messages";
import { LandingShot } from "./landing-shot";
import { SectionHeading } from "./section-heading";

const SLIDES = LANDING.forYou.slides;

export function ForYouSection() {
  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  // `landing-motion` owns the scroll maths for the rail and reports which panel
  // is open, so this component stays plain markup and GSAP keeps one owner.
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const onSlide = (event: Event) => {
      const index = (event as CustomEvent<number>).detail;
      if (typeof index === "number") setActive(index);
    };

    node.addEventListener("lp:for-you", onSlide);
    return () => node.removeEventListener("lp:for-you", onSlide);
  }, []);

  const slide = SLIDES[active];

  return (
    <section
      id="features"
      ref={sectionRef}
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

        <div
          data-lp="grow-rail"
          data-lp-slide-count={SLIDES.length}
          className="mt-14 flex h-[300px] items-stretch gap-3 sm:h-[420px] lg:h-[62vh] lg:max-h-[560px] lg:min-h-[380px] lg:gap-4"
        >
          {SLIDES.map((item, index) => (
            <button
              key={item.src}
              type="button"
              data-lp="grow-panel"
              onClick={() => setActive(index)}
              aria-current={index === active}
              style={{ flexGrow: index === active ? 6 : 1 }}
              className="relative min-w-0 flex-1 basis-0 overflow-hidden rounded-2xl border border-lp-line transition-[flex-grow] duration-700 ease-out motion-reduce:transition-none"
            >
              <LandingShot
                src={item.src}
                alt={item.alt}
                fill
                loading="eager"
                sizes="(max-width: 1024px) 90vw, 42vw"
                className="object-cover object-center"
              />
            </button>
          ))}
        </div>

        {/* One block, swapped by the open panel. Keyed so the copy fades in
            again on every change instead of silently replacing itself. */}
        <div
          key={slide.src}
          className="mx-auto mt-12 flex max-w-[720px] animate-in flex-col items-center gap-4 text-center fade-in [animation-duration:500ms]"
        >
          <h3 className="text-balance text-[17px] font-extrabold leading-[1.9] text-lp-ink lg:text-[19px]">
            {slide.headline}
          </h3>

          <ul className="flex flex-col items-center gap-3">
            {slide.points.map((point) => (
              <li
                key={point}
                className="border-e-2 border-lp-mint pe-4 text-[14px] leading-[1.9] text-lp-muted lg:text-[15px]"
              >
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2">
          {SLIDES.map((item, index) => (
            <button
              key={item.src}
              type="button"
              onClick={() => setActive(index)}
              aria-label={item.headline}
              aria-current={index === active}
              className={cn(
                "h-2 rounded-full transition-all",
                index === active ? "w-8 bg-lp-mint" : "w-2 bg-lp-line",
              )}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
