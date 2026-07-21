"use client";

import { Check } from "lucide-react";
import { useState } from "react";

import type { PublicPlan } from "@/lib/api/server";
import { cn } from "@/lib/utils";

import { Container } from "./landing-container";
import { LANDING } from "./landing.messages";
import { SectionHeading } from "./section-heading";

type Cycle = "yearly" | "monthly";

type Props = {
  registerUrl: string;
  /** Live plans. Prices come from here; the tagline and feature list stay curated. */
  plans?: PublicPlan[];
};

const faNumber = (value: number) => value.toLocaleString("fa-IR");

export function PricingSection({ registerUrl, plans = [] }: Props) {
  const [cycle, setCycle] = useState<Cycle>("yearly");
  const livePlans = new Map(plans.map((plan) => [plan.slug, plan]));

  return (
    <section
      id="pricing"
      data-lp-reveal
      className="scroll-mt-32 bg-lp-surface py-20 lg:py-28"
    >
      <Container>
        <SectionHeading
          title={LANDING.pricing.title}
          subtitle={LANDING.pricing.subtitle}
        />

        <p className="mt-3 text-center text-[13px] font-bold text-lp-blue">
          {LANDING.pricing.noCommission}
        </p>
        <p className="mx-auto mt-2 max-w-xl text-center text-[12px] text-lp-muted">
          {LANDING.pricing.unlimitedSignups}
        </p>
        <p className="mt-2 text-center text-[13px] font-bold text-lp-ink">
          {LANDING.pricing.trialLine}
        </p>

        <div className="mt-9 flex justify-center">
          <div
            role="group"
            className="flex items-center gap-1 rounded-full border border-lp-line bg-white p-1"
          >
            {(["yearly", "monthly"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setCycle(option)}
                aria-pressed={cycle === option}
                className={cn(
                  "rounded-full px-5 py-2 text-[13px] font-bold transition-colors",
                  cycle === option
                    ? "bg-lp-blue text-white"
                    : "text-lp-muted hover:text-lp-ink"
                )}
              >
                {LANDING.pricing[option]}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-3 text-center text-[12px] text-lp-muted">
          {cycle === "yearly"
            ? LANDING.pricing.cycleNoteYearly
            : LANDING.pricing.cycleNoteMonthly}
        </p>

        <div className="mt-12 grid items-start gap-5 lg:grid-cols-3">
          {LANDING.pricing.plans.map((plan) => {
            const live = livePlans.get(plan.id);
            const yearlyPerMonth =
              live?.price_yearly_toman != null
                ? Math.round(live.price_yearly_toman / 12)
                : null;

            // Live price wins; the static copy is only a fallback for when the
            // API is unreachable, so the page never shows a blank price.
            const price =
              cycle === "yearly"
                ? (yearlyPerMonth != null ? faNumber(yearlyPerMonth) : plan.priceYearly)
                : (live ? faNumber(live.price_monthly_toman) : plan.priceMonthly);
            const upcoming = live?.upcoming_price ?? null;

            return (
              <article
                key={plan.id}
                className={cn(
                  "flex flex-col rounded-2xl border bg-white p-8",
                  plan.featured
                    ? "border-lp-mint/60 shadow-lp-card lg:-my-4 lg:py-12"
                    : "border-lp-line"
                )}
              >
                <h3 className="text-center text-lg font-bold text-lp-ink">
                  {plan.name}
                </h3>
                <p className="mt-1.5 text-center text-[13px] text-lp-muted">
                  {plan.tagline}
                </p>

                <p className="mt-7 text-center">
                  <span className="text-[34px] font-black leading-none text-lp-ink">
                    {price}
                  </span>
                  <span className="ms-2 text-[13px] text-lp-muted">
                    {LANDING.pricing.perMonth}
                  </span>
                </p>

                {/* Announced-but-not-applied price. Showing it here is the
                    public half of the 30-day notice the agreement promises. */}
                {upcoming ? (
                  <p className="mt-2 text-center text-[11px] leading-[1.7] text-lp-muted">
                    {LANDING.pricing.upcomingPrice
                      .replace("{price}", faNumber(upcoming.price_monthly_toman))
                      .replace(
                        "{date}",
                        new Date(upcoming.effective_at).toLocaleDateString("fa-IR"),
                      )}
                  </p>
                ) : null}

                <a
                  href={registerUrl}
                  className={cn(
                    "mt-7 flex h-12 items-center justify-center rounded-xl text-[14px] font-bold transition-transform hover:-translate-y-0.5",
                    plan.featured
                      ? "bg-lp-mint text-lp-ink shadow-lp-mint"
                      : "border border-lp-line bg-lp-surface-2 text-lp-ink"
                  )}
                >
                  {plan.cta}
                </a>

                <ul className="mt-8 flex flex-col gap-3.5">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-[13.5px] leading-[1.7] text-lp-ink-2"
                    >
                      <Check
                        size={15}
                        strokeWidth={3}
                        aria-hidden="true"
                        className="mt-1 shrink-0 text-lp-blue"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
