import { Container, Eyebrow } from './section';
import { Button } from './primitives';
import { list, text, type SectionConfig } from './types';

export interface PlanFeature {
  label: string;
  included: boolean;
}

export interface TemplatePlan {
  name: string;
  description: string;
  price: string;
  period: string;
  featured: boolean;
  ctaText: string;
  features: readonly PlanFeature[];
}

export interface PricingDefaults {
  eyebrow: string;
  title: string;
  subtitle: string;
  note: string;
  plans: readonly TemplatePlan[];
}

interface TemplatePricingProps {
  id?: string;
  config?: SectionConfig;
  defaults: PricingDefaults;
  /** `deep` inverts the band; `page`/`surface` keep it on the light ground. */
  tone?: 'page' | 'surface' | 'deep';
  /** Raise the featured plan out of the row (all seven designs do this). */
  liftFeatured?: boolean;
}

const TONE_CLASS = {
  page: 'bg-(--theme-background) text-(--theme-foreground)',
  surface: 'bg-(--theme-surface-alt) text-(--theme-foreground)',
  deep: 'bg-(--theme-deep) text-(--theme-on-deep)',
} as const;

/**
 * Three-plan pricing row. Every design lands on the same structure — three
 * cards, the middle one elevated and carrying the primary CTA — so this is one
 * component with a tone rather than seven copies.
 */
export function TemplatePricing({
  id,
  config,
  defaults,
  tone = 'surface',
  liftFeatured = true,
}: TemplatePricingProps) {
  const plans = list<TemplatePlan>(config, 'plans', defaults.plans);
  const onDeep = tone === 'deep';

  return (
    <section id={id || 'pricing'} className={TONE_CLASS[tone]}>
      <Container className="py-(--theme-section-padding-y)">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-8">
          <div>
            <Eyebrow className={`mb-3 ${onDeep ? 'text-(--theme-accent)' : ''}`}>
              {text(config, 'eyebrow', defaults.eyebrow)}
            </Eyebrow>
            <h2
              data-editable="title"
              className="max-w-[22ch] text-[clamp(28px,4vw,44px)] font-bold leading-[1.2] tracking-[-0.02em]"
            >
              {text(config, 'title', defaults.title)}
            </h2>
          </div>
          <p
            data-editable="subtitle"
            className={`max-w-[46ch] text-[16px] leading-[1.85] ${onDeep ? 'text-current/65' : 'text-(--theme-muted)'}`}
          >
            {text(config, 'subtitle', defaults.subtitle)}
          </p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={[
                'rounded-(--theme-border-radius) border p-7',
                plan.featured
                  ? onDeep
                    ? 'border-(--theme-primary) bg-current/10'
                    : 'border-(--theme-primary) bg-(--theme-surface) shadow-(--theme-shadow)'
                  : onDeep
                    ? 'border-current/18 bg-current/5'
                    : 'border-(--theme-border-color) bg-(--theme-surface)',
                plan.featured && liftFeatured ? 'lg:-translate-y-3' : '',
              ].join(' ')}
            >
              {plan.featured ? (
                <span className="mb-4 inline-block rounded-full bg-(--theme-accent) px-3 py-1 text-[12px] font-bold text-(--theme-on-accent)">
                  پیشنهاد ما
                </span>
              ) : null}

              <h3 className="text-[20px] font-bold">{plan.name}</h3>
              <p className={`mt-2 min-h-[44px] text-[14px] ${onDeep ? 'text-current/62' : 'text-(--theme-muted)'}`}>
                {plan.description}
              </p>
              <p className="mt-4 text-[32px] font-bold leading-none tracking-[-0.03em] tabular-nums">
                {plan.price}
                <small className={`ms-2 text-[13px] font-medium ${onDeep ? 'text-current/60' : 'text-(--theme-muted)'}`}>
                  {plan.period}
                </small>
              </p>

              <ul className="my-7 grid gap-3 text-[14.5px]">
                {plan.features.map((feature) => (
                  <li
                    key={feature.label}
                    className={`flex items-start gap-2.5 ${feature.included ? '' : 'opacity-45 line-through'}`}
                  >
                    <span aria-hidden="true" className="mt-2 size-1.5 flex-none rounded-full bg-(--theme-primary)" />
                    {feature.label}
                  </li>
                ))}
              </ul>

              <Button
                tone={plan.featured ? 'primary' : onDeep ? 'ghost-on-deep' : 'outline'}
                className="w-full"
              >
                {plan.ctaText}
              </Button>
            </article>
          ))}
        </div>

        <p className={`mt-6 text-[13.5px] ${onDeep ? 'text-current/55' : 'text-(--theme-muted)'}`}>
          {text(config, 'note', defaults.note)}
        </p>
      </Container>
    </section>
  );
}
