import Image from "next/image";

import { CircledWord } from "./circled-word";
import { Container } from "./landing-container";
import { LANDING } from "./landing.messages";
import { SectionHeading } from "./section-heading";

export function ForYouSection() {
  return (
    <section
      id="features"
      data-lp-reveal
      className="scroll-mt-32 bg-lp-surface py-20 lg:py-28"
    >
      <Container>
        <SectionHeading
          title={
            <>
              <CircledWord>{LANDING.forYou.titleCircled}</CircledWord>
              {LANDING.forYou.titleAfter}
            </>
          }
          subtitle={LANDING.forYou.subtitle}
        />

        <div
          data-lp="grow-rail"
          className="mt-14 flex h-[300px] items-stretch gap-3 sm:h-[420px] lg:h-[560px] lg:gap-4"
        >
          {LANDING.forYou.slides.map((slide, index) => (
            <div
              key={slide.src}
              data-lp="grow-panel"
              style={{ flexGrow: index === 0 ? 6 : 1 }}
              className="relative min-w-0 flex-1 basis-0 overflow-hidden rounded-2xl border border-lp-line"
            >
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 1240px"
                className="object-cover object-top"
              />
            </div>
          ))}
        </div>

        <ul className="mx-auto mt-14 grid max-w-[900px] gap-4 sm:grid-cols-2">
          {LANDING.forYou.points.map((point) => (
            <li
              key={point}
              className="flex items-start gap-3.5 rounded-2xl border border-lp-line bg-white p-6"
            >
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-lp-mint" />
              <span className="text-[15px] leading-[1.8] text-lp-ink-2">
                {point}
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
