import { Container, SectionHead } from '../_shared/section';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { KEYHAN_DEFAULTS } from './defaults';
import styles from './keyhan.module.css';
import { editableList, editableItem } from '../_shared/editable-list';

interface FeatureItem {
  index: string;
  title: string;
  body: string;
}

/**
 * Asymmetric bento: the first item is a wide lead tile paired with the radar
 * scope, the rest form a quieter 2-up grid. Deliberately not `repeat(3,1fr)`.
 */
export function KeyhanFeatures({ id, config }: TemplateSectionProps) {
  const d = KEYHAN_DEFAULTS.features;
  const items = list<FeatureItem>(config, 'items', d.items);
  const [lead, ...rest] = items;

  return (
    <section
      id={id || 'features'}
      className="relative overflow-hidden bg-(--theme-background) text-(--theme-foreground)"
    >
      <div className={`${styles.gridlines} ${styles.lightgrid}`} aria-hidden="true" />

      <Container className="relative z-[2] py-(--theme-section-padding-y)">
        <SectionHead
          eyebrow={text(config, 'eyebrow', d.eyebrow)}
          title={text(config, 'title', d.title)}
          subtitle={text(config, 'subtitle', d.subtitle)}
        />

        <div className="grid gap-5 lg:grid-cols-6" {...editableList('items', items)}>
          {lead ? (
            <article className="grid gap-8 rounded-(--theme-border-radius) border border-(--theme-border-color) bg-(--theme-surface) p-7 shadow-(--theme-shadow) md:grid-cols-[1.2fr_0.8fr] md:items-center lg:col-span-6">
              <div>
                <span
                  {...editableItem('items', 0, 'index')}
                  className="text-[12px] font-bold tracking-[0.14em] text-(--theme-primary)"
                >
                  {lead.index}
                </span>
                <h3
                  {...editableItem('items', 0, 'title')}
                  className="mt-3 text-[24px] leading-[1.3] font-bold"
                >
                  {lead.title}
                </h3>
                <p
                  {...editableItem('items', 0, 'body')}
                  className="mt-3 text-[15.5px] leading-[1.85] text-(--theme-muted)"
                >
                  {lead.body}
                </p>
              </div>
              <div className={styles.scope} aria-hidden="true">
                <span className={styles.scopeRing} />
                <span className={`${styles.scopeRing} ${styles.scopeRingInner}`} />
                <span className={styles.blip} />
                <span
                  data-editable="scopeCaption"
                  className="absolute end-3 bottom-3 text-[10px] font-bold tracking-[0.14em] text-(--theme-on-deep)/60"
                >
                  {text(config, 'scopeCaption', d.scopeCaption)}
                </span>
              </div>
            </article>
          ) : null}

          {rest.map((item, index) => (
            <article
              key={item.title}
              className="rounded-(--theme-border-radius) border border-(--theme-border-color) bg-(--theme-surface) p-6 shadow-(--theme-shadow) lg:col-span-3"
            >
              <span
                {...editableItem('items', index + 1, 'index')}
                className="text-[12px] font-bold tracking-[0.14em] text-(--theme-primary)"
              >
                {item.index}
              </span>
              <h3
                {...editableItem('items', index + 1, 'title')}
                className="mt-3 text-[20px] leading-[1.35] font-bold"
              >
                {item.title}
              </h3>
              <p
                {...editableItem('items', index + 1, 'body')}
                className="mt-3 text-[15px] leading-[1.85] text-(--theme-muted)"
              >
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
