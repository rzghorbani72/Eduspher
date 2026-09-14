import { Container, SectionHead } from '../_shared/section';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { PELEH_DEFAULTS } from './defaults';
import styles from './peleh.module.css';
import { editableList, editableItem } from '../_shared/editable-list';

interface RuleItem {
  no: string;
  title: string;
  body: string;
}

/** Four numbered rules, each opened by a filled step tile. */
export function PelehFeatures({ id, config }: TemplateSectionProps) {
  const d = PELEH_DEFAULTS.features;
  const items = list<RuleItem>(config, 'items', d.items);

  return (
    <section id={id || 'features'} className="bg-(--theme-surface-alt) text-(--theme-foreground)">
      <Container className="py-(--theme-section-padding-y)">
        <SectionHead
          eyebrow={text(config, 'eyebrow', d.eyebrow)}
          title={text(config, 'title', d.title)}
          subtitle={text(config, 'subtitle', d.subtitle)}
        />

        <div className="grid gap-x-10 gap-y-9 md:grid-cols-2" {...editableList('items', items)}>
          {items.map((item, index) => (
            <article key={item.title} className="flex gap-5">
              <span {...editableItem('items', index, 'no')} className={styles.stepTile}>
                {item.no}
              </span>
              <div className="min-w-0">
                <h3
                  {...editableItem('items', index, 'title')}
                  className="text-[20px] leading-[1.35] font-bold"
                >
                  {item.title}
                </h3>
                <p
                  {...editableItem('items', index, 'body')}
                  className="mt-2.5 text-[15px] leading-[1.9] text-(--theme-muted)"
                >
                  {item.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
