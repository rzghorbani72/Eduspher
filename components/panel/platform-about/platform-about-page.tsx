import { ChevronLeft, TrendingUp, UserRound, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { CircledWord } from "../landing/circled-word";
import { Container } from "../landing/landing-container";
import { LandingShell } from "../landing/landing-shell";
import { SectionHeading } from "../landing/section-heading";
import { ABOUT } from "./about.messages";

const ICONS: Record<string, LucideIcon> = {
  zap: Zap,
  user: UserRound,
  growth: TrendingUp,
};

type Props = {
  adminLoginUrl: string;
  adminRegisterUrl: string;
};

export function PlatformAboutPage({ adminLoginUrl, adminRegisterUrl }: Props) {
  return (
    <LandingShell loginUrl={adminLoginUrl} registerUrl={adminRegisterUrl}>
      <section className="bg-lp-hero pb-16 pt-36 lg:pb-20 lg:pt-44">
        <Container>
          <SectionHeading
            as="h1"
            eyebrow={ABOUT.hero.eyebrow}
            title={
              <>
                {ABOUT.hero.titleLead}
                <CircledWord>{ABOUT.hero.titleCircled}</CircledWord>
                {ABOUT.hero.titleAfter}
              </>
            }
            subtitle={ABOUT.hero.subtitle}
          />
        </Container>
      </section>

      <section className="bg-lp-surface py-16 lg:py-24">
        <Container>
          <div className="grid items-center gap-8 rounded-3xl border border-lp-line bg-white p-8 shadow-lp-card lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:p-12">
            <div>
              <h2 className="text-[26px] font-extrabold leading-tight tracking-[-0.022em] text-lp-ink lg:text-[32px]">
                {ABOUT.story.title}
              </h2>
              {ABOUT.story.paragraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-5 text-[15px] leading-[1.95] text-lp-muted lg:text-base"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="grid min-h-[240px] place-items-center rounded-2xl border border-lp-line bg-lp-mint/10 p-8">
              <div className="flex w-full max-w-[280px] flex-col gap-3">
                {[0, 1, 2].map((row) => (
                  <div
                    key={row}
                    className="flex items-center gap-3 rounded-xl bg-white p-3.5 shadow-lp-nav"
                  >
                    <span className="h-8 w-8 shrink-0 rounded-lg bg-lp-mint" />
                    <span className="h-2 flex-1 rounded-full bg-lp-line-2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-lp-surface-2 py-16 lg:py-24">
        <Container>
          <SectionHeading
            title={ABOUT.values.title}
            subtitle={ABOUT.values.subtitle}
          />

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {ABOUT.values.items.map((item) => {
              const Icon = ICONS[item.icon] ?? Zap;

              return (
                <article
                  key={item.id}
                  className="rounded-2xl border border-lp-line bg-white p-7 transition-colors hover:border-lp-mint/50"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lp-blue/10 text-lp-blue">
                    <Icon size={18} strokeWidth={2.2} aria-hidden="true" />
                  </span>
                  <h3 className="mt-6 text-[17px] font-bold text-lp-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-[14.5px] leading-[1.9] text-lp-muted">
                    {item.body}
                  </p>
                </article>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="bg-lp-surface py-16 lg:py-24">
        <Container>
          <SectionHeading
            title={ABOUT.team.title}
            subtitle={ABOUT.team.subtitle}
          />

          <div className="mx-auto mt-12 grid max-w-[540px] gap-5 sm:grid-cols-2">
            {ABOUT.team.members.map((member) => (
              <article
                key={member.id}
                className="rounded-2xl border border-lp-line bg-white p-7 text-center transition-colors hover:border-lp-mint/50"
              >
                <Image
                  src={member.photo}
                  alt={member.name}
                  width={80}
                  height={80}
                  className="mx-auto h-20 w-20 rounded-full object-cover"
                />
                <h3 className="mt-5 text-[15px] font-bold text-lp-ink">
                  {member.name}
                </h3>
                <p className="mt-1 text-[13px] text-lp-muted">{member.role}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-lp-surface pb-20 lg:pb-28">
        <Container>
          <div className="relative overflow-hidden rounded-4xl border border-lp-mint/30 bg-linear-120 from-lp-mint/25 via-lp-mint/10 to-transparent px-8 py-20 text-center lg:py-24">
            <div className="relative mx-auto flex max-w-[640px] flex-col items-center">
              <h2 className="text-balance text-[30px] font-extrabold leading-tight tracking-[-0.022em] text-lp-ink sm:text-[38px] lg:text-[44px]">
                {ABOUT.cta.title}
              </h2>
              <p className="mt-4 text-base text-lp-muted lg:text-[17px]">
                {ABOUT.cta.subtitle}
              </p>

              <div className="mt-9 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
                <a
                  href={adminRegisterUrl}
                  className="group flex h-14 items-center justify-center gap-2 rounded-lp bg-lp-mint px-8 text-[16px] font-bold text-lp-ink shadow-lp-mint transition-transform hover:-translate-y-0.5"
                >
                  <ChevronLeft
                    size={17}
                    aria-hidden="true"
                    className="transition-transform group-hover:-translate-x-0.5"
                  />
                  {ABOUT.cta.primary}
                </a>
                <Link
                  href="/academies"
                  className="flex h-14 items-center justify-center rounded-lp border border-lp-line-2 bg-white px-8 text-[15px] font-semibold text-lp-ink transition-colors hover:border-lp-ink/25"
                >
                  {ABOUT.cta.secondary}
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </LandingShell>
  );
}
