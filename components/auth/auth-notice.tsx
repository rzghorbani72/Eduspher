"use client";

/** Amber = something went wrong, green = something was sent. Shared by every auth step. */
export function AuthError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/70 dark:text-amber-300">
      {children}
    </div>
  );
}

export function AuthMessage({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <div className="whitespace-pre-wrap rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/70 dark:text-green-300">
      {children}
    </div>
  );
}
