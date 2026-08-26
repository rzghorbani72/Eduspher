import { Container } from "./landing-container";
import { LANDING } from "./landing.messages";
import { SectionHeading } from "./section-heading";

export function FaqSection() {
  return (
    <section
      id="faq"
      data-lp-reveal
      className="bg-lp-surface-2 py-20 lg:py-28"
    >      <Container width="narrow">
        <SectionHeading title={LANDING.faq.title} />

        <div className="mt-12 overflow-hidden rounded-2xl border border-lp-line bg-white">
          {LANDING.faq.items.map((item, index) => (
            <details
              key={item.q}
              className="group border-lp-line px-6 not-last:border-b sm:px-8"
              open={index === 0}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-5 text-[15px] font-bold text-lp-ink marker:hidden sm:text-base">
                {item.q}
                <span
                  aria-hidden="true"
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-lp-line text-lg font-normal text-lp-muted transition-transform duration-200 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="pb-6 text-[15px] leading-[1.95] text-lp-muted">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
