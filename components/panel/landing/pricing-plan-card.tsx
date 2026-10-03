import type { PublicPlan } from '@/lib/api/server';
import { cn } from '@/lib/utils';

import { LANDING } from './landing.messages';
import { faNumber, priceFor, withPlanParams, type Cycle } from './pricing-math';
import { StartFreeLink } from './quick-signup/start-free-link';

const M = LANDING.pricing;

type Props = {
  plan: (typeof M.plans)[number];
  live: PublicPlan | undefined;
  cycle: Cycle;
  registerUrl: string;
};

export function PlanCard({ plan, live, cycle, registerUrl }: Props) {
  const features = live?.features?.length ? live.features : plan.features;
  const upcoming = live?.upcoming_price ?? null;

  return (
    <article
      className={cn(
        'relative flex flex-col rounded-[20px] bg-white p-6',
        plan.featured ? 'border-lp-mint shadow-lp-hot border-2' : 'border-lp-line border',
      )}
    >
      {plan.featured ? (
        <span className="bg-lp-mint text-lp-on-mint absolute start-[22px] -top-[13px] rounded-lg px-2.5 py-1.5 text-[11px] font-extrabold">
          {M.mostPopular}
        </span>
      ) : null}
      <div className="text-[18px] font-extrabold">{plan.name}</div>
      <div className="text-lp-faint mt-1 text-[12.5px]">{plan.tagline}</div>
      <div className="mt-5 text-[30px] font-extrabold tracking-tight">
        {priceFor(live, plan.id, cycle)}
      </div>
      <div className="text-lp-faint text-[12.5px]">
        {cycle === 'quarterly' ? M.perQuarter : M.perMonth}
      </div>
      {upcoming ? (
        <p className="text-lp-faint mt-2 text-[11px] leading-[1.7]">
          {M.upcomingPrice
            .replace('{price}', faNumber(upcoming.price_monthly_toman))
            .replace('{date}', new Date(upcoming.effective_at).toLocaleDateString('fa-IR'))}
        </p>
      ) : null}
      <ul className="mt-6 flex flex-1 flex-col gap-2.5 text-[13.5px]">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2">
            <span className="text-lp-blue font-bold">✓</span>
            {feature}
          </li>
        ))}
      </ul>
      <StartFreeLink
        href={withPlanParams(registerUrl, plan.id, cycle)}
        className={cn(
          'mt-7 hidden rounded-[13px] px-5 py-3.5 text-center text-[14.5px] md:block',
          plan.featured
            ? 'bg-lp-mint text-lp-on-mint font-extrabold'
            : 'border-lp-ink/16 hover:border-lp-ink/34 border-[1.5px] font-bold transition-colors',
        )}
      >
        {M.cta}
      </StartFreeLink>
    </article>
  );
}
