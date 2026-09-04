import { Container, SectionHead } from '../_shared/section';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { DANESHVAR_DEFAULTS } from './defaults';
import styles from './daneshvar.module.css';
import { editableList, editableItem } from '../_shared/editable-list';

interface MethodItem {
  no: string;
  title: string;
  body: string;
}

/** Lettered method entries, laid out like clauses in a course handout. */
export function DaneshvarFeatures({ id, config }: TemplateSectionProps) {
  const d = DANESHVAR_DEFAULTS.features;
  const items = list<MethodItem>(config, 'items', d.items);

  return (
    <section id={id || 'features'} className="bg-(--theme-surface-alt) text-(--theme-foreground)">
      <Container className="py-(--theme-section-padding-y)">
        <SectionHead
          eyebrow={text(config, 'eyebrow', d.eyebrow)}
          title={text(config, 'title', d.title)}
          subtitle={text(config, 'subtitle', d.subtitle)}
        />

        <div className="grid gap-x-12 gap-y-10 md:grid-cols-2" {...editableList('items', items)}>
          {items.map((item, index) => (
            <article key={item.title} className="flex gap-5">
              <span {...editableItem('items', index, 'no')} className={styles.letter}>
                {item.no}
              </span>
              <div className="min-w-0">
                <h3 {...editableItem('items', index, 'title')} className="text-[19px] font-bold leading-[1.4]">
                  {item.title}
                </h3>
                <p
                  {...editableItem('items', index, 'body')}
                  className="mt-2.5 text-[15px] leading-[1.95] text-(--theme-muted)"
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
