import { Container, SectionHead } from '../_shared/section';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { ELEKTRON_DEFAULTS } from './defaults';
import styles from './elektron.module.css';
import { editableList, editableItem } from '../_shared/editable-list';

interface FeatureItem {
  index: string;
  title: string;
  body: string;
}

/**
 * Asymmetric bento. The lead reason takes a tall dark tile on the studio stage;
 * the rest sit on light tiles in a deliberately uneven 6-column rhythm, so the
 * grid never reads as `repeat(3, 1fr)`.
 */
export function ElektronFeatures({ id, config }: TemplateSectionProps) {
  const d = ELEKTRON_DEFAULTS.features;
  const items = list<FeatureItem>(config, 'items', d.items);
  const [lead, ...rest] = items;
  // 6-col rhythm. The lead tile holds 2 columns across 2 rows, so the first two
  // rows take 4 each and the last row splits 3/3 — every row sums to 6, which
  // is what keeps the bento asymmetric without leaving ragged gaps.
  const spans = ['lg:col-span-4', 'lg:col-span-4', 'lg:col-span-3', 'lg:col-span-3'];

  return (
    <section id={id || 'features'} className="bg-(--theme-background) text-(--theme-foreground)">
      <Container className="py-(--theme-section-padding-y)">
        <SectionHead
          eyebrow={text(config, 'eyebrow', d.eyebrow)}
          title={text(config, 'title', d.title)}
          subtitle={text(config, 'subtitle', d.subtitle)}
        />

        <div className="grid gap-5 lg:grid-cols-6" {...editableList('items', items)}>
          {lead ? (
            <article
              className={`${styles.stage} relative flex flex-col justify-between overflow-hidden rounded-(--theme-border-radius) p-8 lg:col-span-2 lg:row-span-2`}
            >
              <span className={styles.mesh} aria-hidden="true" />
              <div className="relative z-[1]">
                <span
                  {...editableItem('items', 0, 'index')}
                  className="text-[12px] font-bold text-(--theme-accent)"
                >
                  {lead.index}
                </span>
                <h3
                  {...editableItem('items', 0, 'title')}
                  className="mt-3 text-[23px] leading-[1.3] font-bold"
                >
                  {lead.title}
                </h3>
                <p
                  {...editableItem('items', 0, 'body')}
                  className="mt-3 text-[15px] leading-[1.85] text-current/68"
                >
                  {lead.body}
                </p>
              </div>
              <span
                data-editable="pulseCaption"
                className={`${styles.chip} relative z-[1] mt-8 inline-block self-start px-3.5 py-1.5 text-[12.5px] font-bold`}
              >
                {text(config, 'pulseCaption', d.pulseCaption)}
              </span>
            </article>
          ) : null}

          {rest.map((item, index) => (
            <article
              key={item.title}
              className={`rounded-(--theme-border-radius) border border-(--theme-border-color) bg-(--theme-surface) p-6 shadow-(--theme-shadow) ${
                spans[index] ?? 'lg:col-span-2'
              }`}
            >
              <span
                {...editableItem('items', index + 1, 'index')}
                className="text-[12px] font-bold text-(--theme-primary)"
              >
                {item.index}
              </span>
              <h3
                {...editableItem('items', index + 1, 'title')}
                className="mt-3 text-[19px] leading-[1.35] font-bold"
              >
                {item.title}
              </h3>
              <p
                {...editableItem('items', index + 1, 'body')}
                className="mt-2.5 text-[14.5px] leading-[1.85] text-(--theme-muted)"
              >
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
