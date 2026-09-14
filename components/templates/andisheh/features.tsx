import { Container, SectionHead } from '../_shared/section';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { ANDISHEH_DEFAULTS } from './defaults';
import styles from './andisheh.module.css';
import { editableList, editableItem } from '../_shared/editable-list';

interface ApproachItem {
  no: string;
  title: string;
  body: string;
}

/** Four approach cards on the light page, cooling down after the dark stage. */
export function AndishehFeatures({ id, config }: TemplateSectionProps) {
  const d = ANDISHEH_DEFAULTS.features;
  const items = list<ApproachItem>(config, 'items', d.items);

  return (
    <section id={id || 'features'} className="bg-(--theme-background) text-(--theme-foreground)">
      <Container className="py-(--theme-section-padding-y)">
        <SectionHead
          eyebrow={text(config, 'eyebrow', d.eyebrow)}
          title={text(config, 'title', d.title)}
          subtitle={text(config, 'subtitle', d.subtitle)}
        />

        <div className="grid gap-5 md:grid-cols-2" {...editableList('items', items)}>
          {items.map((item, index) => (
            <article key={item.title} className={`${styles.card} p-7`}>
              <span
                {...editableItem('items', index, 'no')}
                className={`${styles.cardNo} text-[13px] font-bold`}
              >
                {item.no}
              </span>
              <h3
                {...editableItem('items', index, 'title')}
                className="mt-3 text-[20px] leading-[1.35] font-bold"
              >
                {item.title}
              </h3>
              <p
                {...editableItem('items', index, 'body')}
                className="mt-3 text-[15px] leading-[1.9] text-(--theme-muted)"
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
