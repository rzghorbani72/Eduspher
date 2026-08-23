"use client";

import { useCallback, useState } from "react";
import { toast } from "react-toastify";

/** What an action tells the dialog once it settles. */
export type DialogActionOutcome = {
  /** Keep the dialog open because the user still has to answer something. */
  keepOpen?: boolean;
  /** Reported in a toast; omit when the action already reported itself. */
  message?: string;
  ok?: boolean;
};

/**
 * The one rule every dialog action follows: the button spins while the request
 * is in flight, the dialog closes as soon as it settles either way, and the
 * outcome is told in a toast — never left behind inside a dialog nobody sees.
 */
export const useDialogAction = (
  onClose: () => void,
  fallbackErrorMessage?: string,
) => {
  const [pending, setPending] = useState(false);

  const run = useCallback(
    async (action: () => Promise<DialogActionOutcome | void>) => {
      setPending(true);
      try {
        const outcome = (await action()) ?? {};
        if (outcome.keepOpen) return;
        onClose();
        if (outcome.message) {
          if (outcome.ok === false) toast.error(outcome.message);
          else toast.success(outcome.message);
        }
      } catch {
        onClose();
        if (fallbackErrorMessage) toast.error(fallbackErrorMessage);
      } finally {
        setPending(false);
      }
    },
    [fallbackErrorMessage, onClose],
  );

  return { pending, run };
};
