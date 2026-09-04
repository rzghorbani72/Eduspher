import { Container, SectionHead } from '../_shared/section';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { ROUZAN_DEFAULTS } from './defaults';
import styles from './rouzan.module.css';
import { editableList, editableItem } from '../_shared/editable-list';

interface ReasonItem {
  no: string;
  title: string;
  body: string;
}

/** Four numbered reasons in a plain grid — the number is the only decoration. */
export function RouzanFeatures({ id, config }: TemplateSectionProps) {
  const d = ROUZAN_DEFAULTS.features;
  const items = list<ReasonItem>(config, 'items', d.items);

  return (
    <section id={id || 'features'} className="bg-(--theme-background) text-(--theme-foreground)">
      <Container className="py-(--theme-section-padding-y)">
        <SectionHead
          eyebrow={text(config, 'eyebrow', d.eyebrow)}
          title={text(config, 'title', d.title)}
          subtitle={text(config, 'subtitle', d.subtitle)}
        />

        <div className="grid gap-x-10 gap-y-12 sm:grid-cols-2" {...editableList('items', items)}>
          {items.map((item, index) => (
            <article key={item.title}>
              <span
                {...editableItem('items', index, 'no')}
                className={`${styles.reasonNo} block text-[42px] font-extrabold leading-none tracking-[-0.04em]`}
              >
                {item.no}
              </span>
              <h3 {...editableItem('items', index, 'title')} className="mt-4 text-[21px] font-bold leading-[1.35]">
                {item.title}
              </h3>
              <p
                {...editableItem('items', index, 'body')}
                className="mt-3 max-w-[46ch] text-[15px] leading-[1.9] text-(--theme-muted)"
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
