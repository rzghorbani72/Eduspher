"use client";

import { Check } from "lucide-react";
import { useState } from "react";

import type { PublicPlan } from "@/lib/api/server";
import { cn } from "@/lib/utils";

import { Container } from "./landing-container";
import { LANDING } from "./landing.messages";
import { SectionHeading } from "./section-heading";

type Cycle = "monthly" | "quarterly";

type Props = {
  loginUrl: string;
  /** Live plans. Prices come from here; the tagline and feature list stay curated. */
  plans?: PublicPlan[];
  /** "h1" when the section is the whole page, not a block on the landing page. */
  as?: "h1" | "h2";
};

const faNumber = (value: number) => value.toLocaleString("fa-IR");

const QUARTERLY_STEP = 500_000;
const QUARTERLY_DISCOUNT_RATE = 0.05;

function quarterlyFromMonthly(monthly: number): {
  charged: number;
  full: number;
  discountPercent: number;
} {
  const full = monthly * 3;
  const discounted = full * (1 - QUARTERLY_DISCOUNT_RATE);
  const charged = Math.max(
    QUARTERLY_STEP,
    Math.floor(discounted / QUARTERLY_STEP) * QUARTERLY_STEP,
  );
  const amount = Math.max(0, full - charged);
  const discountPercent =
    amount > 0 ? Math.round(QUARTERLY_DISCOUNT_RATE * 100) : 0;
  return { charged, full, discountPercent };
}

const FALLBACK_MONTHLY: Record<string, number> = {
  starter: 2_800_000,
  growth: 5_800_000,
  business: 9_000_000,
};

function resolveMonthlyToman(
  livePrice: number | undefined,
  planId: string,
): number {
  if (livePrice != null) return livePrice;
  return FALLBACK_MONTHLY[planId] ?? 0;
}

function panelPlanLoginUrl(
  loginUrl: string,
  planId: string,
  cycle: Cycle,
): string {
  const url = new URL(
    loginUrl,
    typeof window !== "undefined"
      ? window.location.origin
      : "https://admin.mentoma.ir",
  );
  url.searchParams.set("plan", planId);
  url.searchParams.set("period", cycle);
  return url.toString();
}

export function PricingSection({ loginUrl, plans = [], as }: Props) {
  const [cycle, setCycle] = useState<Cycle>("monthly");
  const livePlans = new Map(plans.map((plan) => [plan.slug, plan]));

  return (
    <section
      id="pricing"
      data-lp-reveal
      className="scroll-mt-32 bg-lp-surface-2 py-20 lg:py-28"
    >
      <Container>
        <SectionHeading
          as={as}
          title={LANDING.pricing.title}
          subtitle={LANDING.pricing.subtitle}
        />

        <div className="mt-8 flex justify-center">
          <div
            role="group"
            className="flex items-center gap-1 rounded-full bg-lp-surface p-1"
          >
            {(["monthly", "quarterly"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setCycle(option)}
                aria-pressed={cycle === option}
                className={cn(
                  "rounded-full px-5 py-1.5 text-[13px] font-bold transition-colors",
                  cycle === option
                    ? "bg-lp-blue text-white"
                    : "text-lp-muted hover:text-lp-ink",
                )}
              >
                {LANDING.pricing[option]}
              </button>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-12 grid max-w-[880px] items-stretch gap-4 lg:grid-cols-[1fr_1.12fr_1fr]">
          {LANDING.pricing.plans.map((plan) => {
            const live = livePlans.get(plan.id);
            const monthly = resolveMonthlyToman(
              live?.price_monthly_toman,
              plan.id,
            );
            const q = quarterlyFromMonthly(monthly);

            const price =
              cycle === "quarterly"
                ? monthly > 0
                  ? faNumber(q.charged)
                  : plan.priceQuarterly
                : live
                  ? faNumber(live.price_monthly_toman)
                  : plan.priceMonthly;
            const upcoming = live?.upcoming_price ?? null;
            const isFeatured = plan.featured;
            const showDiscount = cycle === "quarterly" && q.discountPercent > 0;

            return (
              <article
                key={plan.id}
                className={cn(
                  "flex h-full flex-col rounded-2xl border bg-lp-surface p-6 transition-colors",
                  isFeatured
                    ? "border-lp-line shadow-lp-card lg:-my-5 lg:p-7"
                    : "border-lp-line/70 hover:border-lp-line",
                )}
              >
                <h3 className="text-center text-[15px] font-bold text-lp-ink">
                  {plan.name}
                </h3>
                <p className="mt-1.5 text-center text-[12px] text-lp-muted">
                  {plan.tagline}
                </p>

                <p className="mt-6 text-center">
                  <span className="text-[30px] font-black leading-none text-lp-ink">
                    {price}
                  </span>
                  <span className="ms-2 text-[12px] text-lp-muted">
                    {cycle === "quarterly"
                      ? LANDING.pricing.perQuarter
                      : LANDING.pricing.perMonth}
                  </span>
                </p>

                {showDiscount ? (
                  <p className="mt-2 flex flex-wrap items-center justify-center gap-2 text-[12px]">
                    <span className="text-lp-muted line-through">
                      {faNumber(q.full)}
                    </span>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-semibold text-emerald-700">
                      {LANDING.pricing.discountPercent.replace(
                        "{percent}",
                        faNumber(q.discountPercent),
                      )}
                    </span>
                  </p>
                ) : (
                  <p className="mt-2 text-center text-[11.5px] text-lp-muted">
                    {cycle === "quarterly"
                      ? LANDING.pricing.cycleNoteQuarterly
                      : LANDING.pricing.cycleNoteMonthly}
                  </p>
                )}

                {showDiscount ? (
                  <p className="mt-1.5 text-center text-[11.5px] text-lp-muted">
                    {LANDING.pricing.cycleNoteQuarterly}
                  </p>
                ) : null}

                {upcoming ? (
                  <p className="mt-2 text-center text-[11px] leading-[1.7] text-lp-muted">
                    {LANDING.pricing.upcomingPrice
                      .replace(
                        "{price}",
                        faNumber(upcoming.price_monthly_toman),
                      )
                      .replace(
                        "{date}",
                        new Date(upcoming.effective_at).toLocaleDateString(
                          "fa-IR",
                        ),
                      )}
                  </p>
                ) : null}

                <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-[13px] leading-[1.7] text-lp-ink/80"
                    >
                      <Check
                        size={14}
                        strokeWidth={3}
                        aria-hidden
                        className="mt-1 shrink-0 text-lp-blue"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                <a
                  href={panelPlanLoginUrl(loginUrl, plan.id, cycle)}
                  className={cn(
                    "mt-7 flex h-11 items-center justify-center rounded-xl text-[13px] font-bold transition-colors",
                    isFeatured
                      ? "bg-lp-blue text-white hover:bg-lp-blue/90"
                      : "bg-lp-surface-2 text-lp-ink hover:bg-lp-line/40",
                  )}
                >
                  {plan.cta}
                </a>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
