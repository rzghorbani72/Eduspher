import { LANDING } from "./landing.messages";
import { LandingShot } from "./landing-shot";

type Props = {
  registerUrl: string;
  demoUrl: string;
};

/**
 * The shot is full-bleed and already carries its own backdrop (mint blob + dot
 * grid), so the copy is overlaid on the empty start-side band of the photo
 * instead of sitting in a second grid column.
 *
 * Type follows the shared landing scale (`section-heading.tsx`), not the
 * photo's proportions — the hero has to read as the same page as everything
 * below it.
 */
export function HeroSection({ registerUrl, demoUrl }: Props) {
  return (
    <section
      data-lp="hero"
      className="relative overflow-hidden bg-lp-hero pt-[104px] lg:pt-[132px]"
    >
      <div className="relative flex flex-col">
        <LandingShot
          src={LANDING.hero.panelImage}
          alt={LANDING.hero.panelAlt}
          width={1750}
          height={860}
          priority
          sizes="100vw"
          className="order-2 h-auto w-full"
        />

        <div className="order-1 z-10 mx-auto flex w-full max-w-[560px] flex-col items-center px-5 pb-12 text-center lg:absolute lg:inset-y-0 lg:order-0 lg:mx-0 lg:w-[40%] lg:max-w-none lg:items-stretch lg:justify-center lg:px-0 lg:pb-0 lg:text-start lg:start-[6%]">
          <h1 className="text-balance text-[30px] font-extrabold leading-tight tracking-[-0.022em] text-lp-ink sm:text-[38px] lg:text-[40px] xl:text-[46px]">
            {LANDING.hero.titleLead}
            <span className="text-lp-blue">{LANDING.hero.titleHighlight}</span>
          </h1>

          <p className="mt-4 text-pretty text-base leading-[1.85] text-lp-muted lg:text-[17px]">
            {LANDING.hero.subtitle}
          </p>

          <div className="mt-9 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center lg:w-full">
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

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
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
      </div>
    </section>
  );
}
