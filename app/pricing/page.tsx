import Link from "next/link";
import { notFound } from "next/navigation";

import { getPublicPricingConfig } from "@/lib/api/server";
import { getAcademyContext } from "@/lib/store-context";

export default async function PricingPage() {
  const storeContext = await getAcademyContext();
  if (storeContext.slug) {
    notFound();
  }

  const pricingConfig = await getPublicPricingConfig();
  const pageTitle = pricingConfig?.title || "Pricing Plans";
  const pageSubtitle =
    pricingConfig?.subtitle ||
    "Clear pricing for creators, mentors, and academy businesses. Built for scalable education on mentoryaracademy.com style operations.";
  const ctaLabel = pricingConfig?.cta_label || "Start With Your Plan";

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <section className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{pageTitle}</h1>
        <p className="mx-auto mt-3 max-w-3xl text-sm text-muted-foreground sm:text-base">
          {pageSubtitle}
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <article className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Group 1: Mentors & Creators</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Publish and sell online courses and optionally physical products.
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>- Public storefront and checkout</li>
            <li>- Course + product cart and payments</li>
            <li>- Platform revenue share on sales</li>
          </ul>
          <div className="mt-5 rounded-lg bg-muted p-3 text-sm">
            <p className="font-medium">Monetization</p>
            <p className="text-muted-foreground">
              Platform fee from transactions (based on plan).
            </p>
          </div>
        </article>

        <article className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">
            Group 2: Academy & Institute Businesses
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage teachers/students with external payment methods and academy
            operations.
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>- Monthly/annual subscription plan</li>
            <li>- Manual enrollment and subscription renewals</li>
            <li>- Per-student lesson lock/unlock and progress workflows</li>
          </ul>
          <div className="mt-5 rounded-lg bg-muted p-3 text-sm">
            <p className="font-medium">Monetization</p>
            <p className="text-muted-foreground">
              Subscription fee + upload overage fee when storage exceeds plan.
            </p>
          </div>
        </article>
      </section>

      <section className="mt-8 rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold">Upload / Storage Overage Policy</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Each plan includes a storage quota. If academy usage exceeds included
          GB, an automatic overage fee is added at renewal.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 pr-3">Plan</th>
                <th className="py-2 pr-3">Included Storage</th>
                <th className="py-2 pr-3">Overage Fee</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2 pr-3">Starter / Basic</td>
                <td className="py-2 pr-3">100 GB</td>
                <td className="py-2 pr-3">Per GB, configured by academy policy</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-3">Builder / Standard</td>
                <td className="py-2 pr-3">300 GB</td>
                <td className="py-2 pr-3">Per GB, configured by academy policy</td>
              </tr>
              <tr>
                <td className="py-2 pr-3">Growth / Premium</td>
                <td className="py-2 pr-3">1000 GB</td>
                <td className="py-2 pr-3">Per GB, configured by academy policy</td>
              </tr>
            </tbody>
          </table>
        </div>
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
