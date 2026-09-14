import type { ReactNode } from 'react';
import styles from './rouzan.module.css';

/**
 * Rouzan's page container.
 *
 * Every section shares it so the left edge of the content lines up down the
 * whole page — the alignment is what holds this layout together now that the
 * editor gutter is gone, so sections should not roll their own container.
 */
export function Wrap({ className = '', children }: { className?: string; children: ReactNode }) {
  return <div className={`${styles.wrap} ${className}`}>{children}</div>;
}

/** Eyebrow label above a section title, in the brand colour. */
export function LeadLabel({
  children,
  editableKey,
  className = '',
}: {
  children: ReactNode;
  editableKey?: string;
  className?: string;
}) {
  return (
    <p data-editable={editableKey} className={`${styles.leadLbl} ${className}`}>
      {children}
    </p>
  );
}

/**
 * Section head: eyebrow + title on one side, a supporting note or an action on
 * the other. Rouzan's own, rather than the one in `_shared/section`, because it
 * uses this template's tighter type scale.
 */
export function SectionHead({
  eyebrow,
  title,
  eyebrowKey = 'eyebrow',
  titleKey = 'title',
  aside,
}: {
  eyebrow?: string;
  title: ReactNode;
  eyebrowKey?: string;
  titleKey?: string;
  aside?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-7 gap-y-4">
      <div>
        {eyebrow ? <LeadLabel editableKey={eyebrowKey}>{eyebrow}</LeadLabel> : null}
        <h2
          data-editable={titleKey}
          className="mt-2 text-[clamp(28px,3.1vw,40px)] leading-[1.14] font-bold"
        >
          {title}
        </h2>
      </div>
      {aside}
    </div>
  );
}
