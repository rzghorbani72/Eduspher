"use client";

import Image from "next/image";
import Link from "next/link";

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
            className="flex shrink-0 items-center gap-4"
            aria-label={LANDING.nav.home}
          >
            {/* Brand lockup per Figma: mark 38px + wordmark, 16px gap. The mark
                carries its own mint/blue gradients, so it sits on the bare
                surface rather than inside a tinted tile. */}
            <Image
              src="/logo-mark.svg"
              alt=""
              width={38}
              height={38}
              priority
              className="h-[38px] w-[38px]"
            />
            {/* No `priority`: the wordmark is a 1KB SVG next to the mark, and
                every extra preload hint competes with the hero for bandwidth. */}
            <Image
              src="/logo-type.svg"
              alt=""
              width={52}
              height={16}
              className="hidden h-4 w-[52px] sm:block"
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
