import type { StoreSummary } from "@/lib/api/types";

import { Container } from "./landing-container";
import { LANDING } from "./landing.messages";

type Props = {
  academies: StoreSummary[];
};

export function LogosStrip({ academies }: Props) {
  const names =
    academies.length > 0
      ? academies.slice(0, 8).map((academy) => academy.name)
      : [...LANDING.logos.fallback];

  const track = [...names, ...names];

  return (
    <section className="border-y border-lp-line bg-white py-12">
      <Container>
        <p className="text-center text-[13px] font-medium tracking-wide text-lp-muted">
          {LANDING.logos.label}
        </p>

        <div className="mt-7 overflow-hidden mask-[linear-gradient(to_right,transparent,black_14%,black_86%,transparent)]">
          <div className="lp-marquee-strip flex w-max items-center gap-14">
            {track.map((name, index) => (
              <span
                key={`${name}-${index}`}
                className="whitespace-nowrap text-[17px] font-bold text-lp-ink/35"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
