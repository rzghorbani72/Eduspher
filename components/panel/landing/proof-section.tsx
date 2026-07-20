import type { StoreSummary } from "@/lib/api/types";
import { env } from "@/lib/env";
import { buildAcademySubdomainUrl } from "@/lib/utils";

import { Container } from "./landing-container";
import { LANDING } from "./landing.messages";
import { SectionHeading } from "./section-heading";

type Props = {
  academies: StoreSummary[];
};

export function ProofSection({ academies }: Props) {
  const listed = academies.filter((academy) => Boolean(academy.slug)).slice(0, 6);

  return (
    <section
      id="examples"
      data-lp-reveal
      className="scroll-mt-32 bg-lp-surface py-20 lg:py-28"
    >
      <Container>
        <SectionHeading
          eyebrow={LANDING.proof.eyebrow}
          title={LANDING.proof.title}
          subtitle={LANDING.proof.subtitle}
        />

        {listed.length === 0 ? (
          <p className="mt-14 text-center text-[15px] text-lp-muted">
            {LANDING.proof.emptyState}
          </p>
        ) : (
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listed.map((academy) => (
              <a
                key={academy.id}
                href={buildAcademySubdomainUrl(academy.slug ?? "", env.appUrl)}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-lp-line bg-white p-7 transition-colors hover:border-lp-mint/50"
              >
                <span className="text-[17px] font-bold text-lp-ink">
                  {academy.name}
                </span>
                <span className="text-sm font-semibold text-lp-muted transition-colors group-hover:text-lp-ink">
                  {LANDING.proof.visit}
                </span>
              </a>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
