import { Container, SectionHead } from '../_shared/section';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { SHAFAGH_DEFAULTS } from './defaults';
import styles from './shafagh.module.css';
import { templateHref } from '../_shared/routes';
import { editableList, editableItem } from '../_shared/editable-list';

interface TrackItem {
  count: string;
  title: string;
  body: string;
  wide: boolean;
}

/**
 * Track index — one full-width row per path, in the voice of a magazine
 * contents page: outlined numeral, title, then the description in its own
 * column. A single column on purpose: mixing full-width rows into a two-column
 * grid tears holes in the auto-placement. `wide` marks the lead tracks, which
 * get a tinted plate and a larger title instead of their own column span.
 */
export function ShafaghCategories({ id, config, storeContext }: TemplateSectionProps) {
  const d = SHAFAGH_DEFAULTS.categories;
  const items = list<TrackItem>(config, 'items', d.items);

  return (
    <section id={id || 'categories'} className="bg-(--theme-background) text-(--theme-foreground)">
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
              className={`${styles.row} block`}
            >
              <span className={styles.hair} aria-hidden="true" />
              <div
                className={`flex items-center gap-6 py-7 transition-[padding] duration-200 ${
                  item.wide ? styles.leadRow : ''
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`${styles.numeral} flex-none transition-colors duration-200`}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>

                <div className="min-w-0 flex-1 md:flex md:items-baseline md:gap-10">
                  <div className="md:w-[34%] md:flex-none">
                    {/* Terracotta on purpose — not the inherited `a` colour. */}
                    <h3
                      {...editableItem('items', index, 'title')}
                      className={`leading-[1.3] font-bold text-(--theme-primary) ${
                        item.wide ? 'text-[25px]' : 'text-[21px]'
                      }`}
                    >
                      {item.title}
                    </h3>
                    <span className="mt-1.5 block text-[13px] font-bold text-(--theme-primary)">
                      <span {...editableItem('items', index, 'count')}>{item.count}</span> دوره
                    </span>
                  </div>
                  <p
                    {...editableItem('items', index, 'body')}
                    className="mt-3 text-[14.5px] leading-[1.85] text-(--theme-muted) md:mt-0"
                  >
                    {item.body}
                  </p>
                </div>

                <span
                  aria-hidden="true"
                  className={`${styles.arrow} hidden flex-none text-[20px] text-(--theme-primary) transition-transform duration-200 sm:block`}
                >
                  ←
                </span>
              </div>
            </a>
          ))}
          <span className={styles.hair} aria-hidden="true" />
        </div>
      </Container>
    </section>
  );
}
