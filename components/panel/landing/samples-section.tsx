import { AppImage } from '@/components/ui/app-image';
import type { StoreSummary } from '@/lib/api/types';

import { sortAcademyCards, toAcademyCard, type AcademyCard } from './academy-card';
import { LANDING } from './landing.messages';

type Props = { academies: StoreSummary[] };

const M = LANDING.samples;
const SHOT = 'grid h-44 place-items-center';
const MIN_SAMPLES = 3;

function RealCard({ card }: { card: AcademyCard }) {
  return (
    <article className="border-lp-line overflow-hidden rounded-[20px] border bg-white">
      <div className={`${SHOT} bg-lp-surface-2 relative overflow-hidden`}>
        {card.desktop ? (
          <AppImage
            src={card.desktop}
            alt={card.name}
            preset="card"
            fill
            sizes="(min-width:1024px) 380px, 100vw"
            className="object-cover object-top"
          />
        ) : (
          <iframe
            src={card.href}
            title={card.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            tabIndex={-1}
            className="pointer-events-none absolute inset-0 h-full w-full border-0 bg-white"
          />
        )}
      </div>
      <div className="border-lp-ink/8 border-t p-5">
        <div className="text-[15px] font-bold">{card.name}</div>
        <div className="text-lp-faint mt-1.5 text-[12.5px]" dir="ltr">
          {card.handle}
        </div>
        <a
          href={card.href}
          target="_blank"
          rel="noreferrer"
          className="text-lp-blue mt-4 inline-block text-[13px] font-bold"
        >
          {M.visit}
        </a>
      </div>
    </article>
  );
}

/**
 * Real published academies from `/academies/public` (active, listed, site
 * published). Hidden until at least three exist — no placeholder cards.
 */
export function SamplesSection({ academies }: Props) {
  const cards = sortAcademyCards(
    academies.filter((academy) => Boolean(academy.slug)).map(toAcademyCard),
  ).slice(0, MIN_SAMPLES);

  if (cards.length < MIN_SAMPLES) return null;

  return (
    <section id="samples" className="bg-lp-surface-2 border-lp-ink/8 border-y">
      <div className="mx-auto max-w-[1180px] px-5 py-16 md:px-7 md:py-24">
        <h2 className="mt-6 text-[27px] font-extrabold tracking-[-.015em] md:text-[38px]">
          {M.title}
        </h2>
        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <RealCard key={card.key} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}
