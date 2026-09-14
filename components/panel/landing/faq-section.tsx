import { Container } from './landing-container';
import { LANDING } from './landing.messages';
import { SectionHeading } from './section-heading';

export function FaqSection() {
  return (
    <section id="faq" data-lp-reveal className="bg-lp-surface-2 py-20 lg:py-28">
      {' '}
      <Container width="narrow">
        <SectionHeading title={LANDING.faq.title} />

        <div className="border-lp-line mt-12 overflow-hidden rounded-2xl border bg-white">
          {LANDING.faq.items.map((item, index) => (
            <details
              key={item.q}
              className="group border-lp-line px-6 not-last:border-b sm:px-8"
              open={index === 0}
            >
              <summary className="text-lp-ink flex cursor-pointer list-none items-center justify-between gap-5 py-5 text-[15px] font-bold marker:hidden sm:text-base">
                {item.q}
                <span
                  aria-hidden="true"
                  className="border-lp-line text-lp-muted grid h-7 w-7 shrink-0 place-items-center rounded-full border text-lg font-normal transition-transform duration-200 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="text-lp-muted pb-6 text-[15px] leading-[1.95]">{item.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
