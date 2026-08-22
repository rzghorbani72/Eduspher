"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { Container } from "./landing-container";
import { LANDING } from "./landing.messages";
import { ProductFrame } from "./product-frame";
import { SectionHeading } from "./section-heading";

const TABS = LANDING.publish.tabs;
const PAIRS = LANDING.publish.pairs;
const CYCLE_MS = 6000;

type Side = "student" | "owner";

type Props = {
  registerUrl: string;
  pricingUrl: string;
};

/**
 * Infinite loop of matched pairs:
 * student shot → matching owner shot → next pair’s student → …
 * Pair index stays locked while flipping sides so the two views stay aligned.
 */
export function PublishSection({ registerUrl, pricingUrl }: Props) {
  const [side, setSide] = useState<Side>("student");
  const [pairIndex, setPairIndex] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [running, setRunning] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const sideRef = useRef(side);
  const pairRef = useRef(pairIndex);
  useEffect(() => {
    sideRef.current = side;
    pairRef.current = pairIndex;
  });

  useEffect(() => {
    const node = panelRef.current;
    if (!node) return;

    let timer: ReturnType<typeof setTimeout> | null = null;

    const stop = () => {
      if (timer) clearTimeout(timer);
      timer = null;
      setRunning(false);
    };

    const start = () => {
      if (timer) return;
      setRunning(true);
      const schedule = () => {
        timer = setTimeout(() => {
          timer = null;
          if (sideRef.current === "student") {
            setSide("owner");
          } else {
            setPairIndex((pairRef.current + 1) % PAIRS.length);
            setSide("student");
          }
          setCycle((value) => value + 1);
          schedule();
        }, CYCLE_MS);
      };
      schedule();
    };

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

  const selectTab = (next: Side) => {
    if (next === side) {
      setPairIndex((index) => (index + 1) % PAIRS.length);
    } else {
      setSide(next);
    }
    setCycle((value) => value + 1);
  };

  const activeTabIndex = side === "student" ? 0 : 1;
  const pair = PAIRS[pairIndex];
  const frame = side === "student" ? pair.student : pair.owner;
  const frameKey = `${pair.id}-${side}`;

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
                onClick={() => selectTab(tab.id as Side)}
                aria-pressed={activeTabIndex === index}
                aria-controls="publish-panel-image"
                className={cn(
                  "flex flex-col gap-2.5 rounded-2xl border p-5 text-start transition-colors",
                  activeTabIndex === index
                    ? "border-lp-mint/45 bg-white"
                    : "border-transparent bg-transparent hover:bg-white/60"
                )}
              >
                <span className="flex items-center gap-2.5 text-[17px] font-bold text-lp-ink">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "h-2 w-2 shrink-0 rounded-full transition-colors",
                      activeTabIndex === index ? "bg-lp-mint" : "bg-lp-line"
                    )}
                  />
                  {tab.title}
                </span>
                <span className="text-[14.5px] leading-[1.85] text-lp-muted">
                  {tab.body}
                </span>
                <span className="mt-2 h-1 w-full overflow-hidden rounded-full bg-lp-line/70">
                  <span
                    key={`${index}-${cycle}`}
                    className={cn(
                      "block h-full rounded-full bg-lp-mint",
                      activeTabIndex === index && running && "lp-progress"
                    )}
                    style={{
                      width:
                        activeTabIndex === index && running ? undefined : "0%",
                    }}
                  />
                </span>
              </button>
            ))}
          </div>

          <div className="px-6 pb-6 sm:px-8 sm:pb-8">
            <ProductFrame
              id="publish-panel-image"
              aria-live="polite"
              className="w-full"
            >
              <div className="relative aspect-1440/768 w-full">
                <Image
                  key={frameKey}
                  src={frame.image}
                  alt={frame.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 1160px"
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
