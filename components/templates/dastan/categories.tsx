import { Container } from '../_shared/section';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { DASTAN_DEFAULTS } from './defaults';
import { templateHref } from '../_shared/routes';
import { editableList, editableItem } from '../_shared/editable-list';

interface KitchenItem {
  index: string;
  title: string;
  body: string;
  lead: boolean;
}

/** Asymmetric tile wall: one lead tile spans two rows, four sit beside it. */
export function DastanCategories({ id, config, storeContext }: TemplateSectionProps) {
  const d = DASTAN_DEFAULTS.categories;
  const items = list<KitchenItem>(config, 'items', d.items);

  return (
    <section
      id={id || 'categories'}
      className="border-t border-(--theme-border-color) bg-(--theme-background) text-(--theme-foreground)"
    >
      <Container className="py-(--theme-section-padding-y)">
        <p className="mb-5 flex items-center gap-3 text-[13px] font-medium tracking-[0.16em] text-(--theme-primary)">
          <span data-editable="eyebrow">{text(config, 'eyebrow', d.eyebrow)}</span>
          <span aria-hidden="true" className="h-px flex-1 bg-(--theme-border-color)" />
        </p>

        <h2
          data-editable="title"
          className="mb-10 max-w-[22ch] text-[clamp(28px,4vw,40px)] leading-[1.25] font-bold tracking-[-0.02em]"
        >
          {text(config, 'title', d.title)}
        </h2>

        <div
          className="grid gap-5 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]"
          {...editableList('items', items)}
        >
          {items.map((item, index) => (
            <a
              key={item.title}
              href={templateHref(storeContext, 'courses')}
              className={`group flex min-h-[158px] flex-col justify-between rounded-(--theme-border-radius) border p-6 transition-colors duration-200 ${
                item.lead
                  ? 'border-(--theme-deep) bg-(--theme-deep) text-(--theme-on-deep) hover:bg-(--theme-primary) hover:text-(--theme-on-primary) lg:row-span-2'
                  : 'border-(--theme-border-color) bg-(--theme-surface) hover:border-(--theme-deep) hover:bg-(--theme-deep) hover:text-(--theme-on-deep)'
              }`}
            >
              <span
                {...editableItem('items', index, 'index')}
                className={`text-[12px] font-bold tracking-[0.16em] ${
                  item.lead
                    ? 'text-(--theme-accent)'
                    : 'text-(--theme-primary) group-hover:text-(--theme-accent)'
                }`}
              >
                {item.index}
              </span>
              <div>
                <h3
                  {...editableItem('items', index, 'title')}
                  className={`font-bold ${item.lead ? 'text-[30px]' : 'text-[21px]'}`}
                >
                  {item.title}
                </h3>
                <p
                  {...editableItem('items', index, 'body')}
                  className={`mt-2 text-[14px] leading-[1.8] ${
                    item.lead
                      ? 'text-current/72'
                      : 'text-(--theme-muted) group-hover:text-current/72'
                  }`}
                >
                  {item.body}
                </p>
              </div>
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
}
