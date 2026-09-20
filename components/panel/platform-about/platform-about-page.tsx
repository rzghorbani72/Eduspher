import { ChevronLeft, TrendingUp, UserRound, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';

import { CircledWord } from '../landing/circled-word';
import { Container } from '../landing/landing-container';
import { LandingShell } from '../landing/landing-shell';
import { SectionHeading } from '../landing/section-heading';
import { ABOUT } from './about.messages';

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
      <section className="bg-lp-hero pt-36 pb-16 lg:pt-44 lg:pb-20">
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
          <div className="border-lp-line shadow-lp-card grid items-center gap-8 rounded-3xl border bg-white p-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:p-12">
            <div>
              <h2 className="text-lp-ink text-[26px] leading-tight font-extrabold tracking-[-0.022em] lg:text-[32px]">
                {ABOUT.story.title}
              </h2>
              {ABOUT.story.paragraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-lp-muted mt-5 text-[15px] leading-[1.95] lg:text-base"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="border-lp-line bg-lp-mint/10 grid min-h-[240px] place-items-center rounded-2xl border p-8">
              <div className="flex w-full max-w-[280px] flex-col gap-3">
                {[0, 1, 2].map((row) => (
                  <div
                    key={row}
                    className="shadow-lp-nav flex items-center gap-3 rounded-xl bg-white p-3.5"
                  >
                    <span className="bg-lp-mint h-8 w-8 shrink-0 rounded-lg" />
                    <span className="bg-lp-line-2 h-2 flex-1 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-lp-surface-2 py-16 lg:py-24">
        <Container>
          <SectionHeading title={ABOUT.values.title} subtitle={ABOUT.values.subtitle} />

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {ABOUT.values.items.map((item) => {
              const Icon = ICONS[item.icon] ?? Zap;

              return (
                <article
                  key={item.id}
                  className="border-lp-line hover:border-lp-mint/50 rounded-2xl border bg-white p-7 transition-colors"
                >
                  <span className="bg-lp-blue/10 text-lp-blue flex h-10 w-10 items-center justify-center rounded-xl">
                    <Icon size={18} strokeWidth={2.2} aria-hidden="true" />
                  </span>
                  <h3 className="text-lp-ink mt-6 text-[17px] font-bold">{item.title}</h3>
                  <p className="text-lp-muted mt-2.5 text-[14.5px] leading-[1.9]">{item.body}</p>
                </article>
              );
            })}
          </div>
        </Container>
      </section>

      {/* <section className="bg-lp-surface py-16 lg:py-24">
        <Container>
          <SectionHeading title={ABOUT.team.title} subtitle={ABOUT.team.subtitle} />

          <div className="mx-auto mt-12 grid max-w-[540px] gap-5 sm:grid-cols-2">
            {ABOUT.team.members.map((member) => (
              <article
                key={member.id}
                className="border-lp-line hover:border-lp-mint/50 rounded-2xl border bg-white p-7 text-center transition-colors"
              >
                <AppImage
                  src={member.photo}
                  alt={member.name}
                  preset="thumb"
                  width={80}
                  height={80}
                  className="mx-auto h-20 w-20 rounded-full object-cover"
                />
                <h3 className="text-lp-ink mt-5 text-[15px] font-bold">{member.name}</h3>
                <p className="text-lp-muted mt-1 text-[13px]">{member.role}</p>
              </article>
            ))}
          </div>
        </Container>
      </section> */}

      <section className="bg-lp-surface pb-20 lg:pb-28">
        <Container>
          <div className="border-lp-mint/30 from-lp-mint/25 via-lp-mint/10 relative overflow-hidden rounded-4xl border bg-linear-120 to-transparent px-8 py-20 text-center lg:py-24">
            <div className="relative mx-auto flex max-w-[640px] flex-col items-center">
              <h2 className="text-lp-ink text-[30px] leading-tight font-extrabold tracking-[-0.022em] text-balance sm:text-[38px] lg:text-[44px]">
                {ABOUT.cta.title}
              </h2>
              <p className="text-lp-muted mt-4 text-base lg:text-[17px]">{ABOUT.cta.subtitle}</p>

              <div className="mt-9 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
                <a
                  href={adminRegisterUrl}
                  className="group rounded-lp bg-lp-mint text-lp-ink shadow-lp-mint flex h-14 items-center justify-center gap-2 px-8 text-[16px] font-bold transition-transform hover:-translate-y-0.5"
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
                  className="rounded-lp border-lp-line-2 text-lp-ink hover:border-lp-ink/25 flex h-14 items-center justify-center border bg-white px-8 text-[15px] font-semibold transition-colors"
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
