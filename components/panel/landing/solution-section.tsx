import { cn } from '@/lib/utils';

import { LANDING } from './landing.messages';
import { SectionLabel } from './section-label';

const M = LANDING.solution;

export function SolutionSection() {
  return (
    <section id="solution" className="mx-auto max-w-[1180px] px-5 py-16 md:px-7 md:py-24">
      <SectionLabel number={M.number} label={M.label} />
      <h2 className="mt-6 max-w-[760px] text-[27px] leading-[1.32] font-extrabold tracking-[-.015em] md:text-[40px]">
        {M.title}
      </h2>
      <div className="mt-10 grid gap-4 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:items-stretch">
        <div className="from-lp-ink to-lp-navy-2 shadow-lp-navy flex flex-col justify-between rounded-[22px] bg-linear-150 p-6 text-white">
          <div>
            <div className="bg-lp-mint text-lp-on-mint w-fit rounded-[10px] px-3 py-1.5 text-[11.5px] font-extrabold">
              {M.card.badge}
            </div>
            <div className="mt-4 text-[22px] font-extrabold tracking-tight">{M.card.title}</div>
            <p className="text-lp-sky-3 mt-3 text-[13.5px] leading-loose">{M.card.body}</p>
          </div>
          <div className="text-lp-sky-2 mt-6 flex items-center gap-2 text-[11.5px] font-semibold">
            <span className="bg-lp-mint h-px w-4" />
            {M.card.foot}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {M.parts.map((part) => (
            <div
              key={part.title}
              className="border-lp-line hover:border-lp-blue-2/45 rounded-[18px] border bg-white p-4 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'size-[7px] rounded-sm',
                    part.tone === 'blue' ? 'bg-lp-blue-2' : 'bg-lp-mint',
                  )}
                />
                <span className="text-[15px] font-extrabold">{part.title}</span>
              </div>
              <div className="lp-stripe mt-3 h-[46px] rounded-xl" />
              <div className="text-lp-faint mt-2.5 text-[11.5px]">{part.meta}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
