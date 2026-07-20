import Image from "next/image";
import { Code2, ShieldCheck, UserRound, Wallet, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { CircledWord } from "./circled-word";
import { Container } from "./landing-container";
import { LANDING } from "./landing.messages";
import { SectionHeading } from "./section-heading";

const ICONS: Record<string, LucideIcon> = {
  code: Code2,
  zap: Zap,
  user: UserRound,
  money: Wallet,
  shield: ShieldCheck,
};

export function WhySection() {
  return (
    <section data-lp-reveal className="bg-lp-surface-2 py-20 lg:py-28">
      <Container>
        <SectionHeading
          title={
            <>
              {LANDING.why.titleBefore}
              <CircledWord>{LANDING.why.titleCircled}</CircledWord>
              {LANDING.why.titleAfter}
            </>
          }
          subtitle={LANDING.why.subtitle}
        />

        {/* Bento: two rows of three columns, with one wide tile per row. */}
        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {LANDING.why.items.map((item) => {
            const Icon = ICONS[item.icon] ?? Zap;

            return (
              <article
                key={item.id}
                className={cn(
                  "flex gap-6 rounded-2xl border border-lp-line bg-white p-7 transition-colors hover:border-lp-mint/50",
                  item.wide ? "lg:col-span-2" : "lg:col-span-1"
                )}
              >
                <div className="flex-1">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lp-blue/10 text-lp-blue">
                    <Icon size={18} strokeWidth={2.2} aria-hidden="true" />
                  </span>
                  <h3 className="mt-6 text-[17px] font-bold text-lp-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-[14.5px] leading-[1.9] text-lp-muted">
                    {item.body}
                  </p>
                </div>

                {item.image ? (
                  <Image
                    src={item.image}
                    alt=""
                    width={360}
                    height={200}
                    className="hidden h-auto w-[190px] self-center rounded-xl lg:block"
                  />
                ) : null}
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
