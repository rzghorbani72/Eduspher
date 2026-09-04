import { Container, SectionHead } from '../_shared/section';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { DANESHVAR_DEFAULTS } from './defaults';
import styles from './daneshvar.module.css';
import { templateHref } from '../_shared/routes';
import { editableList, editableItem } from '../_shared/editable-list';

interface AreaItem {
  title: string;
  body: string;
  meta: string;
}

/** Research areas as bordered blocks — a reading list, not a product grid. */
export function DaneshvarCategories({ id, config, storeContext }: TemplateSectionProps) {
  const d = DANESHVAR_DEFAULTS.categories;
  const items = list<AreaItem>(config, 'items', d.items);

  return (
    <section id={id || 'categories'} className="bg-(--theme-background) text-(--theme-foreground)">
      <Container className="py-(--theme-section-padding-y)">
        <SectionHead
          eyebrow={text(config, 'eyebrow', d.eyebrow)}
          title={text(config, 'title', d.title)}
          subtitle={text(config, 'subtitle', d.subtitle)}
        />

        <div className="grid gap-5 md:grid-cols-2" {...editableList('items', items)}>
          {items.map((item, index) => (
            <a
              key={item.title}
              href={templateHref(storeContext, 'courses')}
              className={`${styles.area} flex flex-col p-7`}
            >
              <h3 {...editableItem('items', index, 'title')} className={`${styles.cardTitle} text-[20px] font-bold leading-[1.35]`}>
                {item.title}
              </h3>
              <p
                {...editableItem('items', index, 'body')}
                className="mt-3 flex-1 text-[15px] leading-[1.9] text-(--theme-muted)"
              >
                {item.body}
              </p>
              <span
                {...editableItem('items', index, 'meta')}
                className="mt-5 text-[13px] font-bold text-(--theme-accent)"
              >
                {item.meta}
              </span>
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
}
