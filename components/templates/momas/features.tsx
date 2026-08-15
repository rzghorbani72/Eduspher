import { Container, SectionHead } from '../_shared/section';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { MOMAS_DEFAULTS } from './defaults';
import styles from './momas.module.css';

interface MethodStep {
  step: string;
  title: string;
  body: string;
}

/** Numbered method steps — a vertical argument, read top to bottom. */
export function MomasFeatures({ id, config }: TemplateSectionProps) {
  const d = MOMAS_DEFAULTS.features;
  const items = list<MethodStep>(config, 'items', d.items);

  return (
    <section id={id || 'features'} className="bg-(--theme-surface-alt) text-(--theme-foreground)">
      <Container className="py-(--theme-section-padding-y)">
        <SectionHead
          eyebrow={text(config, 'eyebrow', d.eyebrow)}
          title={text(config, 'title', d.title)}
          subtitle={text(config, 'subtitle', d.subtitle)}
        />

        <ol className="grid gap-5">
          {items.map((item) => (
            <li
              key={item.step}
              className="grid gap-5 rounded-(--theme-border-radius) border border-(--theme-border-color) bg-(--theme-surface) p-7 md:grid-cols-[90px_1fr] md:items-start"
            >
              <span
                className={`text-[46px] font-bold leading-none text-(--theme-primary) opacity-40 ${styles.mono}`}
              >
                {item.step}
              </span>
              <div>
                <h3 className="text-[22px] font-bold leading-[1.35]">{item.title}</h3>
                <p className="mt-3 max-w-[70ch] text-[15.5px] leading-[1.85] text-(--theme-muted)">{item.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
