import type { ReactNode } from 'react';

/**
 * Surface tones every template shares. Sections pick a tone instead of a colour
 * so a palette change in the theme editor repaints the whole page coherently.
 */
export type SectionTone = 'page' | 'surface' | 'deep' | 'brand' | 'accent';

const TONE_CLASS: Record<SectionTone, string> = {
  page: 'bg-(--theme-background) text-(--theme-foreground)',
  surface: 'bg-(--theme-surface-alt) text-(--theme-foreground)',
  deep: 'bg-(--theme-deep) text-(--theme-on-deep)',
  brand: 'bg-(--theme-primary) text-(--theme-on-primary)',
  accent: 'bg-(--theme-accent) text-(--theme-on-accent)',
};

interface SectionProps {
  id?: string;
  tone?: SectionTone;
  className?: string;
  children: ReactNode;
}

export function Section({ id, tone = 'page', className = '', children }: SectionProps) {
  return (
    <section id={id} className={`relative ${TONE_CLASS[tone]} ${className}`}>
      {children}
    </section>
  );
}

export function Container({ className = '', children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`mx-auto w-full max-w-(--theme-container-max-width) px-5 md:px-8 lg:px-10 ${className}`}>
      {children}
    </div>
  );
}

export function Eyebrow({
  children,
  className = '',
  editableKey,
}: {
  children: ReactNode;
  className?: string;
  /** Config key this label writes to when edited inline on the canvas. */
  editableKey?: string;
}) {
  return (
    <span
      data-editable={editableKey}
      className={`block text-[13px] font-bold tracking-[0.16em] text-(--theme-primary) ${className}`}
    >
      {children}
    </span>
  );
}

interface SectionHeadProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'start' | 'between';
  className?: string;
}

/** Eyebrow + title + supporting paragraph — the head every design repeats. */
export function SectionHead({ eyebrow, title, subtitle, align = 'between', className = '' }: SectionHeadProps) {
  return (
    <div
      className={
        align === 'between'
          ? `mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-8 ${className}`
          : `mb-10 flex flex-col gap-4 ${className}`
      }
    >
      <div>
        {eyebrow ? (
          <Eyebrow className="mb-3" editableKey="eyebrow">
            {eyebrow}
          </Eyebrow>
        ) : null}
        <h2
          data-editable="title"
          className="max-w-[22ch] text-[clamp(28px,4vw,44px)] font-bold leading-[1.2] tracking-[-0.02em]"
        >
          {title}
        </h2>
      </div>
      {subtitle ? (
        <p data-editable="subtitle" className="max-w-[46ch] text-[16px] leading-[1.85] text-(--theme-muted)">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

/** Section vertical rhythm driven by the manager's spacing choice. */
export function SectionBody({ className = '', children }: { className?: string; children: ReactNode }) {
  return <div className={`py-(--theme-section-padding-y) ${className}`}>{children}</div>;
}
