import type { ReactNode } from 'react';

export type ButtonTone = 'primary' | 'deep' | 'accent' | 'outline' | 'ghost-on-deep';

const BUTTON_TONE: Record<ButtonTone, string> = {
  primary: 'bg-(--theme-primary) text-(--theme-on-primary) border-transparent hover:opacity-90',
  deep: 'bg-(--theme-deep) text-(--theme-on-deep) border-transparent hover:opacity-90',
  accent: 'bg-(--theme-accent) text-(--theme-on-accent) border-transparent hover:opacity-90',
  outline:
    'bg-transparent text-(--theme-foreground) border-(--theme-border-strong) hover:border-(--theme-primary) hover:text-(--theme-primary)',
  'ghost-on-deep': 'bg-transparent text-current border-current/40 hover:bg-current/10',
};

interface ButtonProps {
  tone?: ButtonTone;
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  className?: string;
  editableKey?: string;
  children: ReactNode;
}

const BUTTON_SIZE = {
  sm: 'px-4 py-2.5 text-[14px]',
  md: 'px-6 py-3.5 text-[15px]',
  lg: 'px-8 py-4 text-[17px]',
} as const;

export function Button({
  tone = 'primary',
  size = 'md',
  href,
  className = '',
  editableKey,
  children,
}: ButtonProps) {
  const classes = `inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-(--theme-border-radius) border font-bold transition-[opacity,color,border-color,transform] duration-150 hover:-translate-y-0.5 ${BUTTON_TONE[tone]} ${BUTTON_SIZE[size]} ${className}`;

  if (href) {
    return (
      <a href={href} className={classes}>
        <span data-editable={editableKey}>{children}</span>
      </a>
    );
  }
  return (
    <button type="button" className={classes}>
      <span data-editable={editableKey}>{children}</span>
    </button>
  );
}

export function Pill({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full bg-(--theme-primary-subtle) px-4 py-1.5 text-[13px] font-bold text-(--theme-primary) ${className}`}
    >
      {children}
    </span>
  );
}

export function Card({ className = '', children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={`flex flex-col overflow-hidden rounded-(--theme-border-radius) border border-(--theme-border-color) bg-(--theme-surface) shadow-(--theme-shadow) transition-[transform,border-color] duration-200 hover:-translate-y-1 hover:border-(--theme-border-strong) ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Initials tile used wherever a design shows a person without a photo. Every
 * preset ships images as `null`, so this is the default state, not a fallback.
 */
export function Initials({
  value,
  className = '',
  tone = 'primary',
}: {
  value: string;
  className?: string;
  tone?: 'primary' | 'accent' | 'deep';
}) {
  const toneClass =
    tone === 'accent'
      ? 'bg-(--theme-accent) text-(--theme-on-accent)'
      : tone === 'deep'
        ? 'bg-(--theme-deep) text-(--theme-on-deep)'
        : 'bg-(--theme-primary) text-(--theme-on-primary)';
  return (
    <span
      aria-hidden="true"
      className={`grid flex-none place-items-center rounded-(--theme-border-radius) text-[13px] font-bold ${toneClass} ${className}`}
    >
      {value}
    </span>
  );
}

/** A row of headline numbers — present in every one of the seven designs. */
export function StatRow({
  stats,
  className = '',
}: {
  stats: readonly { value: string; label: string }[];
  className?: string;
}) {
  return (
    <dl className={`flex flex-wrap gap-x-9 gap-y-5 ${className}`}>
      {stats.map((stat) => (
        <div key={stat.label}>
          <dt className="sr-only">{stat.label}</dt>
          <dd>
            <b className="block text-[28px] font-bold leading-[1.15] tracking-[-0.03em]">{stat.value}</b>
            <span className="text-[13px] text-(--theme-muted)">{stat.label}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
