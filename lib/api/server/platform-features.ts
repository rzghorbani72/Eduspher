import 'server-only';

import { cache } from 'react';
import { serverFetchRaw } from './core';

export interface PlatformFeatures {
  quizzes_enabled: boolean;
  certificates_enabled: boolean;
}

/** Owner switches; off when unreachable so a hidden feature never leaks onto a page. */
export const getPlatformFeatures = cache(async (): Promise<PlatformFeatures> => {
  try {
    const result = await serverFetchRaw<Partial<PlatformFeatures>>('/platform-settings/features', {
      includeAuth: false,
    });
    return {
      quizzes_enabled: result.quizzes_enabled === true,
      certificates_enabled: result.certificates_enabled === true,
    };
  } catch {
    return { quizzes_enabled: false, certificates_enabled: false };
  }
});
