import Link from "next/link";
import { Check } from "lucide-react";

import type { PublicPlan } from "@/lib/api/server";

import { PRICING } from "./pricing.messages";

const formatToman = (value: number) => value.toLocaleString("fa-IR");

interface Props {
  plan: PublicPlan;
  ctaLabel: string;
}

export function PlanCard({ plan, ctaLabel }: Props) {
  // The plan's headline caps: teachers, private-tutoring students, and storage.
  // Public course/subscription sales are unlimited and shown as a note below.
  const limitRows = [
    { label: PRICING.limits.teachers, value: plan.limits.teachers },
    { label: PRICING.limits.students, value: plan.limits.tutoring_students },
    { label: PRICING.limits.storage, value: plan.storage_gb },
    { label: PRICING.limits.courses, value: plan.limits.courses },
  ];

  // The "hidden discount": a year billed at ten months' price, shown as the
  // real Toman saved so the annual value is explicit rather than implied.
  const yearlySaving =
    plan.price_yearly_toman != null
      ? plan.price_monthly_toman * 12 - plan.price_yearly_toman
      : null;

  return (
    <article
      className={`flex h-full flex-col rounded-xl border bg-card p-6 shadow-sm ${
        plan.is_most_popular ? "border-primary ring-1 ring-primary" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">{plan.name}</h2>
        {plan.is_most_popular ? (
          <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
            {PRICING.mostPopular}
          </span>
        ) : null}
      </div>

      <p className="mt-4">
        <span className="text-3xl font-bold">
          {formatToman(plan.price_monthly_toman)}
        </span>
        <span className="ms-2 text-sm text-muted-foreground">
          {PRICING.perMonth}
        </span>
      </p>

      {/* Hidden discount, right under the price. */}
      {yearlySaving && yearlySaving > 0 ? (
        <p className="mt-1 text-sm font-semibold text-primary">
          {PRICING.savingYearly.replace("{amount}", formatToman(yearlySaving))}
        </p>
      ) : null}

      {plan.price_yearly_toman != null ? (
        <p className="mt-1 text-xs text-muted-foreground">
          {formatToman(Math.round(plan.price_yearly_toman / 12))}{" "}
          {PRICING.perMonth} {PRICING.yearlyHint}
        </p>
      ) : null}

      {/* Announced-but-not-applied price: the public half of the 30-day notice
          the academy agreement promises before any increase. */}
      {plan.upcoming_price ? (
        <p className="mt-3 rounded-lg bg-muted p-2 text-xs leading-6 text-muted-foreground">
          {PRICING.upcomingPrice
            .replace(
              "{price}",
              formatToman(plan.upcoming_price.price_monthly_toman),
            )
            .replace(
              "{date}",
              new Date(plan.upcoming_price.effective_at).toLocaleDateString(
                "fa-IR",
              ),
            )}
        </p>
      ) : null}

      <dl className="mt-5 space-y-2 text-sm">
        {limitRows.map((row) => (
          <div key={row.label} className="flex justify-between gap-3">
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd className="font-medium">{row.value.toLocaleString("fa-IR")}</dd>
          </div>
        ))}
        <div className="flex justify-between gap-3 pt-1 text-primary">
          <dt>{PRICING.limits.unlimitedPublic}</dt>
        </div>
      </dl>

      <ul className="mt-5 flex-1 space-y-2 text-sm">
        {plan.features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2 text-muted-foreground"
          >
            <Check
              size={16}
              className="mt-0.5 shrink-0 text-muted-foreground"
              aria-hidden
            />
            {feature}
          </li>
        ))}
      </ul>

      {/* flex-1 on the list above pushes the CTA to the bottom with a fixed gap,
          so buttons align across cards whatever the feature-list length. */}
      <Link
        href="/auth/register"
        className="mt-8 inline-flex justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
      >
        {ctaLabel}
      </Link>
    </article>
  );
}
