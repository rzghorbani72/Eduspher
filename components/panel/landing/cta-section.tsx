import { Container } from "./landing-container";
import { LANDING } from "./landing.messages";

type Props = {
  registerUrl: string;
  demoUrl: string;
};

export function CtaSection({ registerUrl, demoUrl }: Props) {
  return (
    <section data-lp-reveal className="bg-lp-surface py-20 lg:py-28">
      <Container>
        <div className="relative overflow-hidden rounded-4xl border border-lp-mint/30 bg-linear-120 from-lp-mint/25 via-lp-mint/10 to-transparent px-8 py-20 text-center lg:py-24">
          <div className="relative mx-auto flex max-w-[640px] flex-col items-center">
            <h2 className="text-balance text-[30px] font-extrabold leading-tight tracking-[-0.022em] text-lp-ink sm:text-[38px] lg:text-[44px]">
              {LANDING.cta.title}
            </h2>
            <p className="mt-4 text-base text-lp-muted lg:text-[17px]">
              {LANDING.cta.subtitle}
            </p>

            <div className="mt-9 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
              <a
                href={registerUrl}
                className="flex h-14 items-center justify-center rounded-lp bg-lp-mint px-8 text-[16px] font-bold text-lp-ink shadow-lp-mint transition-transform hover:-translate-y-0.5"
              >
                {LANDING.cta.primary}
              </a>
              <a
                href={demoUrl}
                className="flex h-14 items-center justify-center rounded-lp border border-lp-line-2 bg-white px-8 text-[15px] font-semibold text-lp-ink transition-colors hover:border-lp-ink/25"
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
