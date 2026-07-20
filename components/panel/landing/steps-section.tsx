"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { Container } from "./landing-container";
import { LANDING } from "./landing.messages";
import { SectionHeading } from "./section-heading";

const STEPS = LANDING.steps.items;

export function StepsSection() {
  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  // While the section is pinned, scrolling advances the step. `landing-motion`
  // owns the scroll maths and reports the index here, so this stays a plain
  // component and GSAP still has exactly one owner.
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const onStep = (event: Event) => {
      const index = (event as CustomEvent<number>).detail;
      if (typeof index === "number") setActive(index);
    };

    node.addEventListener("lp:step", onStep);
    return () => node.removeEventListener("lp:step", onStep);
  }, []);

  const go = (index: number) =>
    setActive((index + STEPS.length) % STEPS.length);

  return (
    <section
      id="how"
      ref={sectionRef}
      data-lp="steps"
      data-lp-step-count={STEPS.length}
      data-lp-reveal
      className="scroll-mt-32 bg-lp-surface py-20 lg:py-28"
    >
      <Container>
        <SectionHeading title={LANDING.steps.title} />

        <div
          data-lp="steps-stage"
          className="mt-14 rounded-[28px] border border-lp-line bg-lp-surface-2 p-5 sm:p-8"
        >
          {/* Horizontal track. All slides are laid out side by side and the
              track slides; in RTL the flex row runs right-to-left, so advancing
              a step means translating the track to the right by one slide.
              The percentage is of the track's own box (= one slide), which is
              why the track keeps `w-full` while its children overflow it. */}
          <div className="overflow-hidden">
            <div
              className="flex w-full transition-transform duration-500 ease-out motion-reduce:transition-none"
              style={{ transform: `translateX(${active * 100}%)` }}
            >
              {STEPS.map((item, index) => (
                <div
                  key={item.number}
                  className="w-full shrink-0"
                  aria-hidden={index !== active}
                >
                  {/* Capped to a share of the viewport so the whole stage —
                      image, badge, copy and dots — still fits on screen while
                      it is pinned. An uncapped 1100x560 image overflows a short
                      laptop and the controls end up below the fold. */}
                  <div className="relative h-[38vh] max-h-[420px] min-h-[220px] overflow-hidden rounded-2xl">
                    <Image
                      src={item.image}
                      alt={item.alt}
                      fill
                      priority={index === 0}
                      sizes="(max-width: 1024px) 100vw, 1160px"
                      className="object-cover"
                    />
                  </div>

                  {/* z-10 so the number badge sits over the image edge rather
                      than being covered by it. */}
                  <div className="relative z-10 -mt-6 flex flex-col items-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-lp-surface-2 bg-lp-mint text-base font-black text-lp-ink">
                      {item.number}
                    </span>
                    <h3 className="mt-5 text-center text-lg font-bold text-lp-ink lg:text-xl">
                      {item.title}
                    </h3>
                    <p className="mt-2 max-w-[520px] text-center text-[15px] leading-[1.9] text-lp-muted">
                      {item.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-9 flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              {STEPS.map((item, index) => (
                <button
                  key={item.number}
                  type="button"
                  onClick={() => go(index)}
                  aria-label={`${LANDING.steps.stepLabel} ${item.number}`}
                  aria-current={active === index}
                  className={cn(
                    "h-9 w-9 rounded-full text-[13px] font-bold transition-colors",
                    active === index
                      ? "bg-lp-mint text-lp-ink"
                      : "border border-lp-line bg-white text-lp-muted hover:text-lp-ink",
                  )}
                >
                  {item.number}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
