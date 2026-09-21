import type { PublicPlan } from '@/lib/api/server';
import { formatNumber } from '@/lib/utils';

export type Cycle = 'monthly' | 'quarterly';

const QUARTERLY_STEP = 500_000;
const QUARTERLY_DISCOUNT_RATE = 0.05;

/**
 * Only used when the API is unreachable, so the page renders a number instead
 * of a zero. The live plan row is authoritative.
 */
const FALLBACK_MONTHLY: Record<string, number> = {
  starter: 3_000_000,
  growth: 6_500_000,
  business: 11_000_000,
};

export const faNumber = (value: number): string => formatNumber(value, 'fa');

/** 3 × monthly, 5% off, floored to the 500k step — the catalog rule. */
export function quarterlyFromMonthly(monthly: number): number {
  const discounted = monthly * 3 * (1 - QUARTERLY_DISCOUNT_RATE);
  return Math.max(QUARTERLY_STEP, Math.floor(discounted / QUARTERLY_STEP) * QUARTERLY_STEP);
}

export function monthlyToman(live: PublicPlan | undefined, planId: string): number {
  return live?.price_monthly_toman ?? FALLBACK_MONTHLY[planId] ?? 0;
}

export function priceFor(live: PublicPlan | undefined, planId: string, cycle: Cycle): string {
  const monthly = monthlyToman(live, planId);
  return faNumber(cycle === 'quarterly' ? quarterlyFromMonthly(monthly) : monthly);
}

export function withPlanParams(url: string, planId: string, cycle: Cycle): string {
  const base = typeof window !== 'undefined' ? window.location.origin : 'https://admin.mentoma.ir';
  const target = new URL(url, base);
  target.searchParams.set('plan', planId);
  target.searchParams.set('period', cycle);
  return target.toString();
}
