import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

import { AddressAvailable } from '@/components/academy/address-available';
import { getAcademyAddressStatus } from '@/lib/api/server';
import { extractHost, extractSubdomainSlug } from '@/lib/proxy/parts/routing-config';

export const dynamic = 'force-dynamic';

/**
 * Rewrite target when a host matches no academy. A free subdomain of ours
 * invites the visitor to claim it; anything else (custom domain, taken or
 * invalid name) stays a real 404. The slug comes from the Host header, never
 * the URL, so a live academy's site can't be made to say "this is free".
 */
export default async function AcademyNotFoundPage() {
  const host = extractHost((await headers()).get('host'))?.toLowerCase() ?? null;
  const slug = extractSubdomainSlug(host);
  const status = slug ? await getAcademyAddressStatus(slug) : null;
  if (!host || !slug || !status?.available) notFound();

  return <AddressAvailable slug={slug} address={host} released={status.previously_used} />;
}
