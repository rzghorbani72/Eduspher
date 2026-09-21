import { CheckList } from './check-list';
import { LANDING } from './landing.messages';
import { SiteEditorMock } from './mockups/site-editor-mock';
import { SectionLabel } from './section-label';

const M = LANDING.features;

export function FeaturesSection() {
  return (
    <section id="features" className="mx-auto max-w-[1180px] px-5 py-16 md:px-7 md:py-24">
      <SectionLabel number={M.number} label={M.label} />
      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] lg:items-center">
        <div>
          <h2 className="text-[27px] leading-[1.32] font-extrabold tracking-[-.015em] md:text-[38px]">
            {M.title}
          </h2>
          <p className="text-lp-muted mt-4 text-[16px] leading-loose">{M.subtitle}</p>
          <CheckList items={M.points} className="mt-7" />
        </div>
        <SiteEditorMock />
      </div>
    </section>
  );
}
