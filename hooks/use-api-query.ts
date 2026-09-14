'use client';

import { useQuery, type QueryKey } from '@tanstack/react-query';

interface ApiQueryOptions<T> {
  queryKey: QueryKey;
  /**
   * React Query aborts this signal on unmount and on query-key change, so pass
   * it into the `lib/api/client` helper, which forwards it to `fetch`.
   */
  queryFn: (signal: AbortSignal) => Promise<T>;
  enabled?: boolean;
  staleTime?: number;
  refetchInterval?: number;
}

export function useApiQuery<T>({ queryKey, queryFn, ...options }: ApiQueryOptions<T>) {
  const query = useQuery<T>({
    queryKey,
    queryFn: ({ signal }) => queryFn(signal),
    ...options,
  });

  return {
    data: query.data,
    error: query.error,
    isLoading: query.isPending && query.fetchStatus !== 'idle',
    isFetching: query.isFetching,
    refresh: query.refetch,
  };
}
