'use client';

import { useState } from 'react';

import type { PublicPlan } from '@/lib/api/server';
import { cn } from '@/lib/utils';

import { LANDING } from './landing.messages';
import { PricingCompareTable } from './pricing-compare-table';
import { PlanCard } from './pricing-plan-card';
import type { Cycle } from './pricing-math';
import { PricingNotes } from './pricing-notes';
import { SectionLabel } from './section-label';

type Props = {
  registerUrl: string;
  /** Live plans; price and bullets come from here, catalog copy is the fallback. */
  plans?: PublicPlan[];
  /** "h1" when the section is the whole page, not a block on the landing page. */
  as?: 'h1' | 'h2';
};

const M = LANDING.pricing;

export function PricingSection({ registerUrl, plans = [], as: Heading = 'h2' }: Props) {
  const [cycle, setCycle] = useState<Cycle>('monthly');
  const livePlans = new Map(plans.map((plan) => [plan.slug, plan]));

  return (
    <section
      id="pricing"
      className="mx-auto max-w-[1180px] scroll-mt-24 px-5 py-16 md:px-7 md:py-24"
    >
      <SectionLabel number={M.number} label={M.label} />
      <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
        <Heading className="text-[27px] font-extrabold tracking-[-.015em] md:text-[40px]">
          {M.title}
        </Heading>
        <div
          role="group"
          className="bg-lp-stripe border-lp-ink/8 inline-flex items-center gap-1 rounded-2xl border p-1.5"
        >
          {(['monthly', 'quarterly'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setCycle(option)}
              aria-pressed={cycle === option}
              className={cn(
                'rounded-xl px-4 py-2.5 text-[13.5px] font-extrabold transition-colors',
                cycle === option
                  ? 'text-lp-ink bg-white shadow-[0_2px_8px_-4px_rgba(11,26,46,.35)]'
                  : 'text-lp-muted-2',
              )}
            >
              {M[option]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {M.plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            live={livePlans.get(plan.id)}
            cycle={cycle}
            registerUrl={registerUrl}
          />
        ))}
      </div>

      <PricingCompareTable livePlans={livePlans} />
      <PricingNotes />
    </section>
  );
}
