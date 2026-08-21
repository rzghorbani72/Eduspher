"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

type SnackbarTone = "success" | "error";

interface SnackbarMessage {
  id: number;
  text: string;
  tone: SnackbarTone;
}

type Listener = (message: SnackbarMessage | null) => void;

const listeners = new Set<Listener>();
let current: SnackbarMessage | null = null;

function publish(message: SnackbarMessage | null) {
  current = message;
  listeners.forEach((listener) => listener(current));
}

export function showSnackbar(text: string, tone: SnackbarTone = "success") {
  publish({ id: Date.now(), text, tone });
}

export function hideSnackbar() {
  publish(null);
}

const AUTO_HIDE_MS = 6000;

export function SnackbarHost() {
  const [message, setMessage] = useState<SnackbarMessage | null>(current);

  useEffect(() => {
    listeners.add(setMessage);
    return () => {
      listeners.delete(setMessage);
    };
  }, []);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(hideSnackbar, AUTO_HIDE_MS);
    return () => clearTimeout(timer);
  }, [message]);

  if (!message) return null;

  const toneClass =
    message.tone === "error"
      ? "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
      : "border-green-300 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200";

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-[100] flex justify-center px-4"
    >
      <div
        className={`pointer-events-auto flex max-w-md items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg whitespace-pre-wrap ${toneClass}`}
      >
        {message.tone === "success" && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
        <span className="flex-1">{message.text}</span>
        <button type="button" onClick={hideSnackbar} aria-label="close" className="mt-0.5 shrink-0 opacity-70 hover:opacity-100">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
