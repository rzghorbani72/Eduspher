import Link from 'next/link';

import type { StoreSummary } from '@/lib/api/types';

import { AcademyCardLink, sortAcademyCards, toAcademyCard } from './academy-card';
import { Container } from './landing-container';
import { LANDING } from './landing.messages';
import { SectionHeading } from './section-heading';

type Props = {
  academies: StoreSummary[];
};

/**
 * Landing highlights academies with both card + phone shots first; the full
 * published roster lives on /academies. Nav links (and the hero/CTA "see
 * examples" buttons) point here on the home page, so this section must
 * always render something as long as any academy is published.
 */
export function CreatorsSection({ academies }: Props) {
  const cards = sortAcademyCards(
    academies.filter((academy) => Boolean(academy.slug)).map(toAcademyCard),
  ).slice(0, 3);

  if (cards.length === 0) return null;

  return (
    <section id="examples" data-lp-reveal className="bg-lp-surface scroll-mt-32 py-20 lg:py-28">
      <Container>
        <SectionHeading title={LANDING.creators.title} subtitle={LANDING.creators.subtitle} />
      </Container>

      {/* Rail scrolls inside itself so the page body never scrolls sideways. */}
      <div className="mt-14 overflow-x-auto pt-4 pb-8 [scrollbar-width:none] lg:mt-16">
        <ul className="mx-auto flex w-max items-start gap-12 px-5 sm:px-8 lg:px-10">
          {cards.map((card) => (
            <li key={card.key} className="shrink-0">
              <AcademyCardLink card={card} />
            </li>
          ))}
        </ul>
      </div>

      <Container className="flex justify-center">
        <Link
          href="/academies"
          className="border-lp-line bg-lp-surface-2 text-lp-ink hover:bg-lp-mint/15 inline-flex items-center rounded-full border px-6 py-3 text-[15px] font-bold transition-colors"
        >
          {LANDING.creators.viewAll}
        </Link>
      </Container>
    </section>
  );
}
