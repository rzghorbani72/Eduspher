import { LANDING } from './landing.messages';
import { StartFreeLink } from './quick-signup/start-free-link';

type Props = { registerUrl: string };

const M = LANDING.cta;

export function CtaSection({ registerUrl }: Props) {
  return (
    <section id="cta" className="mx-auto max-w-[1180px] px-5 py-16 md:px-7 md:py-24">
      <div className="bg-lp-ink relative overflow-hidden rounded-[28px] px-6 py-14 text-center text-white md:px-12 md:py-20">
        <span
          aria-hidden
          className="absolute -start-[90px] -bottom-[140px] size-[380px] rounded-full bg-[radial-gradient(circle,rgba(63,242,184,.22),rgba(63,242,184,0)_68%)]"
        />
        <span
          aria-hidden
          className="absolute -end-20 -top-[150px] size-[360px] rounded-full bg-[radial-gradient(circle,rgba(18,135,234,.28),rgba(18,135,234,0)_68%)]"
        />
        <div className="relative">
          <h2 className="mx-auto max-w-[680px] text-[27px] leading-[1.32] font-extrabold tracking-[-.015em] md:text-[42px]">
            {M.title}
          </h2>
          <p className="text-lp-sky-3 mx-auto mt-5 max-w-[620px] text-[16px] leading-loose">
            {M.subtitle}
          </p>
          <p className="text-lp-sky-2 mt-9 text-[12.5px] font-semibold">{M.trialNote}</p>
          <StartFreeLink
            href={registerUrl}
            className="rounded-lp bg-lp-mint text-lp-on-mint mt-3 inline-block px-8 py-4 text-[16.5px] font-extrabold transition-transform hover:-translate-y-0.5"
          >
            {M.primary}
          </StartFreeLink>
        </div>
      </div>
    </section>
  );
}
