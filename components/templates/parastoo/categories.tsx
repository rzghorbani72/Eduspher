import { Container, SectionHead } from '../_shared/section';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { PARASTOO_DEFAULTS } from './defaults';
import styles from './parastoo.module.css';
import { editableList, editableItem } from '../_shared/editable-list';

interface MethodItem {
  index: string;
  title: string;
  ages: string;
  ops: readonly string[];
  body: string;
}

/** Staggered method rows — each step indents further, so the eye walks down. */
export function ParastooCategories({ id, config }: TemplateSectionProps) {
  const d = PARASTOO_DEFAULTS.categories;
  const items = list<MethodItem>(config, 'items', d.items);

  return (
    <section id={id || 'categories'} className="bg-(--theme-surface) text-(--theme-foreground)">
      <Container className="py-(--theme-section-padding-y)">
        <SectionHead
          eyebrow={text(config, 'eyebrow', d.eyebrow)}
          title={text(config, 'title', d.title)}
          subtitle={text(config, 'subtitle', d.subtitle)}
        />

        <div className="grid gap-5" {...editableList('items', items)}>
          {items.map((item, index) => (
            <article
              key={item.title}
              className={`grid gap-6 rounded-[34px] bg-(--theme-background) p-7 md:grid-cols-[110px_1.1fr_1fr] md:items-center ${styles.outline}`}
              style={{ marginInlineStart: `${index * 52}px` }}
            >
              <span
                {...editableItem('items', index, 'index')}
                className="text-[68px] leading-[0.8] font-bold tracking-[-0.06em] text-(--theme-primary) tabular-nums"
              >
                {item.index}
              </span>

              <div>
                <h3 {...editableItem('items', index, 'title')} className="text-[26px] font-bold">
                  {item.title}
                </h3>
                <p
                  {...editableItem('items', index, 'ages')}
                  className="mt-1.5 text-[14px] font-bold text-(--theme-muted)"
                >
                  {item.ages}
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {item.ops.map((op, opIndex) => (
                    <li
                      key={op}
                      {...editableItem('items', index, 'ops', opIndex)}
                      className={`rounded-[10px] bg-(--theme-surface) px-3 py-1 text-[13.5px] font-bold ${styles.outline}`}
                    >
                      {op}
                    </li>
                  ))}
                </ul>
              </div>

              <p
                {...editableItem('items', index, 'body')}
                className="text-[15.5px] leading-[1.8] text-(--theme-ink-2)"
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
