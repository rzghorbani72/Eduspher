import { Container, SectionHead } from '../_shared/section';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { PARASTOO_DEFAULTS } from './defaults';
import styles from './parastoo.module.css';
import { editableList, editableItem } from '../_shared/editable-list';

const ABACUS_RODS = [
  [true, true, false, false],
  [true, false, false, true],
  [false, true, true, false],
] as const;

/** Six-column bento: 4+2 on top, 2+4 below — deliberately asymmetric. */
export function ParastooFeatures({ id, config }: TemplateSectionProps) {
  const d = PARASTOO_DEFAULTS.features;
  const leadChips = list<string>(config, 'leadChips', d.lead.chips);

  return (
    <section id={id || 'features'} className="bg-(--theme-surface-alt) text-(--theme-foreground)">
      <Container className="py-(--theme-section-padding-y)">
        <SectionHead
          eyebrow={text(config, 'eyebrow', d.eyebrow)}
          title={text(config, 'title', d.title)}
          subtitle={text(config, 'subtitle', d.subtitle)}
        />

        <div className="grid gap-5 lg:grid-cols-6">
          <article
            className={`relative overflow-hidden rounded-[34px] bg-(--theme-surface) p-8 lg:col-span-4 ${styles.outline}`}
          >
            <span
              aria-hidden="true"
              className={`absolute -start-10 -bottom-10 size-44 rounded-[60px] bg-(--theme-primary-subtle)`}
            />
            <div className="relative z-[2] max-w-[74%]">
              <h3 data-editable="leadTitle" className="text-[25px] font-bold">
                {text(config, 'leadTitle', d.lead.title)}
              </h3>
              <p
                data-editable="leadBody"
                className="mt-3 text-[15.5px] leading-[1.8] text-(--theme-muted)"
              >
                {text(config, 'leadBody', d.lead.body)}
              </p>
              <ul className="mt-5 flex flex-wrap gap-2.5" {...editableList('leadChips', leadChips)}>
                {leadChips.map((chip, index) => (
                  <li
                    key={chip}
                    {...editableItem('leadChips', index)}
                    className="rounded-full bg-(--theme-accent-subtle) px-4 py-1.5 text-[13px] font-bold text-(--theme-accent)"
                  >
                    {chip}
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <article
            className={`rounded-[34px] bg-(--theme-accent) p-8 text-(--theme-on-accent) lg:col-span-2 ${styles.outline}`}
          >
            <span
              data-editable="statValue"
              className="block text-[76px] leading-none font-bold tracking-[-0.06em] tabular-nums"
            >
              {text(config, 'statValue', d.stat.value)}
            </span>
            <h3 data-editable="statTitle" className="mt-2 text-[24px] font-bold">
              {text(config, 'statTitle', d.stat.title)}
            </h3>
            <p data-editable="statBody" className="mt-2 text-[15.5px] leading-[1.8] opacity-85">
              {text(config, 'statBody', d.stat.body)}
            </p>
          </article>

          <article
            className={`rounded-[34px] bg-(--theme-primary) p-8 text-(--theme-on-primary) lg:col-span-2 ${styles.outline}`}
          >
            <h3 data-editable="noteTitle" className="text-[24px] font-bold">
              {text(config, 'noteTitle', d.note.title)}
            </h3>
            <p data-editable="noteBody" className="mt-3 text-[15.5px] leading-[1.8] opacity-90">
              {text(config, 'noteBody', d.note.body)}
            </p>
          </article>

          <article
            className={`grid items-center gap-7 rounded-[34px] bg-(--theme-surface) p-8 md:grid-cols-[1fr_auto] lg:col-span-4 ${styles.outline}`}
          >
            <div>
              <h3 data-editable="wideTitle" className="text-[24px] font-bold">
                {text(config, 'wideTitle', d.wide.title)}
              </h3>
              <p
                data-editable="wideBody"
                className="mt-3 text-[15.5px] leading-[1.8] text-(--theme-muted)"
              >
                {text(config, 'wideBody', d.wide.body)}
              </p>
            </div>
            <div className="grid gap-2.5" aria-hidden="true">
              {ABACUS_RODS.map((rod, rodIndex) => (
                <div key={rodIndex} className="flex items-center gap-2">
                  {rod.map((on, beadIndex) => (
                    <span
                      key={beadIndex}
                      className={`${styles.bead} ${on ? '' : styles.beadOff}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </article>
        </div>
      </Container>
    </section>
  );
}
