import type { ReactNode } from 'react';
import styles from './partow.module.css';

/**
 * Partow's page container.
 *
 * Every section shares it so the content edge lines up down the whole page.
 * Sections should not roll their own container — the alignment is what keeps a
 * centred layout from drifting once a manager hides one of the bands.
 */
export function Wrap({ className = '', children }: { className?: string; children: ReactNode }) {
  return <div className={`${styles.wrap} ${className}`}>{children}</div>;
}

/**
 * Centred section head: eyebrow, title, optional sub-lead.
 *
 * Partow's own rather than the one in `_shared/section`, because every band on
 * this page is centre-aligned and uses this template's tighter type scale.
 */
export function SectionHead({
  eyebrow,
  title,
  subtitle,
  eyebrowKey = 'eyebrow',
  titleKey = 'title',
  subtitleKey = 'subtitle',
  className = '',
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  eyebrowKey?: string;
  titleKey?: string;
  subtitleKey?: string;
  className?: string;
}) {
  return (
    <div className={`text-center ${className}`}>
      {eyebrow ? (
        <p data-editable={eyebrowKey} className={styles.eyebrow}>
          {eyebrow}
        </p>
      ) : null}
      <h2
        data-editable={titleKey}
        className="mt-2.5 text-[clamp(28px,3.6vw,46px)] font-bold leading-[1.2]"
      >
        {title}
      </h2>
      {subtitle ? (
        <p
          data-editable={subtitleKey}
          className="mx-auto mt-4 max-w-[56ch] text-[16.5px] leading-[1.85] text-(--theme-muted)"
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

/**
 * The reel frame reused by the hero and the instructor band: a title bar with
 * traffic-light dots and a file token, then the video slot itself.
 */
export function MediaBar({
  token,
  note,
  tokenKey,
  noteKey,
}: {
  token: string;
  note: string;
  tokenKey?: string;
  noteKey?: string;
}) {
  return (
    <div className={styles.mediaBar}>
      <span className={styles.dots} aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span className={styles.tok} data-editable={tokenKey}>
        {token}
      </span>
      <span data-editable={noteKey} className="ms-auto">
        {note}
      </span>
    </div>
  );
}
