import { Container, SectionHead } from '../_shared/section';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { BIKARAN_DEFAULTS } from './defaults';
import styles from './bikaran.module.css';
import { editableList, editableItem } from '../_shared/editable-list';

interface FeatureItem {
  index: string;
  title: string;
  body: string;
}

/** Three ruled columns under an oversized margin numeral. */
export function BikaranFeatures({ id, config }: TemplateSectionProps) {
  const d = BIKARAN_DEFAULTS.features;
  const items = list<FeatureItem>(config, 'items', d.items);

  return (
    <section
      id={id || 'features'}
      className="relative overflow-hidden bg-(--theme-surface-alt) text-(--theme-foreground)"
    >
      <span className={styles.ghostNum} aria-hidden="true">
        ۰۴
      </span>

      <Container className="relative z-[2] py-(--theme-section-padding-y)">
        <SectionHead
          eyebrow={text(config, 'eyebrow', d.eyebrow)}
          title={text(config, 'title', d.title)}
          subtitle={text(config, 'subtitle', d.subtitle)}
        />

        <div className="grid gap-x-9 gap-y-8 md:grid-cols-3" {...editableList('items', items)}>
          {items.map((item, index) => (
            <article key={item.index} className="border-t border-(--theme-border-strong) pt-6">
              <span
                {...editableItem('items', index, 'index')}
                className="block text-[12px] font-bold tracking-[0.18em] text-(--theme-primary)"
              >
                {item.index}
              </span>
              <h3 {...editableItem('items', index, 'title')} className="mt-3 text-[22px] font-bold leading-[1.35]">
                {item.title}
              </h3>
              <p
                {...editableItem('items', index, 'body')}
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
