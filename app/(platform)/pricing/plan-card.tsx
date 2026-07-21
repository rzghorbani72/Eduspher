import Link from "next/link";

import type { PublicPlan } from "@/lib/api/server";

import { PRICING } from "./pricing.messages";

const formatToman = (value: number) => value.toLocaleString("fa-IR");

interface Props {
  plan: PublicPlan;
  ctaLabel: string;
}

export function PlanCard({ plan, ctaLabel }: Props) {
  const limitRows = [
    { label: PRICING.limits.teachers, value: plan.limits.teachers },
    { label: PRICING.limits.courses, value: plan.limits.courses },
    { label: PRICING.limits.students, value: plan.limits.active_students },
    { label: PRICING.limits.storage, value: plan.storage_gb },
  ];

  return (
    <article
      className={`flex flex-col rounded-xl border bg-card p-6 shadow-sm ${
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

      {plan.price_yearly_toman != null ? (
        <p className="mt-1 text-xs text-muted-foreground">
          {formatToman(plan.price_yearly_toman)} {PRICING.perYear} —{" "}
          {PRICING.yearlyHint}
        </p>
      ) : null}

      <p className="mt-3">
        <span className="inline-flex rounded-full bg-muted px-3 py-1 text-xs font-semibold">
          {PRICING.trialBadge}
        </span>
      </p>

      <dl className="mt-5 space-y-2 text-sm">
        {limitRows.map((row) => (
          <div key={row.label} className="flex justify-between gap-3">
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd className="font-medium">{row.value.toLocaleString("fa-IR")}</dd>
          </div>
        ))}
      </dl>

      {plan.features.length > 0 ? (
        <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
          {plan.features.map((feature) => (
            <li key={feature}>• {feature}</li>
          ))}
        </ul>
      ) : null}

      <Link
        href="/auth/register"
        className="mt-6 inline-flex justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
      >
        {ctaLabel}
      </Link>
    </article>
  );
}
