import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logging/app-logger';

/**
 * Backend calls this right after an academy publishes its site, so the
 * 60-second public data cache for that academy is dropped at once instead of
 * serving the old template until it expires.
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || request.headers.get('x-revalidate-secret') !== secret) {
    return NextResponse.json({ status: 'forbidden' }, { status: 403 });
  }
  const body = (await request.json().catch(() => null)) as { slug?: unknown } | null;
  const slug = typeof body?.slug === 'string' ? body.slug.trim() : '';
  if (!slug) return NextResponse.json({ status: 'bad_request' }, { status: 400 });

  revalidateTag(`${slug}:site`, 'max');
  logger.ok('SiteCache', 'Revalidated', { academy_slug: slug });
  return NextResponse.json({ status: 'ok' });
}
