import { Container, SectionHead } from '../_shared/section';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { TAVAN_DEFAULTS } from './defaults';
import styles from './tavan.module.css';
import { templateHref } from '../_shared/routes';
import { editableList, editableItem } from '../_shared/editable-list';

interface TrackItem {
  index: string;
  title: string;
  body: string;
  meta: string;
}

export function TavanCategories({ id, config, storeContext }: TemplateSectionProps) {
  const d = TAVAN_DEFAULTS.categories;
  const items = list<TrackItem>(config, 'items', d.items);

  return (
    <section
      id={id || 'categories'}
      className="relative overflow-hidden bg-(--theme-background) text-(--theme-foreground)"
    >
      <span className={styles.ghostNum} aria-hidden="true">
        {text(config, 'eyebrow', d.eyebrow)}
      </span>

      <Container className="relative z-[2] py-(--theme-section-padding-y)">
        <SectionHead
          eyebrow={text(config, 'eyebrow', d.eyebrow)}
          title={text(config, 'title', d.title)}
          subtitle={text(config, 'subtitle', d.subtitle)}
        />

        <div className="grid gap-5 md:grid-cols-3" {...editableList('items', items)}>
          {items.map((item, index) => (
            <article
              key={item.title}
              className="flex flex-col gap-3 rounded-(--theme-border-radius) border border-(--theme-border-color) bg-(--theme-surface) p-7 shadow-(--theme-shadow)"
            >
              <span
                {...editableItem('items', index, 'index')}
                className="text-[42px] leading-none font-bold tracking-[-0.05em] text-(--theme-primary) tabular-nums"
              >
                {item.index}
              </span>
              <h3 {...editableItem('items', index, 'title')} className="mt-2 text-[23px] font-bold">
                {item.title}
              </h3>
              <p
                {...editableItem('items', index, 'body')}
                className="text-[15px] leading-[1.85] text-(--theme-muted)"
              >
                {item.body}
              </p>
              <a
                href={templateHref(storeContext, 'courses')}
                className="mt-auto pt-3 text-[13.5px] font-bold text-(--theme-primary) hover:underline"
              >
                <span {...editableItem('items', index, 'meta')}>{item.meta}</span> ←
              </a>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
