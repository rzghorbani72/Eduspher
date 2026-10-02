import type { Metadata } from 'next';
import type { ReactNode } from 'react';

/** Unknown academy hosts (free-address invite or 404) — never index. */
export const metadata: Metadata = {
  title: 'Academy not found',
  robots: { index: false, follow: false },
};

export default function AcademyNotFoundLayout({ children }: { children: ReactNode }) {
  return children;
}
