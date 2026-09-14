import { Button } from '../_shared/primitives';
import { RemovableSlot } from '../_shared/removable-slot';
import { text, type TemplateSectionProps } from '../_shared/types';
import { templateHref } from '../_shared/routes';
import { PARTOW_DEFAULTS } from './defaults';
import { Wrap } from './layout';

/**
 * Closing band: one line, one button.
 *
 * The mockup closes with a newsletter email field. There is no subscription
 * endpoint behind it, and a dead input is worse than none, so the same slot
 * carries the register CTA instead — the one next step the site can honour.
 */
export function PartowCta({ id, config, storeContext }: TemplateSectionProps) {
  const d = PARTOW_DEFAULTS.cta;
  const editMode = storeContext?.editMode ?? false;

  return (
    <section
      id={id || 'cta'}
      className="border-t border-(--theme-border-color) bg-(--theme-surface-alt) text-(--theme-foreground)"
    >
      <div className="py-(--theme-section-padding-y)">
        <Wrap className="text-center">
          <h2
            data-editable="title"
            className="mx-auto max-w-[22ch] text-[clamp(28px,4vw,52px)] leading-[1.15] font-bold"
          >
            {text(config, 'title', d.title)}
          </h2>
          <p
            data-editable="subtitle"
            className="mx-auto mt-4.5 max-w-[48ch] text-[17px] leading-[1.85] text-(--theme-muted)"
          >
            {text(config, 'subtitle', d.subtitle)}
          </p>

          <RemovableSlot
            config={config}
            flagKey="showCta"
            editMode={editMode}
            className="mt-7.5 inline-flex"
          >
            <Button
              tone="primary"
              size="lg"
              editableKey="ctaText"
              href={templateHref(storeContext, 'register')}
              className="!rounded-full"
            >
              {text(config, 'ctaText', d.ctaText)}
            </Button>
          </RemovableSlot>

          <p data-editable="note" className="mt-4 text-[12.5px] text-(--theme-muted)">
            {text(config, 'note', d.note)}
          </p>
        </Wrap>
      </div>
    </section>
  );
}
