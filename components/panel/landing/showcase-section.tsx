import { Container } from "./landing-container";
import { LANDING } from "./landing.messages";
import { SectionHeading } from "./section-heading";

export function ShowcaseSection() {
  return (
    <section data-lp-reveal className="bg-lp-surface-2 py-20 lg:py-28">
      <Container>
        <SectionHeading
          eyebrow={LANDING.showcase.eyebrow}
          title={LANDING.showcase.title}
          subtitle={LANDING.showcase.subtitle}
        />

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-lp-line bg-lp-line sm:grid-cols-2 lg:grid-cols-3">
          {LANDING.showcase.items.map((item) => (
            <article
              key={item.title}
              className="bg-white p-8 transition-colors hover:bg-lp-mint/4"
            >
              <h3 className="text-[17px] font-bold text-lp-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-[1.9] text-lp-muted">
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
