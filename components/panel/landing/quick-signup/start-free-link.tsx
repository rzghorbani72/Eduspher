'use client';

import { useState, type ReactNode } from 'react';

import { QuickSignupDialog } from './quick-signup-dialog';

type Props = {
  /** Kept as a real href so the link stays crawlable and works without JS. */
  href: string;
  className?: string;
  children: ReactNode;
};

/**
 * Every "start free" CTA on the landing page. It renders the same anchor the
 * page always had — the AdminPanel register URL is still in the HTML for
 * crawlers and for a no-JS visitor — and only intercepts the click to open the
 * signup dialog in place.
 */
export function StartFreeLink({ href, className, children }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <a
        href={href}
        className={className}
        onClick={(event) => {
          if (event.metaKey || event.ctrlKey || event.shiftKey) return;
          event.preventDefault();
          setOpen(true);
        }}
      >
        {children}
      </a>
      {open && <QuickSignupDialog onClose={() => setOpen(false)} />}
    </>
  );
}
