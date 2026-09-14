'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const STALE_TIME_MS = 60_000;
const GARBAGE_COLLECT_MS = 5 * 60_000;
const MAX_RETRIES = 1;

/**
 * Created inside the tree, never at module scope, so a server render cannot
 * share one visitor's cache with the next request.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: STALE_TIME_MS,
            gcTime: GARBAGE_COLLECT_MS,
            refetchOnWindowFocus: false,
            retry: MAX_RETRIES,
          },
          mutations: { retry: 0 },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
