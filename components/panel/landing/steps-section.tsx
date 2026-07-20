"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

import { Container } from "./landing-container";
import { LANDING } from "./landing.messages";
import { SectionHeading } from "./section-heading";

const STEPS = LANDING.steps.items;

export function StepsSection() {
  const [active, setActive] = useState(0);

  const go = (index: number) =>
    setActive((index + STEPS.length) % STEPS.length);

  const step = STEPS[active];

  return (
    <section
      id="how"
      data-lp-reveal
      className="scroll-mt-32 bg-lp-surface py-20 lg:py-28"
    >
      <Container>
        <SectionHeading title={LANDING.steps.title} />

        {/* One block, one step at a time. Only the active slide is rendered —
            same reasoning as the publish panel: swapping the element can't get
            stuck the way toggling opacity on stacked slides can. */}
        <div className="mt-14 rounded-[28px] border border-lp-line bg-lp-surface-2 p-5 sm:p-8">
          <div className="relative overflow-hidden rounded-2xl">
            <Image
              key={step.number}
              src={step.image}
              alt={step.alt}
              width={1100}
              height={560}
              priority
              sizes="(max-width: 1024px) 100vw, 1160px"
              className="lp-fade-in h-auto w-full"
            />
          </div>

          <div
            key={`copy-${step.number}`}
            className="lp-fade-in -mt-6 flex flex-col items-center"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-lp-surface-2 bg-lp-mint text-base font-black text-lp-ink">
              {step.number}
            </span>
            <h3 className="mt-5 text-center text-lg font-bold text-lp-ink lg:text-xl">
              {step.title}
            </h3>
            <p className="mt-2 max-w-[520px] text-center text-[15px] leading-[1.9] text-lp-muted">
              {step.body}
            </p>
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
