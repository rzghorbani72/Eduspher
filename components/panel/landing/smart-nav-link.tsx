'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

type Props = {
  /** Dedicated SEO page — always used off the home page. */
  href: string;
  /** id of the matching section embedded on the home page, if any. */
  sectionId?: string;
  className?: string;
  children: ReactNode;
};

/**
 * On the home page, a link with a `sectionId` scrolls to that section instead
 * of navigating away — the section's own page still exists for SEO/crawling
 * and for direct links from anywhere else.
 */
export function SmartNavLink({ href, sectionId, className, children }: Props) {
  const pathname = usePathname();
  const resolvedHref = pathname === '/' && sectionId ? `#${sectionId}` : href;

  return (
    <Link href={resolvedHref} className={className}>
      {children}
    </Link>
  );
}
