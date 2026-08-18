import { Container } from '../_shared/section';
import { Button } from '../_shared/primitives';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { DASTAN_DEFAULTS } from './defaults';
import styles from './dastan.module.css';

interface FeatureItem {
  kicker: string;
  title: string;
  body: string;
}

const RULE_CLASS = [styles.featRule, `${styles.featRule} ${styles.featRule2}`, `${styles.featRule} ${styles.featRule3}`];

/** Ruled editorial columns plus a full-width proof strip carrying one big number. */
export function DastanFeatures({ id, config }: TemplateSectionProps) {
  const d = DASTAN_DEFAULTS.features;
  const items = list<FeatureItem>(config, 'items', d.items);

  return (
    <section id={id || 'features'} className="border-t border-(--theme-border-color) bg-(--theme-background) text-(--theme-foreground)">
      <Container className="py-(--theme-section-padding-y)">
        <div className="mb-12 grid gap-8 md:grid-cols-2 md:items-end">
          <h2
            data-editable="title"
            className="text-[clamp(28px,4vw,44px)] font-bold leading-[1.2] tracking-[-0.02em]"
          >
            {text(config, 'title', d.title)}
          </h2>
          <p data-editable="subtitle" className="text-[17px] leading-[1.85] text-(--theme-muted)">
            {text(config, 'subtitle', d.subtitle)}
          </p>
        </div>

        <div className="grid gap-x-9 gap-y-8 md:grid-cols-3">
          {items.map((item, index) => (
            <article
              key={item.title}
              className={`pt-7 md:border-e md:border-(--theme-border-color) md:pe-9 md:last:border-0 md:last:pe-0 ${
                RULE_CLASS[index % RULE_CLASS.length]
              }`}
            >
              <span className="block text-[12px] font-bold tracking-[0.18em] text-(--theme-muted)">{item.kicker}</span>
              <h3 className="mt-3.5 text-[23px] font-bold leading-[1.35]">{item.title}</h3>
              <p className="mt-3 text-[15px] leading-[1.85] text-(--theme-muted)">{item.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 grid items-center gap-8 rounded-(--theme-border-radius) border border-(--theme-border-color) bg-(--theme-surface-alt) p-8 md:grid-cols-[auto_1fr_auto]">
          <span className="text-[52px] font-bold leading-none text-(--theme-primary) tabular-nums">
            {d.highlight.value}
          </span>
          <div>
            <h3 className="text-[21px] font-bold leading-[1.4]">{d.highlight.title}</h3>
            <p className="mt-2 text-[15px] leading-[1.8] text-(--theme-muted)">{d.highlight.body}</p>
          </div>
          <Button tone="outline" size="sm">
            {d.highlight.ctaText}
          </Button>
        </div>
      </Container>
    </section>
  );
}
