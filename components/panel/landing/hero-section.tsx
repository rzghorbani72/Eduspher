import Image from "next/image";

import { Container } from "./landing-container";
import { LANDING } from "./landing.messages";

type Props = {
  registerUrl: string;
  demoUrl: string;
};

export function HeroSection({ registerUrl, demoUrl }: Props) {
  return (
    <section
      data-lp="hero"
      className="relative overflow-hidden pb-20 pt-[132px] lg:pb-32 lg:pt-[196px]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[#4F8CFF]/[0.04]" />

      {/* Earth sits behind the whole section, not inside a column, so it can be
          larger than the layout grid and still be clipped by the section. */}
      <div
        data-lp="hero-earth"
        className="pointer-events-none absolute end-[-16%] top-1/2 hidden -translate-y-1/2 opacity-55 sm:block will-change-transform"
      >
        <Image
          src="/landing/hero-earth.svg"
          alt=""
          width={1020}
          height={1020}
          priority
          className="h-[440px] w-[440px] max-w-none lg:h-[720px] lg:w-[720px]"
        />
      </div>

      <Container className="relative z-10 grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-start">
          <span className="inline-flex items-center gap-2 rounded-full border border-lp-line bg-white/70 px-4 py-1.5 text-[13px] font-semibold text-lp-ink-2 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-lp-mint" />
            {LANDING.hero.eyebrow}
          </span>

          <h1 className="mt-6 text-balance text-[34px] font-extrabold leading-[1.3] tracking-[-0.028em] text-lp-ink sm:text-[44px] lg:text-[52px] lg:leading-[1.32]">
            {LANDING.hero.titleLead}
            <span className="text-lp-blue">{LANDING.hero.titleHighlight}</span>
          </h1>

          <p className="mt-5 max-w-[540px] text-pretty text-base leading-[1.9] text-lp-muted lg:text-[18px]">
            {LANDING.hero.subtitle}
          </p>

          <div className="mt-9 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
            <a
              href={registerUrl}
              className="flex h-14 items-center justify-center rounded-lp bg-lp-mint px-8 text-[16px] font-bold text-lp-ink shadow-lp-mint transition-transform hover:-translate-y-0.5"
            >
              {LANDING.hero.ctaPrimary}
            </a>
            <a
              href={demoUrl}
              className="flex h-14 items-center justify-center rounded-lp border border-lp-line-2 bg-white px-8 text-[15px] font-semibold text-lp-ink transition-colors hover:border-lp-ink/25"
            >
              {LANDING.hero.ctaSecondary}
            </a>
          </div>

          <ul className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 lg:justify-start">
            {LANDING.hero.bullets.map((bullet) => (
              <li
                key={bullet}
                className="flex items-center gap-2 text-[13.5px] text-lp-muted"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-lp-green" />
                {bullet}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-center">
          <div className="w-full max-w-[520px] rounded-2xl border border-lp-line bg-white/80 p-2 shadow-lp-card backdrop-blur-sm">
            <Image
              src="/landing/hero-panel.svg"
              alt={LANDING.hero.panelAlt}
              width={1014}
              height={908}
              priority
              className="h-auto w-full rounded-xl"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
