import { cn } from '@/lib/utils';
import { getCurrentAcademy } from '@/lib/api/server';
import { getAcademyLanguage } from '@/lib/i18n/server';
import { t } from '@/lib/i18n/server-translations';
import { SlotGrid, PlaceholderCard } from './slot-grid';
import { RichHtml } from '@/components/rich-html';
import { resolveSlots } from '@/lib/slot-config';
import { CreativeTestimonials } from './testimonials-block/creative-testimonials';
import { CreatorStoriesTestimonials } from './testimonials-block/creator-stories-testimonials';
import { CreatorTestimonials } from './testimonials-block/creator-testimonials';
import { DarkQuoteTestimonials } from './testimonials-block/dark-quote-testimonials';
import { FlowTestimonials } from './testimonials-block/flow-testimonials';
import { TestimonialsBlockProps } from './testimonials-block/shared';
import { SocialProofTestimonials } from './testimonials-block/social-proof-testimonials';
import { Stars } from './testimonials-block/stars';
import { StudioTestimonials } from './testimonials-block/studio-testimonials';

export async function TestimonialsBlock({ id, config }: TestimonialsBlockProps) {
  const blockStyle = config?.style ?? 'default';

  if (blockStyle === 'flow' || blockStyle === 'code')
    return <FlowTestimonials id={id} config={config} />;
  if (blockStyle === 'creative') return <CreativeTestimonials id={id} config={config} />;
  if (blockStyle === 'dark-quote') return <DarkQuoteTestimonials id={id} config={config} />;
  if (blockStyle === 'social-proof') return <SocialProofTestimonials id={id} config={config} />;
  if (blockStyle === 'creator-stories')
    return <CreatorStoriesTestimonials id={id} config={config} />;
  if (blockStyle === 'studio') return <StudioTestimonials id={id} config={config} />;
  if (blockStyle === 'creator') return <CreatorTestimonials id={id} config={config} />;

  const currentAcademy = await getCurrentAcademy().catch(() => null);
  const language = getAcademyLanguage(
    currentAcademy?.language || null,
    currentAcademy?.country_code || null,
  );
  const tr = (key: string) => t(key, language);

  const localizedTestimonials = [
    {
      name: tr('blocks.testimonial1Name'),
      role: tr('blocks.testimonial1Role'),
      company: tr('blocks.testimonial1Company'),
      content: tr('blocks.testimonial1Content'),
      avatar: '👩‍💻',
      revenue: '$12K/mo',
      rating: 5,
    },
    {
      name: tr('blocks.testimonial2Name'),
      role: tr('blocks.testimonial2Role'),
      company: tr('blocks.testimonial2Company'),
      content: tr('blocks.testimonial2Content'),
      avatar: '👨‍💼',
      revenue: '$8K/mo',
      rating: 5,
    },
    {
      name: tr('blocks.testimonial3Name'),
      role: tr('blocks.testimonial3Role'),
      company: tr('blocks.testimonial3Company'),
      content: tr('blocks.testimonial3Content'),
      avatar: '👩‍🔬',
      revenue: '$15K/mo',
      rating: 5,
    },
    {
      name: tr('blocks.testimonial4Name'),
      role: tr('blocks.testimonial4Role'),
      company: tr('blocks.testimonial4Company'),
      content: tr('blocks.testimonial4Content'),
      avatar: '👨‍🎨',
      revenue: '$9K/mo',
      rating: 5,
    },
    {
      name: tr('blocks.testimonial5Name'),
      role: tr('blocks.testimonial5Role'),
      company: tr('blocks.testimonial5Company'),
      content: tr('blocks.testimonial5Content'),
      avatar: '👩‍💼',
      revenue: '$20K/mo',
      rating: 5,
    },
    {
      name: tr('blocks.testimonial6Name'),
      role: tr('blocks.testimonial6Role'),
      company: tr('blocks.testimonial6Company'),
      content: tr('blocks.testimonial6Content'),
      avatar: '👨‍💻',
      revenue: '$50K/mo',
      rating: 5,
    },
  ];

  const title = config?.title || 'What Students Say';
  const subtitle = config?.subtitle || 'Hear from our community';
  const layout = config?.layout || 'grid';
  const showAvatars = config?.showAvatars !== false;
  const corporate = config?.corporate === true;
  const items = corporate
    ? localizedTestimonials.slice(0, 3).map((item) => ({
        ...item,
        role: 'VP of Learning',
        company: 'Fortune 500',
      }))
    : localizedTestimonials;

  const Avatar = ({ emoji }: { emoji: string }) =>
    showAvatars ? (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-(--theme-secondary-subtle) text-2xl">
        {emoji}
      </div>
    ) : null;

  if (layout === 'carousel') {
    return (
      <section
        id={id || 'testimonials'}
        className="overflow-hidden bg-(--theme-surface-alt) py-16 text-(--theme-foreground) sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center text-(--theme-foreground)">
            <h2
              data-scroll-animate="fadeIn"
              data-scroll-delay="0.05"
              className="text-3xl font-black tracking-tight sm:text-4xl"
              style={{ letterSpacing: '-0.025em' }}
            >
              {title}
            </h2>
            {subtitle && (
              <p
                data-scroll-animate="fadeIn"
                data-scroll-delay="0.15"
                className="mt-3 text-base leading-relaxed text-(--theme-foreground)/60"
              >
                {subtitle}
              </p>
            )}
          </div>
          <div className="relative overflow-hidden">
            <div className="animate-scroll flex w-max gap-6">
              {[...items, ...items].map((t, i) => (
                <div
                  key={i}
                  className="min-w-80 shrink-0 rounded-2xl border border-(--theme-border-color) bg-(--theme-card-bg) p-6 text-(--theme-foreground) shadow-sm"
                >
                  <Stars count={t.rating} />
                  <p className="mb-4 text-sm leading-relaxed text-(--theme-foreground)/70">
                    &quot;{t.content}&quot;
                  </p>
                  <div className="flex items-center gap-3">
                    <Avatar emoji={t.avatar} />
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-(--theme-foreground)/55">
                        {t.role} at {t.company}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // grid layout
  return (
    <section
      id={id || 'testimonials'}
      className="bg-(--theme-surface-alt) py-16 text-(--theme-foreground) sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center text-(--theme-foreground)">
          <h2
            data-scroll-animate="fadeIn"
            data-scroll-delay="0.05"
            data-editable="title"
            className="text-3xl font-black tracking-tight sm:text-4xl"
            style={{ letterSpacing: '-0.025em' }}
          >
            {title}
          </h2>
          {subtitle && (
            <RichHtml
              as="p"
              html={subtitle}
              data-scroll-animate="fadeIn"
              data-scroll-delay="0.15"
              data-editable="subtitle"
              data-editable-kind="rich"
              className="mt-3 text-base leading-relaxed text-(--theme-foreground)/60"
            />
          )}
        </div>
        <div data-dynamic="true">
          <SlotGrid config={config} minBasisFallback="320px">
            {resolveSlots(items, config?.slots, 3).map((slot, i) =>
              slot.kind === 'live' ? (
                <div
                  key={i}
                  data-scroll-animate="fadeInUp"
                  data-scroll-delay={`${0.1 * i}`}
                  className={cn(
                    'group flex h-full flex-col rounded-2xl border border-(--theme-border-color) bg-(--theme-card-bg) p-6 text-(--theme-foreground) shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg',
                  )}
                >
                  <Stars count={slot.data.rating} />
                  <p className="mb-4 flex-1 text-sm leading-relaxed text-(--theme-foreground)/70">
                    &quot;{slot.data.content}&quot;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="transition-transform group-hover:scale-110">
                      <Avatar emoji={slot.data.avatar} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{slot.data.name}</p>
                      <p className="text-xs text-(--theme-foreground)/55">{slot.data.role}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <PlaceholderCard key={i} text={slot.text} />
              ),
            )}
          </SlotGrid>
        </div>
      </div>
    </section>
  );
}
