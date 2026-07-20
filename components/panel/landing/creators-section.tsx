import Image from "next/image";

import type { StoreSummary } from "@/lib/api/types";
import { env } from "@/lib/env";
import { buildAcademySubdomainUrl } from "@/lib/utils";

import { Container } from "./landing-container";
import { LANDING } from "./landing.messages";
import { SectionHeading } from "./section-heading";

type Props = {
  academies: StoreSummary[];
};

type Card = {
  key: string;
  name: string;
  role: string;
  followers: string;
  image: string;
  mobile: string;
  href?: string;
};

/**
 * Showcases academies running on the platform. Each block pairs the desktop
 * view with a phone frame so a visitor sees both surfaces of one academy at a
 * glance. Real tenants are used when the API returns any; the curated
 * placeholders only fill in so the section never renders empty.
 */
export function CreatorsSection({ academies }: Props) {
  const preset = LANDING.creators.items;
  const live = academies.filter((academy) => Boolean(academy.slug)).slice(0, 6);

  const cards: Card[] =
    live.length > 0
      ? live.map((academy, index) => {
          const fallback = preset[index % preset.length];
          return {
            key: String(academy.id),
            name: academy.name,
            role: fallback.role,
            followers: fallback.followers,
            image: fallback.image,
            mobile: fallback.mobile,
            href: buildAcademySubdomainUrl(academy.slug ?? "", env.appUrl),
          };
        })
      : preset.map((item) => ({
          key: item.id,
          name: item.name,
          role: item.role,
          followers: item.followers,
          image: item.image,
          mobile: item.mobile,
        }));

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
        <ul className="mx-auto flex w-max items-center gap-10 px-5 sm:px-8 lg:px-10">
          {cards.map((card) => {
            const Wrapper = card.href ? "a" : "div";

            return (
              <li key={card.key}>
                <Wrapper
                  {...(card.href ? { href: card.href } : {})}
                  className="group flex items-center"
                >
                  {/* Phone frame first in DOM so RTL places it on the right,
                      overlapping the desktop card — as in the design. Drawn in
                      CSS rather than shipped as an image so it stays crisp at
                      any size and follows the landing theme. */}
                  <span className="relative z-10 block h-[340px] w-[168px] shrink-0 rounded-[26px] bg-[#15181F] p-[5px] shadow-lp-card ring-1 ring-black/10">
                    <span className="relative block h-full w-full overflow-hidden rounded-[21px] bg-white">
                      <Image
                        src={card.mobile}
                        alt=""
                        fill
                        sizes="168px"
                        className="object-cover object-top"
                      />
                    </span>
                    <span className="absolute left-1/2 top-[5px] h-3.5 w-[52px] -translate-x-1/2 rounded-b-lg bg-[#15181F]" />
                  </span>

                  {/* Desktop view */}
                  <span className="relative -ms-12 block h-[300px] w-[236px] shrink-0 overflow-hidden rounded-2xl border border-lp-line">
                    <Image
                      src={card.image}
                      alt=""
                      fill
                      sizes="236px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-black/85 to-transparent" />
                    {/* ps-16 keeps the caption clear of the phone frame, which
                        overlaps this card's inline-start edge. */}
                    <span className="absolute inset-x-0 bottom-0 p-4 ps-16 text-white">
                      <span className="block text-[15px] font-bold">
                        {card.name}
                      </span>
                      <span className="mt-0.5 block text-[11px] opacity-80">
                        {card.followers}
                      </span>
                      <span className="mt-2.5 inline-flex rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-lp-ink">
                        {card.role}
                      </span>
                    </span>
                  </span>
                </Wrapper>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
