import { list, text, type TemplateSectionProps } from '../_shared/types';
import { editableList, editableItem } from '../_shared/editable-list';
import { PARTOW_DEFAULTS } from './defaults';
import { Wrap, SectionHead } from './layout';
import styles from './partow.module.css';

interface ReasonItem {
  eyebrow: string;
  title: string;
  body: string;
  figure: string;
}

/**
 * The argument for the course, told as alternating rows rather than a card
 * grid: each claim gets a full paragraph and its own plate, and the side it
 * sits on flips every row so the eye keeps moving down the page.
 */
export function PartowFeatures({ id, config }: TemplateSectionProps) {
  const d = PARTOW_DEFAULTS.features;
  const items = list<ReasonItem>(config, 'items', d.items);

  return (
    <section id={id || 'features'} className="bg-(--theme-background) text-(--theme-foreground)">
      <div className="py-(--theme-section-padding-y)">
        <Wrap>
          <SectionHead
            eyebrow={text(config, 'eyebrow', d.eyebrow)}
            title={text(config, 'title', d.title)}
          />

          <div className="mt-14 grid gap-16 lg:gap-24" {...editableList('items', items)}>
            {items.map((item, index) => (
              <div
                key={item.title}
                className="grid items-center gap-8 lg:grid-cols-2 lg:gap-18"
              >
                {/* Even rows put the plate first on wide screens; on narrow ones
                    the text always leads, so the order never reads as random. */}
                <div className={index % 2 === 1 ? 'lg:order-2' : undefined}>
                  <div className={styles.ficon} aria-hidden="true">
                    ◆
                  </div>
                  <p
                    {...editableItem('items', index, 'eyebrow')}
                    className={`${styles.eyebrow} mt-4.5`}
                  >
                    {item.eyebrow}
                  </p>
                  <h3
                    {...editableItem('items', index, 'title')}
                    className="mt-2 max-w-[22ch] text-[clamp(21px,2.4vw,28px)] font-bold leading-[1.35]"
                  >
                    {item.title}
                  </h3>
                  <p
                    {...editableItem('items', index, 'body')}
                    className="mt-3.5 max-w-[48ch] text-[15.5px] leading-[1.95] text-(--theme-muted)"
                  >
                    {item.body}
                  </p>
                </div>

                <div className={`${styles.fig} grid aspect-4/3 max-h-90 place-items-center`}>
                  <span
                    {...editableItem('items', index, 'figure')}
                    className={`${styles.figLabel} text-[12.5px]`}
                  >
                    {item.figure}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Wrap>
      </div>
    </section>
  );
}
