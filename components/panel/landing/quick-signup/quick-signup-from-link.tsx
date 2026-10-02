'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { isValidSlug, QUICK_SIGNUP_SLUG_PARAM } from '@/lib/slug';
import { QuickSignupDialog } from './quick-signup-dialog';

function OpenFromQuery() {
  const [dismissed, setDismissed] = useState(false);
  const slug = useSearchParams().get(QUICK_SIGNUP_SLUG_PARAM)?.toLowerCase() ?? '';
  if (dismissed || !isValidSlug(slug)) return null;
  return <QuickSignupDialog initialSlug={slug} onClose={() => setDismissed(true)} />;
}

/**
 * A free academy subdomain links here as `/?start=<slug>`. Suspense keeps the
 * query read on the client so the landing page stays statically cached.
 */
export function QuickSignupFromLink() {
  return (
    <Suspense fallback={null}>
      <OpenFromQuery />
    </Suspense>
  );
}
