import { Container } from "./landing-container";
import { LANDING } from "./landing.messages";
import { SectionHeading } from "./section-heading";

export function StepsSection() {
  return (
    <section data-lp-reveal className="bg-lp-surface py-20 lg:py-28">
      <Container>
        <SectionHeading
          eyebrow={LANDING.steps.eyebrow}
          title={LANDING.steps.title}
        />

        <ol className="mt-14 grid gap-4 lg:grid-cols-3">
          {LANDING.steps.items.map((step, index) => (
            <li
              key={step.number}
              className="relative rounded-2xl border border-lp-line bg-white p-8"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-lp-mint/15 text-lg font-black text-lp-ink">
                {step.number}
              </span>
              <h3 className="mt-6 text-[19px] font-bold text-lp-ink">
                {step.title}
              </h3>
              <p className="mt-2.5 text-[15px] leading-[1.9] text-lp-muted">
                {step.body}
              </p>

              {index < LANDING.steps.items.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute -start-2 top-1/2 hidden h-px w-4 bg-lp-line lg:block"
                />
              ) : null}
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
