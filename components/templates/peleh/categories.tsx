import { Container, SectionHead } from '../_shared/section';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { PELEH_DEFAULTS } from './defaults';
import styles from './peleh.module.css';
import { templateHref } from '../_shared/routes';
import { editableList, editableItem } from '../_shared/editable-list';

interface RungItem {
  step: string;
  title: string;
  body: string;
  meta: string;
}

/**
 * The grade ladder. Each rung is inset one step further than the last, so the
 * list literally climbs — the same promise the hero makes, restated in layout.
 */
export function PelehCategories({ id, config, storeContext }: TemplateSectionProps) {
  const d = PELEH_DEFAULTS.categories;
  const items = list<RungItem>(config, 'items', d.items);
  const insets = ['lg:ms-0', 'lg:ms-10', 'lg:ms-20', 'lg:ms-30'];

  return (
    <section id={id || 'categories'} className="bg-(--theme-background) text-(--theme-foreground)">
      <Container className="py-(--theme-section-padding-y)">
        <SectionHead
          eyebrow={text(config, 'eyebrow', d.eyebrow)}
          title={text(config, 'title', d.title)}
          subtitle={text(config, 'subtitle', d.subtitle)}
        />

        <div className="grid gap-4" {...editableList('items', items)}>
          {items.map((item, index) => (
            <a
              key={item.title}
              href={templateHref(storeContext, 'courses')}
              className={`${styles.rung} ${insets[index] ?? 'lg:ms-30'} flex flex-wrap items-center gap-x-6 gap-y-3 p-6`}
            >
              <span
                {...editableItem('items', index, 'step')}
                className={`${styles.rungBadge} flex-none px-3.5 py-1.5 text-[12.5px] font-bold`}
              >
                {item.step}
              </span>
              <h3
                {...editableItem('items', index, 'title')}
                className={`${styles.cardTitle} flex-none text-[20px] leading-[1.3] font-bold md:w-[26%]`}
              >
                {item.title}
              </h3>
              <p
                {...editableItem('items', index, 'body')}
                className="min-w-0 flex-1 text-[14.5px] leading-[1.85] text-(--theme-muted)"
              >
                {item.body}
              </p>
              <span
                {...editableItem('items', index, 'meta')}
                className="flex-none text-[13px] font-bold text-(--theme-primary)"
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
