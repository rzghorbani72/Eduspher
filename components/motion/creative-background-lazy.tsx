'use client';

import dynamic from 'next/dynamic';

import type { ComponentProps } from 'react';

import type { CreativeBackground } from './creative-background';

/**
 * Decorative only, and the heaviest client dependency in the tree (framer-motion
 * plus the flying-icons field). Loading it lazily keeps it out of the shared
 * layout chunk, so routes that never render it — the platform landing above all
 * — do not pay for it.
 */
const LazyCreativeBackground = dynamic(
  () => import('./creative-background').then((m) => m.CreativeBackground),
  { ssr: false },
);

export function CreativeBackgroundLazy(props: ComponentProps<typeof CreativeBackground>) {
  return <LazyCreativeBackground {...props} />;
}
