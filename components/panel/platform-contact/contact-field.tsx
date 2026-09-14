import type { ReactNode } from 'react';

/** One shared control skin so every field on the contact form matches. */
export const CONTROL_CLASS =
  'h-12 w-full rounded-xl border border-lp-line bg-lp-surface-2 px-4 text-[15px] text-lp-ink outline-none transition-colors placeholder:text-lp-muted/70 focus:border-lp-mint';

export function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div>
      <label className="text-lp-ink-2 mb-2 block text-[13px] font-bold" htmlFor={id}>
        {label}
      </label>
      {children}
    </div>
  );
}
