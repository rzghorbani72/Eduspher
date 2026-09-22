import { cn } from '@/lib/utils';

type Props = {
  /** Optional short eyebrow (no section numbers — those stay on Steps only). */
  label?: string | null;
  /** The "problem" section sits on navy, so its label flips to mint/sky. */
  tone?: 'light' | 'dark';
};

/** Hairline + optional label eyebrow at the start of a section. */
export function SectionLabel({ label, tone = 'light' }: Props) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 border-t pt-3.5',
        tone === 'dark' ? 'border-white/16' : 'border-lp-ink/12',
      )}
    >
      {label ? (
        <span
          className={cn(
            'text-[12px] font-bold tracking-[.06em]',
            tone === 'dark' ? 'text-lp-sky-2' : 'text-lp-faint',
          )}
        >
          {label}
        </span>
      ) : null}
    </div>
  );
}
