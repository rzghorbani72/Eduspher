import { AppImage } from '@/components/ui/app-image';
import type { StoreSummary } from '@/lib/api/types';

import { sortAcademyCards, toAcademyCard, type AcademyCard } from './academy-card';
import { LANDING } from './landing.messages';
import { SectionLabel } from './section-label';

type Props = { academies: StoreSummary[] };

const M = LANDING.samples;
const SHOT = 'grid h-44 place-items-center';

function PlaceholderCard() {
  return (
    <article className="border-lp-line overflow-hidden rounded-[20px] border bg-white">
      <div
        className={`${SHOT} lp-stripe [--lp-stripe-a:#e9eff5] [--lp-stripe-b:#f5f8fb] [--lp-stripe-s:8px]`}
      >
        <span className="text-lp-muted-2 rounded-xl bg-white/90 px-3 py-1.5 text-[11px] font-semibold">
          {M.placeholderShot}
        </span>
      </div>
      <div className="border-lp-ink/8 border-t p-5">
        <div className="text-lp-faint-3 text-[15px] font-bold">{M.placeholderName}</div>
        <div className="text-lp-faint-3 mt-1.5 text-[12.5px]">{M.placeholderType}</div>
        <div className="text-lp-faint-4 mt-4 text-[13px] font-bold">{M.visit}</div>
      </div>
    </article>
  );
}

function RealCard({ card }: { card: AcademyCard }) {
  return (
    <article className="border-lp-line overflow-hidden rounded-[20px] border bg-white">
      <div className={`${SHOT} bg-lp-surface-2 relative overflow-hidden`}>
        <AppImage
          src={card.desktop}
          alt={card.name}
          preset="card"
          fill
          sizes="(min-width:1024px) 380px, 100vw"
          className="object-cover object-top"
        />
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

/** Academies with a real screenshot when any exist; the design's placeholders otherwise. */
export function SamplesSection({ academies }: Props) {
  const cards = sortAcademyCards(
    academies.filter((academy) => Boolean(academy.slug)).map(toAcademyCard),
  )
    .filter((card) => Boolean(card.desktop))
    .slice(0, 3);

  return (
    <section id="samples" className="bg-lp-surface-2 border-lp-ink/8 border-y">
      <div className="mx-auto max-w-[1180px] px-5 py-16 md:px-7 md:py-24">
        <SectionLabel number={M.number} label={M.label} />
        <h2 className="mt-6 text-[27px] font-extrabold tracking-[-.015em] md:text-[38px]">
          {M.title}
        </h2>
        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.length > 0
            ? cards.map((card) => <RealCard key={card.key} card={card} />)
            : [0, 1, 2].map((i) => <PlaceholderCard key={i} />)}
        </div>
        {cards.length === 0 ? <p className="text-lp-faint mt-5 text-[13px]">{M.soon}</p> : null}
      </div>
    </section>
  );
}
