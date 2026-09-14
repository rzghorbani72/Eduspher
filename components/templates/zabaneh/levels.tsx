import { Container, SectionHead } from '../_shared/section';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { ZABANEH_DEFAULTS } from './defaults';
import styles from './zabaneh.module.css';
import { templateHref } from '../_shared/routes';
import { editableList, editableItem } from '../_shared/editable-list';

interface LevelStep {
  code: string;
  title: string;
  body: string;
  duration: string;
  fill: number;
}

/**
 * Zabaneh's signature section: the CEFR ladder as six cards, each carrying a
 * fill bar so the distance still travelled is visible at a glance.
 */
export function ZabanehLevels({ id, config, storeContext }: TemplateSectionProps) {
  const d = ZABANEH_DEFAULTS.levels;
  const steps = list<LevelStep>(config, 'steps', d.steps);

  return (
    <section id={id || 'showcase'} className="bg-(--theme-surface-alt) text-(--theme-foreground)">
      <Container className="py-(--theme-section-padding-y)">
        <SectionHead
          eyebrow={text(config, 'eyebrow', d.eyebrow)}
          title={text(config, 'title', d.title)}
          subtitle={text(config, 'subtitle', d.subtitle)}
        />

        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" {...editableList('steps', steps)}>
          {steps.map((step, index) => (
            <li
              key={step.code}
              className="rounded-(--theme-border-radius) border border-(--theme-border-color) bg-(--theme-surface) p-6 shadow-(--theme-shadow)"
            >
              <span
                dir="ltr"
                {...editableItem('steps', index, 'code')}
                className="inline-block rounded-(--theme-border-radius) bg-(--theme-primary) px-3 py-1 text-[14px] font-bold text-(--theme-on-primary)"
              >
                {step.code}
              </span>
              <h3 {...editableItem('steps', index, 'title')} className="mt-4 text-[20px] font-bold">
                {step.title}
              </h3>
              <p
                {...editableItem('steps', index, 'body')}
                className="mt-2 text-[14.5px] leading-[1.8] text-(--theme-muted)"
              >
                {step.body}
              </p>
              <p className="mt-3 text-[13px] font-bold text-(--theme-ink-2)">
                <span data-editable="durationLabel">
                  {text(config, 'durationLabel', d.durationLabel)}
                </span>{' '}
                <span {...editableItem('steps', index, 'duration')}>{step.duration}</span>
              </p>

              <div
                className="mt-4 h-1.5 rounded-full bg-(--theme-border-color)"
                data-editable-range={`steps.${index}.fill`}
              >
                <span className={styles.bar} style={{ width: `${step.fill}%`, display: 'block' }} />
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-9 flex flex-col gap-4 rounded-(--theme-border-radius) border border-(--theme-border-color) bg-(--theme-surface) p-6 shadow-(--theme-shadow) md:flex-row md:items-center md:justify-between">
          <p
            data-editable="footNote"
            className="max-w-[62ch] text-[15px] leading-[1.85] text-(--theme-muted)"
          >
            {text(config, 'footNote', d.footNote)}
          </p>
          <a
            href={templateHref(storeContext, 'register')}
            className="text-[14.5px] font-bold whitespace-nowrap text-(--theme-primary) hover:underline"
          >
            <span data-editable="footCta">{text(config, 'footCta', d.footCta)}</span> ←
          </a>
        </div>
      </Container>
    </section>
  );
}
