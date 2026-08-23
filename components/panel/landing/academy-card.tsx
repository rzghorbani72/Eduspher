import { ArrowUpLeft } from "lucide-react";
import Image from "next/image";

import type { StoreSummary } from "@/lib/api/types";
import { env } from "@/lib/env";
import { buildAcademySubdomainUrl, resolveAssetUrl } from "@/lib/utils";

import { LANDING } from "./landing.messages";

export type AcademyCard = {
  key: string;
  name: string;
  handle: string;
  description: string | null;
  desktop: string | null;
  mobile: string | null;
  href: string;
  /** Platform-curated screenshots exist — the academy is presentable enough to feature. */
  featured: boolean;
};

export function toAcademyCard(academy: StoreSummary): AcademyCard {
  const logo = resolveAssetUrl(academy.logo?.publicUrl ?? null);
  // Platform-curated screenshots when they exist; branding is the fallback
  // so a not-yet-photographed academy still renders.
  const showcase = resolveAssetUrl(academy.showcase_desktop?.publicUrl ?? null);
  const desktop = showcase ?? resolveAssetUrl(academy.cover?.publicUrl ?? null);
  const mobile = resolveAssetUrl(academy.showcase_mobile?.publicUrl ?? null);

  return {
    key: String(academy.id),
    name: academy.name,
    handle: `@${academy.slug ?? ""}`,
    description: academy.description ?? null,
    desktop: desktop ?? logo,
    mobile: mobile ?? logo ?? desktop,
    href: buildAcademySubdomainUrl(academy.slug ?? "", env.appUrl),
    featured: Boolean(showcase),
  };
}

/** Featured academies first, so the landing top-three is the curated set. */
export function sortAcademyCards(cards: AcademyCard[]): AcademyCard[] {
  return [...cards].sort(
    (a, b) => Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name),
  );
}

/**
 * One academy shown twice: the wide card is the desktop view and the phone
 * beside it is the mobile view of the same site. Everything is real academy
 * data — there is deliberately no placeholder roster.
 */
export function AcademyCardLink({ card }: { card: AcademyCard }) {
  return (
    <a
      href={card.href}
      target="_blank"
      rel="noreferrer"
      className="group relative block h-[286px] w-[352px]"
    >
      {/* Desktop view */}
      <span className="absolute inset-y-0 start-0 block w-[288px] overflow-hidden rounded-[26px] bg-lp-surface-2 shadow-lp-card">
        {card.desktop ? (
          <Image
            src={card.desktop}
            alt=""
            fill
            sizes="288px"
            loading="lazy"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="block h-full w-full bg-linear-to-br from-lp-mint/25 to-lp-blue/15" />
        )}

        <span className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-1 bg-linear-to-t from-black/85 via-black/45 to-transparent p-4 pt-16 text-start">
          <span className="block text-[15px] font-bold leading-tight text-white">
            {card.name}
          </span>
          <span className="block text-[11.5px] text-white/65" dir="ltr">
            {card.handle}
          </span>
          {card.description ? (
            <span className="line-clamp-1 block max-w-[180px] text-[11.5px] text-white/75">
              {card.description}
            </span>
          ) : null}

          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-lp-ink">
            <ArrowUpLeft size={12} strokeWidth={2.5} aria-hidden="true" />
            {LANDING.creators.visit}
          </span>
        </span>
      </span>

      {/* Mobile view of the same academy */}
      <span className="absolute -top-3 bottom-1 end-0 block w-[124px] rounded-[22px] bg-[#15161c] p-[4px] shadow-lp-card">
        <span className="relative block h-full w-full overflow-hidden rounded-[18px] bg-lp-surface-2">
          {card.mobile ? (
            <Image
              src={card.mobile}
              alt=""
              fill
              sizes="124px"
              loading="lazy"
              className="object-cover"
            />
          ) : (
            <span className="block h-full w-full bg-linear-to-b from-lp-blue/20 to-lp-mint/20" />
          )}
        </span>
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-[7px] mx-auto h-[4px] w-[34px] rounded-full bg-[#15161c]"
        />
      </span>
    </a>
  );
}
