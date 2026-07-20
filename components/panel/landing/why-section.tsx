import { CircledWord } from "./circled-word";
import { Container } from "./landing-container";
import { LANDING } from "./landing.messages";
import { SectionHeading } from "./section-heading";

export function WhySection() {
  return (
    <section data-lp-reveal className="bg-lp-surface-2 py-20 lg:py-28">
      <Container>
        <SectionHeading
          eyebrow={LANDING.why.eyebrow}
          title={
            <>
              {LANDING.why.titleBefore}
              <CircledWord>{LANDING.why.titleCircled}</CircledWord>
              {LANDING.why.titleAfter}
            </>
          }
          subtitle={LANDING.why.subtitle}
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          {LANDING.why.items.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-lp-line bg-white p-8 transition-colors hover:border-lp-mint/50"
            >
              <h3 className="text-[19px] font-bold text-lp-ink">{item.title}</h3>
              <p className="mt-3 text-[15px] leading-[1.9] text-lp-muted">
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
