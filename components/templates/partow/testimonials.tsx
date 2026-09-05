import { list, text, type TemplateSectionProps } from '../_shared/types';
import { editableList, editableItem } from '../_shared/editable-list';
import { PARTOW_DEFAULTS } from './defaults';
import { Wrap, SectionHead } from './layout';
import styles from './partow.module.css';

interface QuoteItem {
  initials: string;
  name: string;
  role: string;
  quote: string;
}

/**
 * Student quotes on the one tinted band of the page.
 *
 * Monograms rather than photos: every preset ships images as null, and a row of
 * grey avatar placeholders would undercut the quotes more than initials do.
 */
export function PartowTestimonials({ id, config }: TemplateSectionProps) {
  const d = PARTOW_DEFAULTS.testimonials;
  const items = list<QuoteItem>(config, 'items', d.items);

  return (
    <section
      id={id || 'testimonials'}
      className="border-y border-(--theme-border-color) bg-(--theme-surface-alt) text-(--theme-foreground)"
    >
      <div className="py-(--theme-section-padding-y)">
        <Wrap>
          <SectionHead
            eyebrow={text(config, 'eyebrow', d.eyebrow)}
            title={text(config, 'title', d.title)}
            subtitle={text(config, 'subtitle', d.subtitle)}
          />

          <div
            className="mt-11 grid gap-5.5 text-start sm:grid-cols-2 lg:grid-cols-3"
            {...editableList('items', items)}
          >
            {items.map((item, index) => (
              <article key={item.name} className={`${styles.tcard} p-5.5`}>
                <span className={`${styles.rateBox} self-start`} aria-hidden="true">
                  ★★★★★
                </span>
                <p
                  {...editableItem('items', index, 'quote')}
                  className="mt-3.5 text-[14.5px] leading-[1.95]"
                >
                  {item.quote}
                </p>
                <div className="mt-auto flex items-center gap-3 pt-4.5">
                  <span className={styles.avatar} role="img" aria-label={item.name}>
                    {item.initials}
                  </span>
                  <span>
                    <b {...editableItem('items', index, 'name')} className="block text-[14px] font-medium">
                      {item.name}
                    </b>
                    <span
                      {...editableItem('items', index, 'role')}
                      className="block text-[12px] text-(--theme-muted)"
                    >
                      {item.role}
                    </span>
                  </span>
                </div>
              </article>
            ))}
          </div>
        </Wrap>
      </div>
    </section>
  );
}
