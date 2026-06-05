import 'server-only';

import { cookies, headers } from 'next/headers';

export async function getPreviewToken(): Promise<string | undefined> {
  const headerStore = await headers();
  const fromHeader = headerStore.get('x-preview-token');
  if (fromHeader) return fromHeader;

  const cookieStore = await cookies();
  return cookieStore.get('preview_token')?.value;
}

export async function isEmbedMode(): Promise<boolean> {
  const headerStore = await headers();
  if (headerStore.get('x-embed-mode') === '1') return true;

  const cookieStore = await cookies();
  return cookieStore.get('embed_mode')?.value === '1';
}
