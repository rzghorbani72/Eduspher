import type { PublicPlan } from '@/lib/api/server';
import { cn } from '@/lib/utils';

import { LANDING } from './landing.messages';
import { faNumber, monthlyToman, quarterlyFromMonthly } from './pricing-math';

type Props = { livePlans: Map<string, PublicPlan> };

const M = LANDING.pricing;
const C = M.compare;
const PLAN_IDS = M.plans.map((plan) => plan.id);
const hot = (index: number) => index === 1 && 'bg-lp-mint-tint';
const cell = 'p-4 text-center';

function Row({ label, cells, bold }: { label: string; cells: readonly string[]; bold?: boolean }) {
  return (
    <tr className="border-lp-ink/6 border-t">
      <td className={cn('p-4', bold ? 'font-extrabold' : 'text-lp-muted-2')}>{label}</td>
      {cells.map((value, index) => (
        <td key={index} className={cn(cell, hot(index), bold && 'font-bold')}>
          {value}
        </td>
      ))}
    </tr>
  );
}

type CompareRow = (typeof C.rows)[number];
type LimitKey = keyof PublicPlan['limits'];

function limitCells(row: CompareRow, plans: Map<string, PublicPlan>): readonly string[] {
  const limit: LimitKey | null = row.limit;
  if (!limit) return row.values;
  const isGb = limit === 'storage_gb' || limit === 'monthly_traffic_gb';
  return PLAN_IDS.map((id, index) => {
    const live = plans.get(id);
    if (!live) return row.values[index];
    const value = faNumber(live.limits[limit]);
    return isGb ? `${value} ${M.gb}` : value;
  });
}

export function PricingCompareTable({ livePlans: plans }: Props) {
  const monthly = PLAN_IDS.map((id) => monthlyToman(plans.get(id), id));
  return (
    <div className="lp-rail border-lp-line mt-4 overflow-x-auto rounded-[20px] border bg-white">
      <table className="w-full min-w-[700px] border-collapse">
        <thead>
          <tr className="bg-lp-bar-2">
            <th className="text-lp-faint p-4 text-start text-[12.5px] font-bold">{C.title}</th>
            {M.plans.map((plan, index) => (
              <th key={plan.id} className={cn(cell, hot(index), 'text-[14px] font-extrabold')}>
                {plan.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-[13px]">
          <Row label={C.monthlyRow} bold cells={monthly.map((m) => `${faNumber(m)} ${M.toman}`)} />
          <Row
            label={C.quarterlyRow}
            bold
            cells={monthly.map((m) => `${faNumber(quarterlyFromMonthly(m))} ${M.toman}`)}
          />
          {C.rows.map((row) => (
            <Row key={row.label} label={row.label} cells={limitCells(row, plans)} />
          ))}
          <tr className="border-lp-ink/6 border-t">
            <td className="text-lp-muted-2 p-4">{C.domainRow}</td>
            {PLAN_IDS.map((id, index) => (
              <td key={id} className={cn(cell, hot(index), 'text-lp-green font-bold')}>
                ✓
              </td>
            ))}
          </tr>
          <tr className="border-lp-ink/6 border-t">
            <td className="p-4 font-extrabold">{C.commissionRow}</td>
            {PLAN_IDS.map((id, index) => (
              <td
                key={id}
                className={cn(cell, hot(index), 'text-lp-green text-[15px] font-extrabold')}
              >
                {C.commission}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
