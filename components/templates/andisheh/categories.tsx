import { Container, SectionHead } from '../_shared/section';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { ANDISHEH_DEFAULTS } from './defaults';
import styles from './andisheh.module.css';
import { templateHref } from '../_shared/routes';
import { editableList, editableItem } from '../_shared/editable-list';

interface TrackItem {
  code: string;
  title: string;
  body: string;
  meta: string;
}

/**
 * Specialisation rows sharing one rail, so the four tracks read as branches of
 * a single pipeline rather than four competing products.
 */
export function AndishehCategories({ id, config, storeContext }: TemplateSectionProps) {
  const d = ANDISHEH_DEFAULTS.categories;
  const items = list<TrackItem>(config, 'items', d.items);

  return (
    <section id={id || 'categories'} className="bg-(--theme-surface-alt) text-(--theme-foreground)">
      <Container className="py-(--theme-section-padding-y)">
        <SectionHead
          eyebrow={text(config, 'eyebrow', d.eyebrow)}
          title={text(config, 'title', d.title)}
          subtitle={text(config, 'subtitle', d.subtitle)}
        />

        <div {...editableList('items', items)}>
          {items.map((item, index) => (
            <a
              key={item.title}
              href={templateHref(storeContext, 'courses')}
              className={`${styles.track} flex flex-wrap items-center gap-x-8 gap-y-3 py-7 ps-7`}
            >
              <span
                {...editableItem('items', index, 'code')}
                className={`${styles.mono} flex-none text-[12.5px] font-bold text-(--theme-primary)`}
              >
                {item.code}
              </span>
              <h3
                {...editableItem('items', index, 'title')}
                className="flex-none text-[21px] font-bold leading-[1.3] md:w-[26%]"
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
                className="flex-none text-[13px] font-bold text-(--theme-muted)"
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
