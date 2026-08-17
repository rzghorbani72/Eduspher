import { Container, SectionHead } from '../_shared/section';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { NEGATIF_DEFAULTS } from './defaults';
import styles from './negatif.module.css';

interface FeatureItem {
  index: string;
  title: string;
  body: string;
}

/**
 * Contact-sheet bento: a wide lead frame with the "roll" caption, the rest sit
 * as smaller frames on the same proof-sheet grid.
 */
export function NegatifFeatures({ id, config }: TemplateSectionProps) {
  const d = NEGATIF_DEFAULTS.features;
  const items = list<FeatureItem>(config, 'items', d.items);
  const [lead, ...rest] = items;

  return (
    <section id={id || 'features'} className="relative overflow-hidden bg-(--theme-surface-alt) text-(--theme-foreground)">
      <div className={styles.contactGrid} aria-hidden="true" />

      <Container className="relative z-[2] py-(--theme-section-padding-y)">
        <SectionHead
          eyebrow={text(config, 'eyebrow', d.eyebrow)}
          title={text(config, 'title', d.title)}
          subtitle={text(config, 'subtitle', d.subtitle)}
        />

        <div className="grid gap-5 lg:grid-cols-6">
          {lead ? (
            <article className={`${styles.frame} grid gap-8 bg-(--theme-surface) p-7 md:grid-cols-[1.2fr_0.8fr] md:items-center lg:col-span-6`}>
              <div>
                <span className={`${styles.frameNo} text-[12px] font-bold tracking-[0.14em] text-(--theme-primary)`}>
                  {lead.index}
                </span>
                <h3 className="mt-3 text-[24px] font-bold leading-[1.3]">{lead.title}</h3>
                <p className="mt-3 text-[15.5px] leading-[1.85] text-(--theme-muted)">{lead.body}</p>
              </div>
              <div className="grid place-items-center rounded-(--theme-border-radius) bg-(--theme-deep) p-6 text-center text-(--theme-on-deep)">
                <span className={`${styles.frameNo} text-[13px] font-bold tracking-[0.2em]`}>
                  {text(config, 'scopeCaption', d.scopeCaption)}
                </span>
              </div>
            </article>
          ) : null}

          {rest.map((item) => (
            <article key={item.title} className={`${styles.frame} bg-(--theme-surface) p-6 lg:col-span-3`}>
              <span className={`${styles.frameNo} text-[12px] font-bold tracking-[0.14em] text-(--theme-primary)`}>
                {item.index}
              </span>
              <h3 className="mt-3 text-[20px] font-bold leading-[1.35]">{item.title}</h3>
              <p className="mt-3 text-[15px] leading-[1.85] text-(--theme-muted)">{item.body}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
