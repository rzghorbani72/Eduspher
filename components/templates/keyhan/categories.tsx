import { Container, SectionHead } from '../_shared/section';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { KEYHAN_DEFAULTS } from './defaults';
import { templateHref } from '../_shared/routes';
import { editableList, editableItem } from '../_shared/editable-list';

interface TopicItem {
  count: string;
  title: string;
  body: string;
  wide: boolean;
}

/** Asymmetric tile grid — two lead tiles span the full row, three sit 1-up. */
export function KeyhanCategories({ id, config, storeContext }: TemplateSectionProps) {
  const d = KEYHAN_DEFAULTS.categories;
  const items = list<TopicItem>(config, 'items', d.items);

  return (
    <section id={id || 'categories'} className="bg-(--theme-background) text-(--theme-foreground)">
      <Container className="py-(--theme-section-padding-y)">
        <SectionHead
          eyebrow={text(config, 'eyebrow', d.eyebrow)}
          title={text(config, 'title', d.title)}
          subtitle={text(config, 'subtitle', d.subtitle)}
        />

        <div className="grid gap-5 md:grid-cols-3" {...editableList('items', items)}>
          {items.map((item, index) => (
            <a
              key={item.title}
              href={templateHref(storeContext, 'courses')}
              className={`group flex flex-col gap-3 rounded-(--theme-border-radius) border border-(--theme-border-color) bg-(--theme-surface) p-6 shadow-(--theme-shadow) transition-[transform,border-color,background-color] duration-200 hover:-translate-y-1 hover:border-(--theme-primary) ${
                item.wide ? 'md:col-span-3 lg:col-span-3' : ''
              }`}
            >
              <span className="text-[13px] font-bold tracking-[0.14em] text-(--theme-primary)">
                <span {...editableItem('items', index, 'count')}>{item.count}</span> دوره
              </span>
              <h3
                {...editableItem('items', index, 'title')}
                className="text-[21px] leading-[1.35] font-bold"
              >
                {item.title}
              </h3>
              <p
                {...editableItem('items', index, 'body')}
                className="text-[14.5px] leading-[1.8] text-(--theme-muted)"
              >
                {item.body}
              </p>
              <span className="mt-auto pt-2 text-[13.5px] font-bold text-(--theme-primary) transition-transform duration-200 group-hover:-translate-x-1">
                مشاهدهٔ دوره‌ها ←
              </span>
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
}
