import Image from "next/image";

import type { StoreSummary } from "@/lib/api/types";
import { env } from "@/lib/env";
import { buildAcademySubdomainUrl, resolveAssetUrl } from "@/lib/utils";

import { Container } from "./landing-container";
import { LANDING } from "./landing.messages";
import { SectionHeading } from "./section-heading";

type Props = {
  academies: StoreSummary[];
};

type Card = {
  key: string;
  name: string;
  description: string | null;
  cover: string | null;
  href: string;
};

/**
 * Showcases academies actually running on the platform. Everything shown is
 * real: the name, the description and the cover come from the academy itself
 * and the card links to its live site. There is deliberately no placeholder
 * roster — an empty section is honest, an invented one is not.
 */
export function CreatorsSection({ academies }: Props) {
  const cards: Card[] = academies
    .filter((academy) => Boolean(academy.slug))
    .slice(0, 6)
    .map((academy) => ({
      key: String(academy.id),
      name: academy.name,
      description: academy.description ?? null,
      cover: resolveAssetUrl(
        academy.cover?.publicUrl ?? academy.logo?.publicUrl ?? null,
      ),
      href: buildAcademySubdomainUrl(academy.slug ?? "", env.appUrl),
    }));

  if (cards.length === 0) return null;

  return (
    <section
      id="examples"
      data-lp-reveal
      className="scroll-mt-32 bg-lp-surface-2 py-20 lg:py-28"
    >
      <Container>
        <SectionHeading
          title={LANDING.creators.title}
          subtitle={LANDING.creators.subtitle}
        />
      </Container>

      {/* Rail scrolls inside itself so the page body never scrolls sideways. */}
      <div className="mt-14 overflow-x-auto pb-6 [scrollbar-width:none]">
        <ul className="mx-auto flex w-max items-stretch gap-6 px-5 sm:px-8 lg:px-10">
          {cards.map((card) => (
            <li key={card.key}>
              <a
                href={card.href}
                className="lp-frame group flex h-full w-[280px] flex-col overflow-hidden text-start"
              >
                <span className="relative block h-[168px] w-full overflow-hidden bg-lp-surface-2">
                  {card.cover ? (
                    <Image
                      src={card.cover}
                      alt=""
                      fill
                      sizes="280px"
                      loading="lazy"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <span className="block h-full w-full bg-linear-to-br from-lp-mint/25 to-lp-blue/15" />
                  )}
                </span>

                <span className="flex flex-1 flex-col p-5">
                  <span className="block text-[15px] font-bold text-lp-ink">
                    {card.name}
                  </span>
                  {card.description ? (
                    <span className="mt-2 line-clamp-2 text-[13px] leading-[1.8] text-lp-muted">
                      {card.description}
                    </span>
                  ) : null}
                  <span className="mt-4 text-[12.5px] font-semibold text-lp-blue">
                    {LANDING.creators.visit}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
