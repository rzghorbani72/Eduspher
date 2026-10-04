'use client';

import { createContext, useContext, type ReactNode } from 'react';

import type { PlatformFeatures } from '@/lib/api/server/platform-features';

const PlatformFeaturesContext = createContext<PlatformFeatures>({
  quizzes_enabled: false,
  certificates_enabled: false,
});

export function PlatformFeaturesProvider({
  features,
  children,
}: {
  features: PlatformFeatures;
  children: ReactNode;
}) {
  return (
    <PlatformFeaturesContext.Provider value={features}>{children}</PlatformFeaturesContext.Provider>
  );
}

export function usePlatformFeatures(): PlatformFeatures {
  return useContext(PlatformFeaturesContext);
}
