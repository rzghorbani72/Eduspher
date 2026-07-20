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
      className="relative overflow-hidden bg-[#F6F8FD] pb-20 pt-[132px] lg:pb-28 lg:pt-[180px]"
    >
      <Container className="relative z-10 grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-start">
          <h1 className="text-balance text-[32px] font-extrabold leading-[1.35] tracking-[-0.028em] text-lp-ink sm:text-[40px] lg:text-[46px]">
            {LANDING.hero.titleLead}
            <span className="text-lp-blue">{LANDING.hero.titleHighlight}</span>
          </h1>

          <p className="mt-5 max-w-[520px] text-pretty text-[15px] leading-[1.95] text-lp-muted lg:text-base">
            {LANDING.hero.subtitle}
          </p>

          <div className="mt-9 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
            <a
              href={registerUrl}
              className="flex h-14 items-center justify-center rounded-lp bg-lp-mint px-8 text-[15.5px] font-bold text-lp-ink shadow-lp-mint transition-transform hover:-translate-y-0.5"
            >
              {LANDING.hero.ctaPrimary}
            </a>
            <a
              href={demoUrl}
              className="flex h-14 items-center justify-center rounded-lp border border-lp-line-2 bg-white px-8 text-[14.5px] font-semibold text-lp-ink transition-colors hover:border-lp-ink/25"
            >
              {LANDING.hero.ctaSecondary}
            </a>
          </div>

          <ul className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 lg:justify-start">
            {LANDING.hero.bullets.map((bullet) => (
              <li
                key={bullet}
                className="flex items-center gap-2 text-[13px] text-lp-muted"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-lp-mint" />
                {bullet}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center justify-center">
          {/* Dotted world map sits behind the call window and is what the hero
              scroll animation rotates/zooms — it reads as "teach anywhere". */}
          <div
            data-lp="hero-earth"
            className="pointer-events-none absolute -inset-x-16 -inset-y-10 -z-10 will-change-transform"
          >
            <Image
              src="/landing/world-dots.svg"
              alt=""
              width={600}
              height={450}
              priority
              className="h-full w-full object-contain"
            />
          </div>

          <div className="w-full max-w-[470px] rounded-[10px] bg-white p-1 shadow-lp-card">
            <Image
              src="/landing/hero-call.svg"
              alt={LANDING.hero.panelAlt}
              width={470}
              height={420}
              priority
              className="h-auto w-full rounded-md"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
