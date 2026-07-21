import Link from "@/components/ui/link";
import { notFound } from "next/navigation";

import { getPublicPlans, getPublicPricingConfig } from "@/lib/api/server";
import { getAcademyContext } from "@/lib/store-context";

import { PRICING } from "./pricing.messages";
import { PlanCard } from "./plan-card";

export default async function PricingPage() {
  const storeContext = await getAcademyContext();
  if (storeContext.slug) {
    notFound();
  }

  const [pricingConfig, plans] = await Promise.all([
    getPublicPricingConfig(),
    getPublicPlans(),
  ]);

  const pageTitle = pricingConfig?.title || PRICING.title;
  const pageSubtitle = pricingConfig?.subtitle || PRICING.subtitle;
  const ctaLabel = pricingConfig?.cta_label || PRICING.cta;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <section className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {pageTitle}
        </h1>
        <p className="mx-auto mt-3 max-w-3xl text-sm text-muted-foreground sm:text-base">
          {pageSubtitle}
        </p>
        <p className="mt-4 text-sm font-semibold text-primary">
          {PRICING.noCommission}
        </p>
        <p className="mx-auto mt-2 max-w-3xl text-xs text-muted-foreground">
          {PRICING.unlimitedSignups}
        </p>
      </section>

      {plans.length > 0 ? (
        <section className="grid gap-5 md:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard key={plan.slug} plan={plan} ctaLabel={ctaLabel} />
          ))}
        </section>
      ) : (
        <p className="rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">
          {PRICING.plansUnavailable}
        </p>
      )}

      <section className="mt-8 rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">{PRICING.storageTitle}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {PRICING.storageBody}
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>• {PRICING.storagePoints.included}</li>
          <li>• {PRICING.storagePoints.overage}</li>
          <li>• {PRICING.storagePoints.upgrade}</li>
        </ul>
      </section>

      <section className="mt-8 rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">{PRICING.trialTitle}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {PRICING.trialBody}
        </p>
      </section>

      <section className="mt-8 text-center">
        <Link
          href="/auth/register"
          className="inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          {ctaLabel}
        </Link>
      </section>
    </main>
  );
}
