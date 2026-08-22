import { Container } from "./landing-container";
import { HeroGlobe } from "./hero-globe";
import { LANDING } from "./landing.messages";
import { LandingShot } from "./landing-shot";

type Props = {
  registerUrl: string;
  demoUrl: string;
};

export function HeroSection({ registerUrl, demoUrl }: Props) {
  return (
    <section
      data-lp="hero"
      className="relative overflow-hidden bg-lp-hero pb-20 pt-[132px] lg:pb-28 lg:pt-[180px]"
    >
      {/* Ambient orbs, same backdrop as the product dashboard. Static by
          design — animating a 110px blur this large is expensive. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <span className="lp-glow lp-glow-1 -top-40 start-[-8rem]" />
        <span className="lp-glow lp-glow-2 top-24 end-[-6rem]" />
        <span className="lp-glow lp-glow-3 -bottom-56 start-1/3" />
      </div>

      <Container className="relative z-10 grid items-center gap-14 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-16">
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

        <div className="relative flex items-center justify-center lg:justify-end lg:-me-10 xl:-me-20">
          {/* Dotted globe sits behind the product shot. The hero scroll scene
              feeds it a 0→1 progress it grows into — see landing-motion.tsx. */}
          <div
            data-lp="hero-earth"
            className="pointer-events-none absolute -inset-x-16 -inset-y-10 -z-10"
          >
            {/* Square + self-centering: the globe must not depend on the
                sibling shot's height to have a size of its own. */}
            <HeroGlobe className="absolute inset-x-0 top-1/2 aspect-square w-full -translate-y-1/2" />
          </div>

          <LandingShot
            src={LANDING.hero.panelImage}
            alt={LANDING.hero.panelAlt}
            width={1536}
            height={1024}
            priority
            sizes="(max-width: 1024px) 100vw, 820px"
            className="lp-shot-fade h-auto w-full max-w-[620px] lg:max-w-[820px] will-change-transform"
          />
        </div>
      </Container>
    </section>
  );
}
