import { HeroCopy } from './hero-copy';
import { HeroEditorMock } from './mockups/hero-editor-mock';
import { HeroPanelMock } from './mockups/hero-panel-mock';
import { HeroSiteMock } from './mockups/hero-site-mock';

type Props = { registerUrl: string };

export function HeroSection({ registerUrl }: Props) {
  return (
    <section id="hero" className="relative overflow-hidden">
      <span
        aria-hidden
        className="absolute -end-[160px] -top-[180px] size-[520px] rounded-full bg-[radial-gradient(circle,rgba(18,135,234,.10),rgba(18,135,234,0)_68%)]"
      />
      <span
        aria-hidden
        className="absolute -start-[140px] top-[180px] size-[460px] rounded-full bg-[radial-gradient(circle,rgba(63,242,184,.16),rgba(63,242,184,0)_66%)]"
      />

      <div className="relative mx-auto max-w-[1180px] px-5 pt-12 pb-14 md:px-7 md:pt-16 md:pb-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
          <HeroCopy registerUrl={registerUrl} />

          <div className="relative mx-auto w-full max-w-[560px] lg:px-6">
            <div className="relative">
              <div className="absolute start-0 top-0 hidden w-[66%] -rotate-[1.4deg] lg:block">
                <HeroSiteMock />
              </div>
              <div className="relative lg:ms-[14%] lg:mt-[92px]">
                <HeroPanelMock />
              </div>
              <div className="lp-float absolute -end-1.5 -bottom-[26px] hidden w-[190px] lg:block">
                <HeroEditorMock />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
