import { Container } from "./landing-container";
import { LANDING } from "./landing.messages";
import { LandingShot } from "./landing-shot";
import { ProductFrame } from "./product-frame";
import { SectionHeading } from "./section-heading";

const VIEWS = LANDING.publish.views;

type Props = {
  registerUrl: string;
  pricingUrl: string;
};

export function PublishSection({ registerUrl, pricingUrl }: Props) {
  return (
    <section
      id="publish"
      data-lp-reveal
      className="scroll-mt-32 bg-lp-surface py-20 lg:py-28"
    >
      <Container>
        <SectionHeading
          title={LANDING.publish.title}
          subtitle={LANDING.publish.subtitle}
        />

        <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <a
            href={registerUrl}
            className="flex h-14 items-center justify-center rounded-lp bg-lp-mint px-8 text-[16px] font-bold text-lp-ink shadow-lp-mint transition-transform hover:-translate-y-0.5"
          >
            {LANDING.publish.ctaPrimary}
          </a>
          <a
            href={pricingUrl}
            className="flex h-14 items-center justify-center rounded-lp border border-lp-line-2 bg-white px-8 text-[15px] font-semibold text-lp-ink transition-colors hover:border-lp-ink/25"
          >
            {LANDING.publish.ctaSecondary}
          </a>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-2 lg:gap-10">
          {VIEWS.map((view) => (
            <div key={view.id} className="flex flex-col gap-5">
              <div>
                <h3 className="flex items-center gap-2.5 text-[17px] font-bold text-lp-ink">
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 shrink-0 rounded-full bg-lp-mint"
                  />
                  {view.title}
                </h3>
                <p className="mt-2.5 text-[14.5px] leading-[1.85] text-lp-muted">
                  {view.body}
                </p>
              </div>

              <ProductFrame className="w-full">
                <div className="relative aspect-1440/768 w-full">
                  <LandingShot
                    src={view.image}
                    alt={view.alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 580px"
                    className="object-cover object-top"
                  />
                </div>
              </ProductFrame>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
