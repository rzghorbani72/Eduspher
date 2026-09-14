import { AppImage } from '@/components/ui/app-image';

import type { StoreSummary } from '@/lib/api/types';
import { env } from '@/lib/env';
import { buildAcademySubdomainUrl, resolveAssetUrl } from '@/lib/utils';

import { LANDING } from './landing.messages';

export type AcademyCard = {
  key: string;
  name: string;
  handle: string;
  description: string | null;
  desktop: string | null;
  mobile: string | null;
  href: string;
  /** Both landing shots exist — presentable enough to feature on the homepage. */
  featured: boolean;
};

export function toAcademyCard(academy: StoreSummary): AcademyCard {
  const desktop = resolveAssetUrl(academy.showcase_desktop?.publicUrl ?? null);
  const mobile = resolveAssetUrl(academy.showcase_mobile?.publicUrl ?? null);

  return {
    key: String(academy.id),
    name: academy.name,
    handle: `@${academy.slug ?? ''}`,
    description: academy.description ?? null,
    desktop,
    mobile,
    href: buildAcademySubdomainUrl(academy.slug ?? '', env.appUrl),
    featured: Boolean(desktop && mobile),
  };
}

/** Featured academies first, so the landing top-three is the curated set. */
export function sortAcademyCards(cards: AcademyCard[]): AcademyCard[] {
  return [...cards].sort(
    (a, b) => Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name),
  );
}

/**
 * Square card photo + overlapping phone. Both images are platform-uploaded
 * shots of the real academy — no logo fallback, no fake roster.
 */
export function AcademyCardLink({ card }: { card: AcademyCard }) {
  return (
    <a
      href={card.href}
      target="_blank"
      rel="noreferrer"
      aria-label={`${LANDING.creators.visit} ${card.name}`}
      className="group relative block h-[340px] w-[340px]"
    >
      <span className="bg-lp-surface-2 shadow-lp-card absolute start-0 bottom-0 block size-[272px] overflow-hidden rounded-[28px]">
        {card.desktop ? (
          <AppImage
            src={card.desktop}
            alt=""
            preset="card"
            fill
            sizes="272px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="from-lp-mint/25 to-lp-blue/15 block size-full bg-linear-to-br" />
        )}

        <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/40 to-transparent p-5 pt-16 text-start">
          <span className="block text-[17px] leading-tight font-bold text-white">{card.name}</span>
          <span className="mt-0.5 block text-[12px] text-white/70" dir="ltr">
            {card.handle}
          </span>
        </span>
      </span>

      <span className="shadow-lp-card absolute end-0 -top-1 block h-[328px] w-[148px] rounded-[30px] bg-[#1c1d22] p-[6px]">
        <span className="bg-lp-surface-2 relative block h-full w-full overflow-hidden rounded-[24px]">
          {card.mobile ? (
            <AppImage
              src={card.mobile}
              alt=""
              preset="card"
              fill
              sizes="148px"
              className="object-cover object-top"
            />
          ) : (
            <span className="from-lp-blue/20 to-lp-mint/20 block h-full w-full bg-linear-to-b" />
          )}
        </span>
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-[9px] mx-auto h-[5px] w-[40px] rounded-full bg-[#1c1d22]"
        />
      </span>
    </a>
  );
}
