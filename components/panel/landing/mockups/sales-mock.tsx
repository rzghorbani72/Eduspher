import { cn } from '@/lib/utils';

import { LANDING } from '../landing.messages';
import { MockFrame } from '../mock-frame';

const M = LANDING.sales.mock;
const BARS = [32, 40, 36, 54, 46, 64, 56, 72, 60, 84, 70, 96] as const;

function barTone(index: number): string {
  if (index >= 9) return 'bg-lp-mint';
  if (index >= 5) return 'bg-lp-blue-mid';
  return 'bg-lp-blue-soft';
}

export function SalesMock() {
  return (
    <MockFrame title={M.title} dots={0} className="shadow-lp-frame-sm rounded-[20px]">
      <div className="p-4">
        <div className="grid gap-2.5 sm:grid-cols-4">
          {M.stats.map((stat) => (
            <div key={stat.label} className="border-lp-ink/8 rounded-2xl border p-3">
              <div className="text-lp-faint text-[10.5px]">{stat.label}</div>
              <div className="mt-1 text-[17px] font-extrabold">{stat.value}</div>
              <div className="text-lp-faint-2 text-[9.5px]">{stat.unit}</div>
            </div>
          ))}
          <div className="bg-lp-mint-tint text-lp-green rounded-2xl border border-[rgba(10,127,92,.18)] p-3">
            <div className="text-[10.5px]">{M.commission.label}</div>
            <div className="mt-1 text-[17px] font-extrabold">{M.commission.value}</div>
            <div className="text-[9.5px]">{M.commission.unit}</div>
          </div>
        </div>
        <div className="border-lp-ink/8 mt-3 rounded-2xl border p-3.5">
          <div className="flex items-center">
            <div className="text-[11.5px] font-extrabold">{M.chartTitle}</div>
            <div className="bg-lp-blue-soft text-lp-blue ms-auto rounded-lg px-2.5 py-1 text-[10px] font-bold">
              {M.export}
            </div>
          </div>
          <div className="mt-3.5 flex h-[100px] items-end gap-1.5">
            {BARS.map((height, index) => (
              <div
                key={index}
                className={cn('lp-bar flex-1 rounded-[4px]', barTone(index))}
                style={{ height: `${height}%`, animationDelay: `${index * 0.04}s` }}
              />
            ))}
          </div>
        </div>
        <div className="mt-3 grid gap-2">
          {M.courses.map((course) => (
            <div
              key={course.name}
              className="border-lp-ink/8 flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-[12px]"
            >
              <span className="font-bold">{course.name}</span>
              <span className="text-lp-faint">{course.count}</span>
              <span className="ms-auto font-extrabold">{course.total}</span>
            </div>
          ))}
        </div>
      </div>
    </MockFrame>
  );
}
