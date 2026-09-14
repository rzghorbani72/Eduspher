import { Container, SectionHead } from '../_shared/section';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { NOKHBEH_DEFAULTS } from './defaults';
import styles from './nokhbeh.module.css';
import { editableList, editableItem } from '../_shared/editable-list';

interface MethodStep {
  step: string;
  title: string;
  body: string;
}

/** Numbered method steps — a vertical argument, read top to bottom. */
export function NokhbehFeatures({ id, config }: TemplateSectionProps) {
  const d = NOKHBEH_DEFAULTS.features;
  const items = list<MethodStep>(config, 'items', d.items);

  return (
    <section id={id || 'features'} className="bg-(--theme-surface-alt) text-(--theme-foreground)">
      <Container className="py-(--theme-section-padding-y)">
        <SectionHead
          eyebrow={text(config, 'eyebrow', d.eyebrow)}
          title={text(config, 'title', d.title)}
          subtitle={text(config, 'subtitle', d.subtitle)}
        />

        <ol className="grid gap-5" {...editableList('items', items)}>
          {items.map((item, index) => (
            <li
              key={item.step}
              className="grid gap-5 rounded-(--theme-border-radius) border border-(--theme-border-color) bg-(--theme-surface) p-7 shadow-(--theme-shadow) md:grid-cols-[90px_1fr] md:items-start"
            >
              <span
                {...editableItem('items', index, 'step')}
                className={`text-[46px] leading-none font-bold text-(--theme-primary) opacity-40 ${styles.mono}`}
              >
                {item.step}
              </span>
              <div>
                <h3
                  {...editableItem('items', index, 'title')}
                  className="text-[22px] leading-[1.35] font-bold"
                >
                  {item.title}
                </h3>
                <p
                  {...editableItem('items', index, 'body')}
                  className="mt-3 max-w-[70ch] text-[15.5px] leading-[1.85] text-(--theme-muted)"
                >
                  {item.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
