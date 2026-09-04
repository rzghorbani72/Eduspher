import { Container, SectionHead } from '../_shared/section';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { ROUZAN_DEFAULTS } from './defaults';
import styles from './rouzan.module.css';
import { templateHref } from '../_shared/routes';
import { editableList, editableItem } from '../_shared/editable-list';

interface StepItem {
  step: string;
  title: string;
  body: string;
  meta: string;
}

/**
 * The learning path as a single vertical rule with three stops. A card wall
 * would say "pick one"; this says "do them in this order", which is the whole
 * promise of the page.
 */
export function RouzanCategories({ id, config, storeContext }: TemplateSectionProps) {
  const d = ROUZAN_DEFAULTS.categories;
  const items = list<StepItem>(config, 'items', d.items);

  return (
    <section id={id || 'categories'} className="bg-(--theme-surface-alt) text-(--theme-foreground)">
      <Container className="py-(--theme-section-padding-y)">
        <SectionHead
          eyebrow={text(config, 'eyebrow', d.eyebrow)}
          title={text(config, 'title', d.title)}
          subtitle={text(config, 'subtitle', d.subtitle)}
        />

        <div className="mx-auto max-w-[52rem]" {...editableList('items', items)}>
          {items.map((item, index) => (
            <a
              key={item.title}
              href={templateHref(storeContext, 'courses')}
              className={`${styles.step} block ps-8 pb-10 last:pb-0`}
            >
              <span className={styles.stepDot} aria-hidden="true" />
              <span
                {...editableItem('items', index, 'step')}
                className="text-[12.5px] font-bold text-(--theme-primary)"
              >
                {item.step}
              </span>
              <h3
                {...editableItem('items', index, 'title')}
                className={`${styles.stepTitle} mt-2 text-[22px] font-bold leading-[1.3]`}
              >
                {item.title}
              </h3>
              <p
                {...editableItem('items', index, 'body')}
                className="mt-2.5 max-w-[52ch] text-[15px] leading-[1.9] text-(--theme-muted)"
              >
                {item.body}
              </p>
              <span
                {...editableItem('items', index, 'meta')}
                className="mt-3 inline-block text-[13px] font-bold text-(--theme-muted)"
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
