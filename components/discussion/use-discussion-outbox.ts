'use client';

import { useCallback, useState } from 'react';

export interface OutgoingMessage {
  localId: string;
  body: string;
  file: File | null;
  status: 'sending' | 'failed';
  created_at: string;
}

type Deliver<T> = (body: string, file: File | null) => Promise<T>;

/**
 * Messages on their way to the server. Shown at once as "sending"; a failed
 * one stays with its file so the student can retry instead of retyping.
 * `onDelivered` runs in the same tick the pending copy is dropped, so React
 * paints one frame with the real message instead of both or neither.
 */
export function useDiscussionOutbox<T>(deliver: Deliver<T>, onDelivered: (sent: T) => void) {
  const [outbox, setOutbox] = useState<OutgoingMessage[]>([]);

  const run = useCallback(
    async (item: OutgoingMessage) => {
      let sent: T;
      try {
        sent = await deliver(item.body, item.file);
      } catch {
        setOutbox((prev) =>
          prev.map((row) => (row.localId === item.localId ? { ...row, status: 'failed' } : row)),
        );
        return;
      }
      setOutbox((prev) => prev.filter((row) => row.localId !== item.localId));
      onDelivered(sent);
    },
    [deliver, onDelivered],
  );

  const enqueue = useCallback(
    (body: string, file: File | null) => {
      const item: OutgoingMessage = {
        localId: crypto.randomUUID(),
        body,
        file,
        status: 'sending',
        created_at: new Date().toISOString(),
      };
      setOutbox((prev) => [...prev, item]);
      void run(item);
    },
    [run],
  );

  const retry = useCallback(
    (localId: string) => {
      const item = outbox.find((row) => row.localId === localId);
      if (!item) return;
      const again = { ...item, status: 'sending' as const };
      setOutbox((prev) => prev.map((row) => (row.localId === localId ? again : row)));
      void run(again);
    },
    [outbox, run],
  );

  const discard = useCallback((localId: string) => {
    setOutbox((prev) => prev.filter((row) => row.localId !== localId));
  }, []);

  return { outbox, enqueue, retry, discard };
}
