import { LANDING } from './landing.messages';
import { SectionLabel } from './section-label';

const M = LANDING.faq;

export function FaqSection() {
  return (
    <section id="faq" className="bg-lp-surface-2 border-lp-ink/8 border-y">
      <div className="mx-auto max-w-[1180px] px-5 py-16 md:px-7 md:py-24">
        <SectionLabel number={M.number} label={M.label} />
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
          <div>
            <h2 className="text-[27px] font-extrabold tracking-[-.015em] md:text-[38px]">
              {M.title}
            </h2>
            <p className="text-lp-muted mt-4 text-[15px] leading-loose">{M.subtitle}</p>
          </div>
          <div className="flex flex-col gap-2.5">
            {M.items.map((item) => (
              <details
                key={item.q}
                className="group border-lp-line rounded-[18px] border bg-white px-5"
              >
                <summary className="flex cursor-pointer items-center gap-3 py-4 text-[15px] font-bold">
                  {item.q}
                  <span
                    aria-hidden
                    className="text-lp-blue ms-auto text-[16px] font-normal transition-transform duration-[180ms] group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="text-lp-muted pb-4 text-[14.5px] leading-loose">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
