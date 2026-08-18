import { Container, SectionHead } from '../_shared/section';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { ZABANEH_DEFAULTS } from './defaults';
import styles from './zabaneh.module.css';

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
export function ZabanehLevels({ id, config }: TemplateSectionProps) {
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

        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step) => (
            <li
              key={step.code}
              className="rounded-(--theme-border-radius) border border-(--theme-border-color) bg-(--theme-surface) shadow-(--theme-shadow) p-6"
            >
              <span
                dir="ltr"
                className="inline-block rounded-(--theme-border-radius) bg-(--theme-primary) px-3 py-1 text-[14px] font-bold text-(--theme-on-primary)"
              >
                {step.code}
              </span>
              <h3 className="mt-4 text-[20px] font-bold">{step.title}</h3>
              <p className="mt-2 text-[14.5px] leading-[1.8] text-(--theme-muted)">{step.body}</p>
              <p className="mt-3 text-[13px] font-bold text-(--theme-ink-2)">میانگین {step.duration}</p>

              <div className="mt-4 h-1.5 rounded-full bg-(--theme-border-color)">
                <span className={styles.bar} style={{ width: `${step.fill}%`, display: 'block' }} />
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-9 flex flex-col gap-4 rounded-(--theme-border-radius) border border-(--theme-border-color) bg-(--theme-surface) shadow-(--theme-shadow) p-6 md:flex-row md:items-center md:justify-between">
          <p className="max-w-[62ch] text-[15px] leading-[1.85] text-(--theme-muted)">{d.footNote}</p>
          <a href="#cta" className="whitespace-nowrap text-[14.5px] font-bold text-(--theme-primary) hover:underline">
            {d.footCta} ←
          </a>
        </div>
      </Container>
    </section>
  );
}
