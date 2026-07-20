"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { Container } from "./landing-container";
import { LANDING } from "./landing.messages";
import { SectionHeading } from "./section-heading";

const TABS = LANDING.publish.tabs;
const CYCLE_MS = 6000;
const TICK_MS = 50;

type Props = {
  registerUrl: string;
  pricingUrl: string;
};

export function PublishSection({ registerUrl, pricingUrl }: Props) {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const elapsed = useRef(0);

  useEffect(() => {
    const node = panelRef.current;
    if (!node) return;

    let timer: ReturnType<typeof setInterval> | null = null;

    const stop = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };

    const start = () => {
      if (timer) return;
      timer = setInterval(() => {
        elapsed.current += TICK_MS;
        if (elapsed.current >= CYCLE_MS) {
          elapsed.current = 0;
          setActive((tab) => (tab + 1) % TABS.length);
          setProgress(0);
          return;
        }
        setProgress((elapsed.current / CYCLE_MS) * 100);
      }, TICK_MS);
    };

    // Only run the timer while the panel is on screen. Threshold stays 0: the
    // panel is often taller than the viewport (short laptops, mobile), and a
    // fractional threshold can then never be met — which would silently freeze
    // the cycle on the first image.
    const observer = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0, rootMargin: "-15% 0px -15% 0px" }
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      stop();
    };
  }, []);

  const selectTab = (index: number) => {
    elapsed.current = 0;
    setActive(index);
    setProgress(0);
  };

  return (
    <section
      id="publish"
      data-lp-reveal
      className="scroll-mt-32 bg-lp-surface py-20 lg:py-28"
    >
      <Container>
        <SectionHeading
          title={LANDING.publish.title}
          subtitle={LANDING.publish.subtitle}
        />

        <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <a
            href={registerUrl}
            className="flex h-14 items-center justify-center rounded-lp bg-lp-mint px-8 text-[16px] font-bold text-lp-ink shadow-lp-mint transition-transform hover:-translate-y-0.5"
          >
            {LANDING.publish.ctaPrimary}
          </a>
          <a
            href={pricingUrl}
            className="flex h-14 items-center justify-center rounded-lp border border-lp-line-2 bg-white px-8 text-[15px] font-semibold text-lp-ink transition-colors hover:border-lp-ink/25"
          >
            {LANDING.publish.ctaSecondary}
          </a>
        </div>

        <div
          ref={panelRef}
          className="mt-16 overflow-hidden rounded-[28px] border border-lp-line bg-lp-surface-2"
        >
          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-2 lg:gap-12">
            {TABS.map((tab, index) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => selectTab(index)}
                aria-pressed={active === index}
                aria-controls="publish-panel-image"
                className={cn(
                  // Neither tab is ever dimmed — both describe halves of the
                  // same product and stay fully legible. The active one is
                  // marked by surface + border, not by muting the other.
                  "flex flex-col gap-2.5 rounded-2xl border p-5 text-start transition-colors",
                  active === index
                    ? "border-lp-mint/45 bg-white"
                    : "border-transparent bg-transparent hover:bg-white/60"
                )}
              >
                <span className="flex items-center gap-2.5 text-[17px] font-bold text-lp-ink">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "h-2 w-2 shrink-0 rounded-full transition-colors",
                      active === index ? "bg-lp-mint" : "bg-lp-line"
                    )}
                  />
                  {tab.title}
                </span>
                <span className="text-[14.5px] leading-[1.85] text-lp-muted">
                  {tab.body}
                </span>
                <span className="mt-2 h-1 w-full overflow-hidden rounded-full bg-lp-line/70">
                  <span
                    className="block h-full rounded-full bg-lp-mint transition-[width] duration-100 ease-linear motion-reduce:transition-none"
                    style={{ width: active === index ? `${progress}%` : "0%" }}
                  />
                </span>
              </button>
            ))}
          </div>

          <div className="px-6 pb-0 sm:px-8">
            <div
              id="publish-panel-image"
              aria-live="polite"
              className="relative aspect-1440/768 w-full overflow-hidden rounded-t-2xl border border-b-0 border-lp-line"
            >
              {/* Only the active image is rendered. Cross-fading two stacked
                  images is prettier, but it fails closed in the worst way: if
                  the hiding class ever loses, the last one painted covers the
                  other forever and the section looks frozen. Swapping the
                  element cannot fail that way. `key` forces a real remount so
                  the fade-in replays on every change. */}
              <Image
                key={TABS[active].id}
                src={TABS[active].image}
                alt={TABS[active].alt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 1240px"
                className="lp-fade-in object-cover object-top"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
