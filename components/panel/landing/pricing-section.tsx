"use client";

import { Check } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

import { Container } from "./landing-container";
import { LANDING } from "./landing.messages";
import { SectionHeading } from "./section-heading";

type Cycle = "yearly" | "monthly";

type Props = {
  registerUrl: string;
  contactUrl: string;
};

export function PricingSection({ registerUrl, contactUrl }: Props) {
  const [cycle, setCycle] = useState<Cycle>("yearly");

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

        <div className="mt-12 grid items-start gap-5 lg:grid-cols-3">
          {LANDING.pricing.plans.map((plan) => {
            const price =
              cycle === "yearly" ? plan.priceYearly : plan.priceMonthly;
            const isFree = price === LANDING.pricing.plans[0].priceYearly;

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
                  {!isFree ? (
                    <span className="ms-2 text-[13px] text-lp-muted">
                      {LANDING.pricing.perMonth}
                    </span>
                  ) : null}
                </p>
                <p className="mt-2 text-center text-[12px] text-lp-muted">
                  {plan.priceNote}
                </p>

                <a
                  href={plan.id === "business" ? contactUrl : registerUrl}
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
