import { cn } from '@/lib/utils';

import { LANDING } from '../landing.messages';
import { MockFrame } from '../mock-frame';

const M = LANDING.hero.panel;
const BARS = [36, 56, 42, 74, 50, 88, 62] as const;
const MINT_BARS = new Set([3, 5]);

function PanelSidebar() {
  return (
    <aside className="bg-lp-bar-2 border-lp-ink/6 flex flex-col gap-0.5 border-s px-[9px] py-3">
      <div className="text-lp-faint-2 px-2 py-[3px] text-[9px] tracking-[.04em]">
        {M.sidebarLabel}
      </div>
      {M.sidebar.map((item, index) => (
        <div
          key={item}
          className={cn(
            'flex items-center gap-[7px] rounded-lg px-2 py-[7px] text-[10.5px]',
            index === 0 ? 'bg-lp-mint-soft text-lp-green-2 font-extrabold' : 'text-lp-muted-2',
          )}
        >
          <span
            className={cn('size-[5px] rounded-sm', index === 0 ? 'bg-lp-green' : 'bg-[#cfd8e2]')}
          />
          {item}
        </div>
      ))}
    </aside>
  );
}

/** The manager's dashboard — the hero's main visual. */
export function HeroPanelMock() {
  return (
    <MockFrame title={M.title} dots={3} className="shadow-lp-frame-lg">
      <div className="grid grid-cols-[128px_minmax(0,1fr)]">
        <PanelSidebar />

        <div className="px-[15px] pt-[15px] pb-[17px]">
          <div className="flex items-center gap-2">
            <div className="text-[13px] font-extrabold">{M.greeting}</div>
            <div className="text-lp-blue bg-lp-blue-soft ms-auto rounded-full px-[9px] py-1 text-[9px] font-extrabold">
              {M.badge}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {M.stats.map((stat) => (
              <div key={stat.label} className="border-lp-ink/8 rounded-[11px] border p-[9px]">
                <div className="text-lp-faint text-[9px] whitespace-nowrap">{stat.label}</div>
                <div className="mt-0.5 text-[17px] font-extrabold">{stat.value}</div>
                <div className="text-lp-faint-2 text-[8px]">{stat.unit}</div>
              </div>
            ))}
            <div className="bg-lp-mint-tint text-lp-green rounded-[11px] border border-[rgba(10,127,92,.18)] p-[9px]">
              <div className="text-[9px] whitespace-nowrap">{M.commission.label}</div>
              <div className="mt-0.5 text-[17px] font-extrabold">{M.commission.value}</div>
              <div className="text-[8px]">{M.commission.unit}</div>
            </div>
          </div>

          <div className="border-lp-ink/8 mt-[9px] rounded-[11px] border p-[11px]">
            <div className="flex items-center">
              <div className="text-[10px] font-extrabold">{M.chartTitle}</div>
              <div className="text-lp-faint-2 ms-auto text-[8.5px]">{M.chartUnit}</div>
            </div>
            <div className="mt-[11px] flex h-[104px] items-end gap-1.5">
              {BARS.map((height, index) => (
                <div
                  key={index}
                  className={cn(
                    'lp-bar flex-1 rounded-[4px]',
                    MINT_BARS.has(index) ? 'bg-lp-mint' : 'bg-lp-blue-soft',
                  )}
                  style={{ height: `${height}%`, animationDelay: `${index * 0.06}s` }}
                />
              ))}
            </div>
          </div>

          <div className="border-lp-ink/8 mt-[9px] rounded-[11px] border p-[11px]">
            <div className="flex items-center">
              <div className="text-[10px] font-extrabold">{M.recentTitle}</div>
              <div className="text-lp-faint-2 ms-auto text-[8.5px]">{M.recentWhen}</div>
            </div>
            <div className="mt-[9px] flex flex-col gap-1.5">
              {M.recent.map((row, index) => (
                <div
                  key={row.text}
                  className="text-lp-muted flex items-center gap-[7px] text-[9.5px]"
                >
                  <span
                    className={cn(
                      'size-4 rounded-full',
                      index === 0 ? 'bg-lp-blue-soft' : 'bg-lp-mint-soft',
                    )}
                  />
                  {row.text}
                  <span className="text-lp-green ms-auto font-extrabold">{row.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MockFrame>
  );
}
