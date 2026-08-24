"use client";

import Link from "next/link";

import { BrandLockup } from "@/components/brand/brand-lockup";
import { Container } from "./landing-container";
import { LANDING } from "./landing.messages";
import { ThemeToggle } from "./theme-toggle";
import { useHideOnScroll } from "./use-hide-on-scroll";

type Props = {
  loginUrl: string;
  registerUrl: string;
};

export function SiteHeader({ loginUrl, registerUrl }: Props) {
  const hidden = useHideOnScroll();

  return (
    <header
      data-hidden={hidden}
      className="lp-header fixed inset-x-0 top-0 z-50 py-4 lg:py-8"
    >
      <Container>
        <nav className="flex items-center justify-between gap-4 rounded-full border border-lp-line bg-white/66 px-4 py-2.5 shadow-lp-nav backdrop-blur-xl backdrop-saturate-150 lg:px-8">
          <Link
            href="/"
            className="shrink-0"
            aria-label={LANDING.nav.home}
          >
            <BrandLockup
              priority
              typeClassName="hidden sm:inline-block"
            />
          </Link>

          <div className="hidden items-center gap-1.5 lg:flex">
            {LANDING.nav.links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="rounded-full px-3.5 py-[9px] text-[15px] font-semibold leading-6 text-lp-ink-2 transition-colors hover:bg-lp-mint/15 hover:text-lp-ink"
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
            <a
              href={loginUrl}
              className="rounded-full px-4 py-2.5 text-[15px] font-semibold leading-6 text-lp-ink-2 transition-colors hover:text-lp-ink"
            >
              {LANDING.nav.login}
            </a>
            <a
              href={registerUrl}
              className="flex h-[53px] items-center justify-center rounded-lp bg-lp-mint px-5 text-[15px] font-bold leading-[26.37px] text-lp-ink shadow-lp-mint transition-transform hover:-translate-y-0.5 sm:text-[16.48px] lg:w-[186px] lg:px-0"
            >
              {LANDING.nav.cta}
            </a>
          </div>
        </nav>
      </Container>
    </header>
  );
}
