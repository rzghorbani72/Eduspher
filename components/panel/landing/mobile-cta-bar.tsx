import { LANDING } from './landing.messages';
import { StartFreeLink } from './quick-signup/start-free-link';

type Props = { registerUrl: string };

const M = LANDING.cta;

/** Sticky bottom CTA on phones; the spacer keeps the footer reachable. */
export function MobileCtaBar({ registerUrl }: Props) {
  return (
    <>
      <div className="border-lp-line bg-lp-surface/96 fixed inset-x-0 bottom-0 z-50 flex items-center gap-3 border-t px-4 py-3 backdrop-blur-xl md:hidden">
        <div className="text-lp-muted-2 text-[11.5px] leading-[1.6] font-semibold">
          {M.mobileLine1}
          <br />
          {M.mobileLine2}
        </div>
        <StartFreeLink
          href={registerUrl}
          className="bg-lp-mint text-lp-on-mint ms-auto rounded-[13px] px-5 py-3 text-[15px] font-extrabold"
        >
          {M.primary}
        </StartFreeLink>
      </div>
      <div className="h-[78px] md:hidden" />
    </>
  );
}
