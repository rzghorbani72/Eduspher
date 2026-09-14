import { Container } from './section';
import { Button } from './primitives';
import { text, type SectionConfig, type TemplateStoreContext } from './types';
import { templateHref } from './routes';

export interface CtaDefaults {
  label: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaSecondary: string;
}

interface TemplateCtaProps {
  id?: string;
  config?: SectionConfig;
  storeContext?: TemplateStoreContext;
  defaults: CtaDefaults;
  tone?: 'deep' | 'brand' | 'accent';
  /** Boxed designs inset the band into a rounded card instead of bleeding it. */
  boxed?: boolean;
}

const TONE_CLASS = {
  deep: 'bg-(--theme-deep) text-(--theme-on-deep)',
  brand: 'bg-(--theme-primary) text-(--theme-on-primary)',
  accent: 'bg-(--theme-accent) text-(--theme-on-accent)',
} as const;

/**
 * Closing band. One decision, one primary action, one fallback — never a wall
 * of competing offers.
 */
export function TemplateCta({
  id,
  config,
  storeContext,
  defaults,
  tone = 'deep',
  boxed = false,
}: TemplateCtaProps) {
  const body = (
    <div className="grid items-center gap-10 lg:grid-cols-[1.4fr_auto]">
      <div>
        <span
          className="text-[13px] font-bold tracking-[0.14em] text-current/70"
          data-editable="label"
        >
          {text(config, 'label', defaults.label)}
        </span>
        <h2
          data-editable="title"
          className="mt-4 max-w-[20ch] text-[clamp(28px,4vw,42px)] leading-[1.2] font-bold tracking-[-0.02em]"
        >
          {text(config, 'title', defaults.title)}
        </h2>
        <p
          data-editable="subtitle"
          className="mt-4 max-w-[56ch] text-[16px] leading-[1.9] text-current/75"
        >
          {text(config, 'subtitle', defaults.subtitle)}
        </p>
      </div>

      <div className="flex flex-wrap gap-3.5">
        <Button
          tone={tone === 'brand' ? 'deep' : 'primary'}
          size="lg"
          editableKey="ctaText"
          href={templateHref(storeContext, 'register')}
        >
          {text(config, 'ctaText', defaults.ctaText)}
        </Button>
        <Button
          tone="ghost-on-deep"
          size="lg"
          editableKey="ctaSecondary"
          href={templateHref(storeContext, 'courses')}
        >
          {text(config, 'ctaSecondary', defaults.ctaSecondary)}
        </Button>
      </div>
    </div>
  );

  if (boxed) {
    return (
      <section id={id || 'cta'} className="bg-(--theme-background)">
        <Container className="py-(--theme-section-padding-y)">
          <div className={`rounded-[32px] p-10 md:p-14 ${TONE_CLASS[tone]}`}>{body}</div>
        </Container>
      </section>
    );
  }

  return (
    <section id={id || 'cta'} className={TONE_CLASS[tone]}>
      <Container className="py-(--theme-section-padding-y)">{body}</Container>
    </section>
  );
}
