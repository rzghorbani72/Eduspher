"use client";

import { useMemo, useState } from "react";

import { AcademyCardLink, type AcademyCard } from "@/components/panel/landing/academy-card";
import { LANDING } from "@/components/panel/landing/landing.messages";
import { formatNumber } from "@/lib/utils";

type Props = {
  cards: AcademyCard[];
};

export function AcademyDirectory({ cards }: Props) {
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return cards;
    return cards.filter(
      (card) =>
        card.name.toLowerCase().includes(term) ||
        card.handle.toLowerCase().includes(term),
    );
  }, [cards, query]);

  return (
    <>
      <div className="mx-auto mt-10 flex max-w-[520px] flex-col gap-2">
        <label htmlFor="academy-search" className="sr-only">
          {LANDING.academies.searchLabel}
        </label>
        {/* Plain input: components/ui/input paints itself with the academy
            theme tokens, which clash with the landing palette. */}
        <input
          id="academy-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={LANDING.academies.searchPlaceholder}
          className="h-12 w-full rounded-full border border-lp-line bg-lp-surface-2 px-5 text-[15px] text-lp-ink outline-hidden placeholder:text-lp-ink-2 focus:border-lp-mint"
        />
        <p className="text-center text-sm text-lp-ink-2">
          {formatNumber(visible.length, "fa")} {LANDING.academies.count}
        </p>
      </div>

      {visible.length === 0 ? (
        <p className="mt-14 text-center text-[15px] text-lp-ink-2">
          {LANDING.academies.empty}
        </p>
      ) : (
        <ul className="mt-14 flex flex-wrap justify-center gap-x-12 gap-y-14">
          {visible.map((card) => (
            <li key={card.key}>
              <AcademyCardLink card={card} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
