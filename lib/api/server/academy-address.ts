import 'server-only';

import { serverFetchRaw } from './core';

export type AcademyAddressStatus = {
  available: boolean;
  previously_used: boolean;
};

/** Is this subdomain free to claim, and did an expired academy use it before? */
export async function getAcademyAddressStatus(slug: string): Promise<AcademyAddressStatus | null> {
  try {
    return await serverFetchRaw<AcademyAddressStatus>('/academies/slug-available', {
      includeAuth: false,
      query: { slug },
    });
  } catch {
    return null;
  }
}
