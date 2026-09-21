import { cn } from '@/lib/utils';

import { LANDING } from './landing.messages';
import { StartFreeLink } from './quick-signup/start-free-link';

type Props = { registerUrl: string };

const M = LANDING.hero;

export function HeroCopy({ registerUrl }: Props) {
  return (
    <div>
      <span className="border-lp-line text-lp-ink-2 inline-flex items-center gap-2.5 rounded-full border bg-white py-2 ps-2.5 pe-4 text-[12.5px] font-semibold shadow-[0_2px_10px_-6px_rgba(11,26,46,.3)]">
        <span className="inline-flex gap-[3px]">
          <span className="bg-lp-blue-2 size-1.5 rounded-sm" />
          <span className="bg-lp-mint size-1.5 rounded-sm" />
        </span>
        {M.badge}
      </span>

      <h1 className="mt-6 text-[36px] leading-[1.22] font-extrabold tracking-[-.02em] md:text-[58px]">
        {M.titleLead}{' '}
        <span className="relative inline-block whitespace-nowrap">
          <span
            aria-hidden
            className="bg-lp-mint absolute -inset-x-1.5 bottom-0.5 h-[18px] -rotate-[.6deg] rounded-[3px]"
          />
          <span className="relative">{M.titleHighlight}</span>
        </span>{' '}
        {M.titleTail}
      </h1>

      <p className="text-lp-muted mt-6 max-w-[540px] text-[17px] leading-loose md:text-[18.5px]">
        {M.subtitleLead}
        <strong className="text-lp-ink font-extrabold">{M.subtitleStrong1}</strong>
        {M.subtitleMid}
        <strong className="text-lp-ink font-extrabold">{M.subtitleStrong2}</strong>
        {M.subtitleTail}
      </p>

      <div className="mt-9">
        <p className="text-lp-faint text-[12.5px] font-semibold">{M.trialNote}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <StartFreeLink
            href={registerUrl}
            className="rounded-lp bg-lp-mint text-lp-on-mint shadow-lp-mint px-7 py-4 text-[16.5px] font-extrabold whitespace-nowrap transition-transform hover:-translate-y-0.5"
          >
            {M.ctaPrimary}
          </StartFreeLink>
          <a
            href="#steps"
            className="rounded-lp border-lp-line-2 text-lp-ink hover:border-lp-ink/32 border-[1.5px] bg-white px-6 py-4 text-[16px] font-bold whitespace-nowrap transition-colors"
          >
            {M.ctaSecondary}
          </a>
        </div>
      </div>

      <ul className="border-lp-line mt-10 grid gap-x-6 gap-y-3 border-t pt-5 sm:grid-cols-3">
        {M.bullets.map((bullet) => (
          <li key={bullet.label} className="flex items-start gap-2.5">
            <span
              className={cn(
                'mt-[7px] size-[7px] shrink-0 rounded-sm',
                bullet.tone === 'mint' ? 'bg-lp-mint' : 'bg-lp-blue-2',
              )}
            />
            <span className="text-[15.5px] font-extrabold tracking-tight">{bullet.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
