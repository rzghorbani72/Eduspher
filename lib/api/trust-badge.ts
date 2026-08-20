import "server-only";

import { cache } from "react";

import { serverFetch } from "./server";

export type TrustBadge = {
  academy_name: string;
  legal_entity_name: string | null;
  national_id_masked: string | null;
  contact_address: string | null;
  contact_phone: string | null;
  identity_verified: boolean;
  enamad_status: string;
  enamad_code: string | null;
  custom_domain: string | null;
  hosted_since: string | null;
};

/**
 * Cached per request: the footer renders on every page, and the badge never
 * changes within a single render. A failure here must never take the page down
 * — the footer simply omits the block.
 */
export const getTrustBadge = cache(
  async (slug: string): Promise<TrustBadge | null> => {
    if (!slug) return null;
    try {
      const result = await serverFetch<TrustBadge | null>(
        `/compliance/public/trust-badge?slug=${encodeURIComponent(slug)}`,
        { includeAuth: false },
      );
      return result.data ?? null;
    } catch {
      return null;
    }
  },
);
