import { cn } from '@/lib/utils';

type Props = {
  number?: string | null;
  label?: string | null;
  /** The "problem" section sits on navy, so its label flips to mint/sky. */
  tone?: 'light' | 'dark';
};

/** "۰۱ · label" eyebrow with the hairline every numbered section starts with. */
export function SectionLabel({ tone = 'light' }: Props) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 border-t pt-3.5',
        tone === 'dark' ? 'border-white/16' : 'border-lp-ink/12',
      )}
    >
      {/* <span
        className={cn(
          'text-[12px] font-extrabold tracking-[.08em]',
          tone === 'dark' ? 'text-lp-mint' : 'text-lp-blue',
        )}
      >
        {number}
      </span>
      <span
        className={cn(
          'text-[12px] font-bold tracking-[.06em]',
          tone === 'dark' ? 'text-lp-sky-2' : 'text-lp-faint',
        )}
      >
        {label}
      </span> */}
    </div>
  );
}
