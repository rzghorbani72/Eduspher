'use client';

import { useEffect, useRef, type MouseEvent, type ReactNode } from 'react';

interface MobileMenuProps {
  label: string;
  summary: ReactNode;
  summaryClassName: string;
  className?: string;
  children: ReactNode;
}

/** Native `<details>` menu that also closes on an outside click or a link click. */
export function MobileMenu({
  label,
  summary,
  summaryClassName,
  className,
  children,
}: MobileMenuProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const closeOnOutside = (event: PointerEvent) => {
      const details = detailsRef.current;
      if (details?.open && event.target instanceof Node && !details.contains(event.target)) {
        details.open = false;
      }
    };
    document.addEventListener('pointerdown', closeOnOutside);
    return () => document.removeEventListener('pointerdown', closeOnOutside);
  }, []);

  const closeOnLinkClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target instanceof Element && event.target.closest('a') && detailsRef.current) {
      detailsRef.current.open = false;
    }
  };

  return (
    <details ref={detailsRef} className={`relative ${className ?? ''}`}>
      <summary aria-label={label} className={summaryClassName}>
        {summary}
      </summary>
      <div onClick={closeOnLinkClick}>{children}</div>
    </details>
  );
}
