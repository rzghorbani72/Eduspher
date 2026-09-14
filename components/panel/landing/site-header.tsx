'use client';

import Link from 'next/link';

import { BrandLockup } from '@/components/brand/brand-lockup';
import { Container } from './landing-container';
import { LANDING } from './landing.messages';
import { ThemeToggle } from './theme-toggle';
import { useHideOnScroll } from './use-hide-on-scroll';
import { StartFreeLink } from './quick-signup/start-free-link';

type Props = {
  loginUrl: string;
  registerUrl: string;
};

export function SiteHeader({ loginUrl, registerUrl }: Props) {
  const hidden = useHideOnScroll();

  return (
    <header data-hidden={hidden} className="lp-header fixed inset-x-0 top-0 z-50 py-4 lg:py-8">
      <Container>
        <nav className="border-lp-line shadow-lp-nav flex items-center justify-between gap-4 rounded-full border bg-white/66 px-4 py-2.5 backdrop-blur-xl backdrop-saturate-150 lg:px-8">
          <Link href="/" className="shrink-0" aria-label={LANDING.nav.home}>
            <BrandLockup priority typeClassName="hidden sm:inline-block" />
          </Link>

          <div className="hidden items-center gap-1.5 lg:flex">
            {LANDING.nav.links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-lp-ink-2 hover:bg-lp-mint/15 hover:text-lp-ink rounded-full px-3.5 py-[9px] text-[15px] leading-6 font-semibold transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
            <a
              href={loginUrl}
              className="text-lp-ink-2 hover:text-lp-ink rounded-full px-4 py-2.5 text-[15px] leading-6 font-semibold transition-colors"
            >
              {LANDING.nav.login}
            </a>
            <StartFreeLink
              href={registerUrl}
              className="rounded-lp bg-lp-mint text-lp-ink shadow-lp-mint flex h-[53px] items-center justify-center px-5 text-[15px] leading-[26.37px] font-bold transition-transform hover:-translate-y-0.5 sm:text-[16.48px] lg:w-[186px] lg:px-0"
            >
              {LANDING.nav.cta}
            </StartFreeLink>
          </div>
        </nav>
      </Container>
    </header>
  );
}
