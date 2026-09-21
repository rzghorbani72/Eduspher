'use client';

import Link from 'next/link';
import { useState } from 'react';

import { cn } from '@/lib/utils';

import { BrandMark } from './brand-mark';
import { LANDING } from './landing.messages';
import { SmartNavLink } from './smart-nav-link';
import { ThemeToggle } from './theme-toggle';
import { StartFreeLink } from './quick-signup/start-free-link';

type Props = {
  loginUrl: string;
  registerUrl: string;
};

export function SiteHeader({ loginUrl, registerUrl }: Props) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-60 pt-3.5 pb-1.5">
      <div className="relative mx-auto max-w-[1240px] px-4 md:px-6">
        <div className="shadow-lp-nav flex h-16 items-center gap-5 rounded-full bg-white px-4 md:h-[72px] md:gap-7 md:px-6">
          <Link href="/" aria-label={LANDING.nav.home}>
            <BrandMark />
          </Link>

          <nav className="text-lp-muted hidden items-center gap-4 text-[13.5px] font-medium whitespace-nowrap md:flex lg:gap-7 lg:text-[14.5px]">
            {LANDING.nav.links.map(({ href, label, sectionId }) => (
              <SmartNavLink
                key={href}
                href={href}
                sectionId={sectionId}
                className="hover:text-lp-ink transition-colors"
              >
                {label}
              </SmartNavLink>
            ))}
          </nav>

          <div className="ms-auto flex items-center gap-3 md:gap-3.5">
            <button
              type="button"
              aria-label={LANDING.nav.menu}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="border-lp-ink/12 grid size-[38px] place-items-center rounded-full border bg-white md:hidden"
            >
              <span className="flex flex-col gap-[3.5px]">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="bg-lp-ink block h-[1.8px] w-[15px] rounded-sm" />
                ))}
              </span>
            </button>
            <ThemeToggle />
            <a
              href={loginUrl}
              className="text-lp-muted hover:text-lp-ink hidden text-[14.5px] font-medium transition-colors lg:block"
            >
              {LANDING.nav.login}
            </a>
            <StartFreeLink
              href={registerUrl}
              className="bg-lp-mint-2 rounded-full px-5 py-3 text-[14.5px] font-extrabold whitespace-nowrap text-[#04281d] shadow-[0_10px_26px_-12px_rgba(46,230,166,.95)] transition-transform hover:-translate-y-px md:px-6 md:py-3.5 lg:px-8 lg:text-[16px]"
            >
              {LANDING.nav.cta}
            </StartFreeLink>
          </div>
        </div>

        <div
          className={cn(
            'border-lp-ink/8 absolute inset-x-4 top-[calc(100%+8px)] rounded-[22px] border bg-white p-2.5 shadow-[0_24px_50px_-28px_rgba(11,26,46,.45)] md:hidden',
            !open && 'hidden',
          )}
        >
          <nav className="text-lp-ink-2 flex flex-col text-[15px] font-semibold">
            {LANDING.nav.links.map(({ href, label, sectionId }) => (
              <SmartNavLink
                key={href}
                href={href}
                sectionId={sectionId}
                onClick={close}
                className="border-lp-ink/7 border-b px-4 py-3.5"
              >
                {label}
              </SmartNavLink>
            ))}
            <a href={loginUrl} onClick={close} className="text-lp-muted px-4 py-3.5 font-medium">
              {LANDING.nav.login}
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
