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
  const cards = LANDING.pricing.plans;
  // The growth plan is highlighted by default; clicking another card moves the
  // highlight so a visitor can compare tiers as the one they are considering.
  const featuredId = cards.find((p) => p.featured)?.id ?? cards[0]?.id;
  const [selectedId, setSelectedId] = useState<string>(featuredId);
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

        {/* The trial is one universal offer, not a feature of any one plan:
            every account gets a month, then picks a plan. Stated once here so a
            per-card bullet does not imply it belongs to a specific tier. */}
        <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-lp-mint/50 bg-lp-mint/10 px-6 py-5 text-center">
          <p className="text-[15px] font-bold text-lp-ink">
            {LANDING.pricing.trialBannerTitle}
          </p>
          <p className="mx-auto mt-1.5 max-w-xl text-[12.5px] leading-[1.9] text-lp-ink-2">
            {LANDING.pricing.trialBannerBody}
          </p>
        </div>

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

        <div className="mt-12 grid items-stretch gap-5 lg:grid-cols-3">
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
            const isSelected = selectedId === plan.id;
            // Recommendation is editorial and fixed on the featured plan;
            // selection is the visitor's interaction. They are independent, so
            // Growth keeps its badge even when another card is selected.
            const isRecommended = plan.featured;

            // The "hidden discount": a year billed at ten months' price, shown
            // as the real Toman saved so the annual value is explicit.
            const yearlySaving =
              live?.price_yearly_toman != null
                ? live.price_monthly_toman * 12 - live.price_yearly_toman
                : null;

            return (
              <article
                key={plan.id}
                onClick={() => setSelectedId(plan.id)}
                data-selected={isSelected}
                className={cn(
                  "flex h-full cursor-pointer flex-col rounded-2xl border bg-white p-8 transition-all",
                  isSelected
                    ? "border-lp-mint ring-2 ring-lp-mint/50 shadow-lp-card"
                    : "border-lp-line hover:border-lp-mint/40"
                )}
              >
                {isRecommended ? (
                  <span className="mx-auto -mt-11 mb-3 inline-flex rounded-full bg-lp-mint px-3 py-1 text-[11px] font-bold text-lp-ink shadow-lp-mint">
                    {LANDING.pricing.mostPopular}
                  </span>
                ) : null}

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

                {/* Hidden discount, right under the price. */}
                <p className="mt-2 h-4 text-center text-[12px] font-bold text-lp-mint">
                  {cycle === "yearly"
                    ? yearlySaving && yearlySaving > 0
                      ? LANDING.pricing.savingYearly.replace(
                          "{amount}",
                          faNumber(yearlySaving),
                        )
                      : ""
                    : LANDING.pricing.savingHintMonthly}
                </p>

                {/* Announced-but-not-applied price — the public half of the
                    30-day notice the agreement promises. */}
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

                <ul className="mt-7 flex flex-col gap-3.5">
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

                {/* mt-auto pins the CTA to the bottom, so it aligns across
                    cards whatever the feature-list length. */}
                <a
                  href={registerUrl}
                  onClick={(e) => e.stopPropagation()}
                  className={cn(
                    "mt-8 flex h-12 items-center justify-center rounded-xl text-[14px] font-bold transition-transform hover:-translate-y-0.5",
                    isSelected
                      ? "bg-lp-mint text-lp-ink shadow-lp-mint"
                      : "border border-lp-line bg-lp-surface-2 text-lp-ink"
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
