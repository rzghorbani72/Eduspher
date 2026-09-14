import 'server-only';

import { headers } from 'next/headers';

/** Public host of the current request (proxy-aware), e.g. "mentoma.ir". */
export async function getRequestHost(): Promise<string | null> {
  const headerStore = await headers();
  return headerStore.get('x-forwarded-host') ?? headerStore.get('host') ?? null;
}
