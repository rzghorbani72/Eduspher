import { Container, SectionHead } from '../_shared/section';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { SHAFAGH_DEFAULTS } from './defaults';
import styles from './shafagh.module.css';

interface FeatureItem {
  index: string;
  title: string;
  body: string;
}

/** Asymmetric bento with a gradient-capped lead card and a gallery caption tile. */
export function ShafaghFeatures({ id, config }: TemplateSectionProps) {
  const d = SHAFAGH_DEFAULTS.features;
  const items = list<FeatureItem>(config, 'items', d.items);
  const [lead, ...rest] = items;

  return (
    <section id={id || 'features'} className="bg-(--theme-surface-alt) text-(--theme-foreground)">
      <Container className="py-(--theme-section-padding-y)">
        <SectionHead
          eyebrow={text(config, 'eyebrow', d.eyebrow)}
          title={text(config, 'title', d.title)}
          subtitle={text(config, 'subtitle', d.subtitle)}
        />

        <div className="grid gap-5 lg:grid-cols-6">
          {lead ? (
            <article className="overflow-hidden rounded-(--theme-border-radius) border border-(--theme-border-color) bg-(--theme-surface) shadow-(--theme-shadow) lg:col-span-6">
              <div className={styles.cap} aria-hidden="true" />
              <div className="grid gap-8 p-7 md:grid-cols-[1.2fr_0.8fr] md:items-center">
                <div>
                  <span className="text-[12px] font-bold tracking-[0.14em] text-(--theme-primary)">{lead.index}</span>
                  <h3 className="mt-3 text-[24px] font-bold leading-[1.3]">{lead.title}</h3>
                  <p className="mt-3 text-[15.5px] leading-[1.85] text-(--theme-muted)">{lead.body}</p>
                </div>
                <div className="grid place-items-center rounded-(--theme-border-radius) bg-(--theme-accent) p-6 text-center text-(--theme-on-accent)">
                  <span className="text-[13px] font-bold tracking-[0.16em]">
                    {text(config, 'frameCaption', d.frameCaption)}
                  </span>
                </div>
              </div>
            </article>
          ) : null}

          {rest.map((item) => (
            <article
              key={item.title}
              className="overflow-hidden rounded-(--theme-border-radius) border border-(--theme-border-color) bg-(--theme-surface) shadow-(--theme-shadow) lg:col-span-3"
            >
              <div className={styles.cap} aria-hidden="true" />
              <div className="p-6">
                <span className="text-[12px] font-bold tracking-[0.14em] text-(--theme-primary)">{item.index}</span>
                <h3 className="mt-3 text-[20px] font-bold leading-[1.35]">{item.title}</h3>
                <p className="mt-3 text-[15px] leading-[1.85] text-(--theme-muted)">{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
