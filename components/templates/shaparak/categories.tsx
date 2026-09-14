import { Container, SectionHead } from '../_shared/section';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { SHAPARAK_DEFAULTS } from './defaults';
import styles from './shaparak.module.css';
import { templateHref } from '../_shared/routes';
import { editableList, editableItem } from '../_shared/editable-list';

interface AgeGroup {
  age: string;
  title: string;
  body: string;
  meta: string;
}

/**
 * Age groups as sticker cards. A parent's first question is "which one is my
 * child?", so the age leads and everything else follows it.
 */
export function ShaparakCategories({ id, config, storeContext }: TemplateSectionProps) {
  const d = SHAPARAK_DEFAULTS.categories;
  const items = list<AgeGroup>(config, 'items', d.items);

  return (
    <section id={id || 'categories'} className="bg-(--theme-background) text-(--theme-foreground)">
      <Container className="py-(--theme-section-padding-y)">
        <SectionHead
          eyebrow={text(config, 'eyebrow', d.eyebrow)}
          title={text(config, 'title', d.title)}
          subtitle={text(config, 'subtitle', d.subtitle)}
        />

        <div className="grid gap-6 md:grid-cols-3" {...editableList('items', items)}>
          {items.map((item, index) => (
            <a
              key={item.title}
              href={templateHref(storeContext, 'courses')}
              className={`${styles.sticker} flex flex-col p-7`}
            >
              <span
                {...editableItem('items', index, 'age')}
                className={`${styles.ageBadge} self-start text-[14px]`}
              >
                {item.age} سال
              </span>
              <h3
                {...editableItem('items', index, 'title')}
                className={`${styles.cardTitle} mt-5 text-[21px] leading-[1.3] font-bold`}
              >
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
                className="mt-5 text-[13px] font-bold text-(--theme-primary)"
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
