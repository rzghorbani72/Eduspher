import { Container, Eyebrow } from '../_shared/section';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { SHAFAGH_DEFAULTS } from './defaults';
import styles from './shafagh.module.css';
import { editableList, editableItem } from '../_shared/editable-list';

interface FeatureItem {
  index: string;
  title: string;
  body: string;
}

/**
 * Editorial manifesto: an oversized lead statement, then the reasons as
 * hairline-separated rows with outlined numerals. No card boxes — the rules and
 * the numerals do the structuring.
 */
export function ShafaghFeatures({ id, config }: TemplateSectionProps) {
  const d = SHAFAGH_DEFAULTS.features;
  const items = list<FeatureItem>(config, 'items', d.items);

  return (
    <section id={id || 'features'} className="bg-(--theme-surface-alt) text-(--theme-foreground)">
      <Container className="py-(--theme-section-padding-y)">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-end">
          <div>
            <Eyebrow className="mb-5">
              <span data-editable="eyebrow">{text(config, 'eyebrow', d.eyebrow)}</span>
            </Eyebrow>
            <h2
              data-editable="title"
              className="max-w-[16ch] text-[clamp(30px,4.6vw,54px)] leading-[1.08] font-extrabold tracking-[-0.03em]"
            >
              {text(config, 'title', d.title)}
            </h2>
          </div>
          <p
            data-editable="subtitle"
            className="max-w-[46ch] text-[16.5px] leading-[1.9] text-(--theme-muted)"
          >
            {text(config, 'subtitle', d.subtitle)}
          </p>
        </div>

        <div className="mt-14 grid gap-x-14 md:grid-cols-2" {...editableList('items', items)}>
          {items.map((item, index) => (
            <article key={item.title} className={styles.row}>
              <span className={styles.hair} aria-hidden="true" />
              <div className="flex gap-6 py-8">
                <span
                  aria-hidden="true"
                  className={`${styles.numeral} flex-none transition-colors duration-200`}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <span
                    {...editableItem('items', index, 'index')}
                    className="text-[12px] font-bold text-(--theme-primary)"
                  >
                    {item.index}
                  </span>
                  <h3
                    {...editableItem('items', index, 'title')}
                    className="mt-2 text-[20px] leading-[1.35] font-bold"
                  >
                    {item.title}
                  </h3>
                  <p
                    {...editableItem('items', index, 'body')}
                    className="mt-2.5 text-[14.5px] leading-[1.85] text-(--theme-muted)"
                  >
                    {item.body}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-5">
          <span className={`${styles.hair} flex-1`} aria-hidden="true" />
          <span
            data-editable="frameCaption"
            className="text-[13px] font-bold text-(--theme-primary)"
          >
            {text(config, 'frameCaption', d.frameCaption)}
          </span>
        </div>
      </Container>
    </section>
  );
}
