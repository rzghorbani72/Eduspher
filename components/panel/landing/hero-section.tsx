import { HeroCopy } from './hero-copy';
import { HeroEditorMock } from './mockups/hero-editor-mock';
import { HeroPanelMock } from './mockups/hero-panel-mock';
import { HeroSiteMock } from './mockups/hero-site-mock';

type Props = { registerUrl: string };

export function HeroSection({ registerUrl }: Props) {
  return (
    <section id="hero" className="relative overflow-x-clip">
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

          <div className="relative mx-auto hidden w-full max-w-[600px] lg:block lg:pb-8">
            <div className="relative lg:pt-[84px]">
              <div className="absolute start-0 top-0 hidden w-[60%] -rotate-[1.4deg] lg:block">
                <HeroSiteMock />
              </div>
              <div className="relative z-10 lg:ms-[12%]">
                <HeroPanelMock />
              </div>
              <div className="lp-float absolute -end-3 -bottom-8 z-20 hidden w-[190px] lg:block">
                <HeroEditorMock />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
