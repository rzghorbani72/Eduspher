import { ChevronLeft } from 'lucide-react';

import { Container } from './landing-container';
import { LANDING } from './landing.messages';
import { StartFreeLink } from './quick-signup/start-free-link';

type Props = {
  registerUrl: string;
  demoUrl: string;
};

export function CtaSection({ registerUrl, demoUrl }: Props) {
  return (
    <section data-lp-reveal className="bg-lp-surface py-20 lg:py-28">
      <Container>
        <div className="border-lp-mint/30 from-lp-mint/25 via-lp-mint/10 relative overflow-hidden rounded-4xl border bg-linear-120 to-transparent px-8 py-20 text-center lg:py-24">
          <div className="relative mx-auto flex max-w-[640px] flex-col items-center">
            <h2 className="text-lp-ink text-[30px] leading-tight font-extrabold tracking-[-0.022em] text-balance sm:text-[38px] lg:text-[44px]">
              {LANDING.cta.title}
            </h2>
            <p className="text-lp-muted mt-4 text-base lg:text-[17px]">{LANDING.cta.subtitle}</p>

            <div className="mt-9 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
              <StartFreeLink
                href={registerUrl}
                className="group rounded-lp bg-lp-mint text-lp-ink shadow-lp-mint flex h-14 items-center justify-center gap-2 px-8 text-[16px] font-bold transition-transform hover:-translate-y-0.5"
              >
                <ChevronLeft
                  size={17}
                  aria-hidden="true"
                  className="transition-transform group-hover:-translate-x-0.5"
                />
                {LANDING.cta.primary}
              </StartFreeLink>
              <a
                href={demoUrl}
                className="rounded-lp border-lp-line-2 text-lp-ink hover:border-lp-ink/25 flex h-14 items-center justify-center border bg-white px-8 text-[15px] font-semibold transition-colors"
              >
                {LANDING.cta.secondary}
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
