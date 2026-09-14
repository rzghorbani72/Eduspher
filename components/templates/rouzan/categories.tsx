import { Button } from '../_shared/primitives';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { templateHref } from '../_shared/routes';
import { editableList, editableItem } from '../_shared/editable-list';
import { ROUZAN_DEFAULTS } from './defaults';
import { Wrap, SectionHead } from './layout';
import styles from './rouzan.module.css';

interface PathStep {
  no: string;
  title: string;
  meta: string;
}

interface PathItem {
  title: string;
  meta: string;
  featured?: boolean;
  tag?: string;
  steps: readonly PathStep[];
}

/**
 * Three ordered paths, not a category wall. Each card is a numbered list, so it
 * says "do these in this order"; the recommended one lifts out of the row and
 * inverts to the deep tone rather than shouting with a bigger button.
 */
export function RouzanCategories({ id, config, storeContext }: TemplateSectionProps) {
  const d = ROUZAN_DEFAULTS.categories;
  const items = list<PathItem>(config, 'items', d.items);
  const ctaText = text(config, 'ctaText', d.ctaText);

  return (
    <section id={id || 'categories'} className="bg-(--theme-background) text-(--theme-foreground)">
      <div className="py-(--theme-section-padding-y)">
        <Wrap>
          <SectionHead
            eyebrow={text(config, 'eyebrow', d.eyebrow)}
            title={text(config, 'title', d.title)}
            aside={
              <p
                data-editable="subtitle"
                className="max-w-[34ch] text-[14.5px] leading-[1.85] text-(--theme-muted)"
              >
                {text(config, 'subtitle', d.subtitle)}
              </p>
            }
          />

          <div
            className="mt-11 grid items-start gap-5 md:grid-cols-2 lg:grid-cols-3"
            {...editableList('items', items)}
          >
            {items.map((item, index) => (
              <article
                key={item.title}
                className={`${styles.path} ${item.featured ? `${styles.pathHi} px-6 pt-9 pb-7 lg:-mt-[18px]` : 'px-6 pt-7 pb-6'}`}
              >
                {item.featured && item.tag ? <span className={styles.ptag}>{item.tag}</span> : null}

                <h3
                  {...editableItem('items', index, 'title')}
                  className="text-[21px] leading-[1.3] font-bold"
                >
                  {item.title}
                </h3>
                <p
                  {...editableItem('items', index, 'meta')}
                  className={`${styles.pathMeta} mt-2 text-[12.5px]`}
                >
                  {item.meta}
                </p>

                <ol className="mt-5.5">
                  {item.steps.map((step) => (
                    <li
                      key={step.no}
                      className={`${styles.pathStep} grid grid-cols-[22px_1fr] items-baseline gap-3.5 py-2.5 text-[14.5px]`}
                    >
                      <span className={`${styles.stepNo} text-[12.5px] font-bold`}>{step.no}</span>
                      <span>
                        {step.title}
                        <span className={`${styles.stepMeta} block text-[12.5px]`}>
                          {step.meta}
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>

                <Button
                  tone={item.featured ? 'primary' : 'outline'}
                  size="sm"
                  href={templateHref(storeContext, 'courses')}
                  className="mt-5.5 w-full !rounded-lg"
                >
                  {ctaText}
                </Button>
              </article>
            ))}
          </div>
        </Wrap>
      </div>
    </section>
  );
}
