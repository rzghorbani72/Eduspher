import { LANDING } from './landing.messages';
import { LandingShot } from './landing-shot';
import { SmartNavLink } from './smart-nav-link';
import { StartFreeLink } from './quick-signup/start-free-link';

type Props = {
  registerUrl: string;
  demoUrl: string;
  demoSectionId?: string;
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
export function HeroSection({ registerUrl, demoUrl, demoSectionId }: Props) {
  return (
    <section
      data-lp="hero"
      className="bg-lp-hero relative overflow-hidden pt-[104px] lg:pt-[132px]"
    >
      <div className="relative flex flex-col">
        <LandingShot
          src={LANDING.hero.panelImage}
          alt={LANDING.hero.panelAlt}
          width={1750}
          height={860}
          priority
          sizes="100vw"
          className="order-2 hidden h-auto w-full lg:block"
        />

        <div className="z-10 order-1 mx-auto flex w-full max-w-[560px] flex-col items-center px-5 pb-12 text-center lg:absolute lg:inset-y-0 lg:start-[6%] lg:order-0 lg:mx-0 lg:w-[40%] lg:max-w-none lg:items-stretch lg:justify-center lg:px-0 lg:pb-0 lg:text-start">
          <h1 className="text-lp-ink text-[30px] leading-tight font-extrabold tracking-[-0.022em] text-balance sm:text-[38px] lg:text-[40px] xl:text-[46px]">
            {LANDING.hero.titleLead}
            <span className="text-lp-blue">{LANDING.hero.titleHighlight}</span>
          </h1>

          <p className="text-lp-muted mt-4 text-base leading-[1.85] text-pretty lg:text-[17px]">
            {LANDING.hero.subtitle}
          </p>

          <div className="mt-9 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center lg:w-full">
            <StartFreeLink
              href={registerUrl}
              className="rounded-lp bg-lp-mint text-lp-ink shadow-lp-mint flex h-14 items-center justify-center px-8 text-[16px] font-bold transition-transform hover:-translate-y-0.5"
            >
              {LANDING.hero.ctaPrimary}
            </StartFreeLink>
            <SmartNavLink
              href={demoUrl}
              sectionId={demoSectionId}
              className="rounded-lp border-lp-line-2 text-lp-ink hover:border-lp-ink/25 flex h-14 items-center justify-center border bg-white px-8 text-[15px] font-semibold transition-colors"
            >
              {LANDING.hero.ctaSecondary}
            </SmartNavLink>
          </div>

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {LANDING.hero.bullets.map((bullet) => (
              <li key={bullet} className="text-lp-muted flex items-center gap-2 text-[13px]">
                <span className="bg-lp-mint h-1.5 w-1.5 shrink-0 rounded-full" />
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
