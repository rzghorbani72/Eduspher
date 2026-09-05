import { list, text, type TemplateSectionProps } from '../_shared/types';
import { editableList, editableItem } from '../_shared/editable-list';
import { PARTOW_DEFAULTS } from './defaults';
import { Wrap, SectionHead } from './layout';
import styles from './partow.module.css';

interface FaqItem {
  no: string;
  question: string;
  answer: string;
}

/**
 * Partow's signature section: the questions a visitor asks right before paying.
 *
 * Built on native `<details>`, so the list opens and closes with no JavaScript
 * and every answer stays in the server-rendered HTML — the page is indexed with
 * its answers, not with seven empty headings.
 */
export function PartowShowcase({ id, config }: TemplateSectionProps) {
  const d = PARTOW_DEFAULTS.showcase;
  const items = list<FaqItem>(config, 'items', d.items);

  return (
    <section id={id || 'showcase'} className="bg-(--theme-background) text-(--theme-foreground)">
      <div className="py-(--theme-section-padding-y)">
        <Wrap>
          <SectionHead
            eyebrow={text(config, 'eyebrow', d.eyebrow)}
            title={text(config, 'title', d.title)}
            subtitle={text(config, 'subtitle', d.subtitle)}
          />

          <div
            className={`${styles.acc} mx-auto mt-13 max-w-[880px] text-start`}
            {...editableList('items', items)}
          >
            {items.map((item, index) => (
              <details key={item.no} open={index === 0}>
                <summary>
                  <b className={styles.accNo}>{item.no}</b>
                  <span {...editableItem('items', index, 'question')} className="min-w-0 flex-1">
                    {item.question}
                  </span>
                  <span className={styles.accMark} aria-hidden="true" />
                </summary>
                <div {...editableItem('items', index, 'answer')} className={styles.accBody}>
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </Wrap>
      </div>
    </section>
  );
}
