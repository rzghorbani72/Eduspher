import { Button } from '../_shared/primitives';
import { RemovableSlot } from '../_shared/removable-slot';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { templateHref } from '../_shared/routes';
import { editableList, editableItem } from '../_shared/editable-list';
import { ROUZAN_DEFAULTS } from './defaults';
import { Wrap } from './layout';
import styles from './rouzan.module.css';

interface CtaFact {
  value: string;
  label: string;
}

/**
 * Closing band: the offer on the left, the three facts a hesitant buyer is
 * actually weighing on the right, divided by a rule.
 *
 * The mockup closes with a newsletter email field. There is no subscription
 * endpoint behind it, and a dead input is worse than none, so the same slot
 * carries the register CTA instead — the one next step the site can honour.
 */
export function RouzanCta({ id, config, storeContext }: TemplateSectionProps) {
  const d = ROUZAN_DEFAULTS.cta;
  const editMode = storeContext?.editMode ?? false;
  const facts = list<CtaFact>(config, 'facts', d.facts);

  return (
    <section
      id={id || 'cta'}
      className="border-t border-(--theme-border-color) bg-(--theme-surface-alt) text-(--theme-foreground)"
    >
      <div className="py-22">
        <Wrap>
          <div className="grid items-center gap-12 lg:grid-cols-[1.25fr_.75fr]">
            <div>
              <h2
                data-editable="title"
                className="max-w-[19ch] text-[clamp(28px,3.4vw,44px)] font-bold leading-[1.14]"
              >
                {text(config, 'title', d.title)}
              </h2>
              <p
                data-editable="subtitle"
                className="mt-4 max-w-[46ch] text-[16.5px] leading-[1.85] text-(--theme-muted)"
              >
                {text(config, 'subtitle', d.subtitle)}
              </p>

              <RemovableSlot config={config} flagKey="showCta" editMode={editMode} className="mt-6 inline-flex">
                <Button
                  tone="primary"
                  size="lg"
                  editableKey="ctaText"
                  href={templateHref(storeContext, 'register')}
                  className="!rounded-[10px]"
                >
                  {text(config, 'ctaText', d.ctaText)}
                </Button>
              </RemovableSlot>

              <p data-editable="note" className="mt-3 text-[12.5px] text-(--theme-muted)">
                {text(config, 'note', d.note)}
              </p>
            </div>

            <dl className={styles.ctaSide} {...editableList('facts', facts)}>
              {facts.map((fact, index) => (
                <div key={fact.label} className={`${styles.ctaRow} py-3.5`}>
                  <dd {...editableItem('facts', index, 'value')} className="block text-[19px] font-bold">
                    {fact.value}
                  </dd>
                  <dt {...editableItem('facts', index, 'label')} className="text-[13px] text-(--theme-muted)">
                    {fact.label}
                  </dt>
                </div>
              ))}
            </dl>
          </div>
        </Wrap>
      </div>
    </section>
  );
}
