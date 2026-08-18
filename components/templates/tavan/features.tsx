import { Container, SectionHead } from '../_shared/section';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { TAVAN_DEFAULTS } from './defaults';
import styles from './tavan.module.css';

interface FeatureItem {
  kicker: string;
  title: string;
  body: string;
  size: 'tall' | 'wide' | 'half';
  rows: readonly { label: string; value: string }[];
}

const SPAN: Record<FeatureItem['size'], string> = {
  tall: 'lg:col-span-2 lg:row-span-2',
  wide: 'lg:col-span-4',
  half: 'lg:col-span-2',
};

/** Bento grid: one tall spec card, one wide card, two halves, plus a quote. */
export function TavanFeatures({ id, config }: TemplateSectionProps) {
  const d = TAVAN_DEFAULTS.features;
  const items = list<FeatureItem>(config, 'items', d.items);

  return (
    <section id={id || 'features'} className="relative overflow-hidden bg-(--theme-background) text-(--theme-foreground)">
      <div className={styles.ruleGrid} aria-hidden="true" />
      <span className={styles.ghostNum} aria-hidden="true">
        {text(config, 'eyebrow', d.eyebrow)}
      </span>

      <Container className="relative z-[2] py-(--theme-section-padding-y)">
        <SectionHead
          eyebrow={text(config, 'eyebrow', d.eyebrow)}
          title={text(config, 'title', d.title)}
          subtitle={text(config, 'subtitle', d.subtitle)}
        />

        <div className="grid gap-5 lg:grid-cols-6">
          {items.map((item) => (
            <article
              key={item.title}
              className={`flex flex-col rounded-(--theme-border-radius) border border-(--theme-border-color) bg-(--theme-surface) shadow-(--theme-shadow) p-6 ${SPAN[item.size]}`}
            >
              <span className="text-[12px] font-bold tracking-[0.14em] text-(--theme-primary)">{item.kicker}</span>
              <h3 className="mt-3 text-[21px] font-bold leading-[1.35]">{item.title}</h3>
              <p className="mt-3 text-[15px] leading-[1.85] text-(--theme-muted)">{item.body}</p>

              {item.rows.length > 0 ? (
                <ul className="mt-6 grid gap-px overflow-hidden rounded-(--theme-border-radius) bg-(--theme-border-color)">
                  {item.rows.map((row) => (
                    <li
                      key={row.label}
                      className="flex items-baseline justify-between gap-4 bg-(--theme-surface-alt) px-4 py-3 text-[14px]"
                    >
                      <span className="text-(--theme-muted)">{row.label}</span>
                      <b className="whitespace-nowrap font-bold">{row.value}</b>
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}

          <blockquote className="rounded-(--theme-border-radius) border-s-4 border-(--theme-primary) bg-(--theme-surface-alt) p-6 lg:col-span-6">
            <p className="text-[17px] leading-[1.85]">{d.quote.body}</p>
            <cite className="mt-3 block text-[13.5px] not-italic text-(--theme-muted)">{d.quote.cite}</cite>
          </blockquote>
        </div>
      </Container>
    </section>
  );
}
