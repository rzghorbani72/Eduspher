"use client";

/** Amber notice shown inside the auth card when a step fails. Sent/success feedback goes to the toast instead. */
export function AuthError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/70 dark:text-amber-300">
      {children}
    </div>
  );
}
