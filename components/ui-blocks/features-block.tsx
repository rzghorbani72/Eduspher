import { cn } from '@/lib/utils';
import { getCurrentAcademy } from '@/lib/api/server';
import { getAcademyLanguage } from '@/lib/i18n/server';
import { t } from '@/lib/i18n/server-translations';
import { SlotGrid, PlaceholderCard } from './slot-grid';
import { RichHtml } from '@/components/rich-html';
import { resolveSlots } from '@/lib/slot-config';
import { BenefitsFeatures } from './features-block/benefits-features';
import { CreativePillarsFeatures } from './features-block/creative-pillars-features';
import { CreativeTeachersFeatures } from './features-block/creative-teachers-features';
import { CreatorFeatures } from './features-block/creator-features';
import { DarkFeatures } from './features-block/dark-features';
import { FlowCardsFeatures } from './features-block/flow-cards-features';
import { FlowStatsFeatures } from './features-block/flow-stats-features';
import { InstructorsFeatures } from './features-block/instructors-features';
import { FeaturesBlockProps } from './features-block/shared';
import { StatsFeatures } from './features-block/stats-features';
import { StudioFeatures } from './features-block/studio-features';

export async function FeaturesBlock({ id, config }: FeaturesBlockProps) {
  const blockStyle = config?.style ?? 'default';

  if (blockStyle === 'flow-cards') return <FlowCardsFeatures id={id} config={config} />;
  if (blockStyle === 'flow-stats') return <FlowStatsFeatures id={id} config={config} />;
  if (blockStyle === 'creative-pillars') return <CreativePillarsFeatures id={id} config={config} />;
  if (blockStyle === 'creative-teachers')
    return <CreativeTeachersFeatures id={id} config={config} />;
  if (blockStyle === 'stats') return <StatsFeatures id={id} config={config} />;
  if (blockStyle === 'dark') return <DarkFeatures id={id} config={config} />;
  if (blockStyle === 'instructors') return <InstructorsFeatures id={id} config={config} />;
  if (blockStyle === 'benefits') return <BenefitsFeatures id={id} config={config} />;
  if (blockStyle === 'studio') return <StudioFeatures id={id} config={config} />;
  if (blockStyle === 'creator') return <CreatorFeatures id={id} config={config} />;

  const currentAcademy = await getCurrentAcademy().catch(() => null);
  const language = getAcademyLanguage(
    currentAcademy?.language || null,
    currentAcademy?.country_code || null,
  );
  const tr = (key: string) => t(key, language);

  const localizedFeatures = [
    {
      title: tr('blocks.expertInstructors'),
      description: tr('blocks.expertInstructorsDesc'),
      icon: '🎓',
    },
    {
      title: tr('blocks.flexibleLearning'),
      description: tr('blocks.flexibleLearningDesc'),
      icon: '📚',
    },
    {
      title: tr('blocks.certificates'),
      description: tr('blocks.certificatesDesc'),
      icon: '🏆',
    },
    {
      title: tr('blocks.interactiveContent'),
      description: tr('blocks.interactiveContentDesc'),
      icon: '💡',
    },
    {
      title: tr('blocks.careerSupport'),
      description: tr('blocks.careerSupportDesc'),
      icon: '🚀',
    },
    {
      title: tr('blocks.communityAccess'),
      description: tr('blocks.communityAccessDesc'),
      icon: '⭐',
    },
  ];

  const title = config?.title || 'Why Choose Us';
  const subtitle = config?.subtitle || 'Discover what makes us special';
  const gridColumns = config?.gridColumns || 3;
  const variant = config?.variant || 'cards';
  const showIcons = config?.showIcons !== false;
  const items = localizedFeatures.slice(0, gridColumns * 2);

  const renderTitle = (centered = false) => (
    <div className={cn('mb-12 max-w-2xl', centered && 'mx-auto text-center')}>
      {title ? (
        <>
          <p
            data-scroll-animate="fadeIn"
            data-scroll-delay="0"
            data-editable="title"
            className="mb-2 text-xs font-bold tracking-[0.18em] text-(--theme-primary) uppercase"
          >
            {title}
          </p>
          <RichHtml
            as="h2"
            html={subtitle || title}
            data-scroll-animate="fadeIn"
            data-scroll-delay="0.08"
            data-editable="subtitle"
            data-editable-kind="rich"
            className="text-3xl font-black tracking-tight text-(--theme-foreground) sm:text-4xl"
            style={{ letterSpacing: '-0.025em' }}
          />
        </>
      ) : subtitle ? (
        <RichHtml
          as="h2"
          html={subtitle}
          data-scroll-animate="fadeIn"
          data-scroll-delay="0.05"
          data-editable="subtitle"
          data-editable-kind="rich"
          className="text-3xl font-black tracking-tight text-(--theme-foreground) sm:text-4xl"
          style={{ letterSpacing: '-0.025em' }}
        />
      ) : null}
    </div>
  );

  const IconBubble = ({ icon }: { icon: string }) => (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-(--theme-primary-subtle) text-2xl transition-transform group-hover:scale-110">
      {icon}
    </div>
  );

  if (variant === 'icons') {
    return (
      <section
        id={id || 'features'}
        className="bg-(--theme-surface-alt) py-16 text-(--theme-foreground) sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {renderTitle(true)}
          <SlotGrid config={config} minBasisFallback="220px">
            {resolveSlots(items, config?.slots, items.length).map((slot, i) =>
              slot.kind === 'live' ? (
                <div
                  key={i}
                  data-scroll-animate="fadeInUp"
                  data-scroll-delay={`${0.05 * i}`}
                  className="group flex flex-col items-center text-center"
                >
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-(--theme-primary-subtle) text-4xl transition-all group-hover:scale-110">
                    {slot.data.icon}
                  </div>
                  <h3 className="text-lg font-semibold">{slot.data.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-(--theme-foreground)/60">
                    {slot.data.description}
                  </p>
                </div>
              ) : (
                <PlaceholderCard key={i} text={slot.text} />
              ),
            )}
          </SlotGrid>
        </div>
      </section>
    );
  }

  if (variant === 'list') {
    return (
      <section
        id={id || 'features'}
        className="bg-(--theme-surface-alt) py-16 text-(--theme-foreground) sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {renderTitle(false)}
          <SlotGrid config={config} minBasisFallback="280px">
            {resolveSlots(items, config?.slots, items.length).map((slot, i) =>
              slot.kind === 'live' ? (
                <div
                  key={i}
                  data-scroll-animate="slideLeft"
                  data-scroll-delay={`${0.08 * i}`}
                  className="group flex h-full items-start gap-4 rounded-xl border border-(--theme-border-color) bg-(--theme-card-bg) p-6 text-(--theme-foreground) transition-all hover:shadow-md"
                >
                  {showIcons && <IconBubble icon={slot.data.icon} />}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{slot.data.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-(--theme-foreground)/60">
                      {slot.data.description}
                    </p>
                  </div>
                </div>
              ) : (
                <PlaceholderCard key={i} text={slot.text} />
              ),
            )}
          </SlotGrid>
        </div>
      </section>
    );
  }

  // cards variant (default)
  return (
    <section
      id={id || 'features'}
      className="bg-(--theme-surface-alt) py-16 text-(--theme-foreground) sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {renderTitle(true)}
        <SlotGrid config={config} minBasisFallback="280px">
          {resolveSlots(items, config?.slots, items.length).map((slot, i) =>
            slot.kind === 'live' ? (
              <div
                key={i}
                data-scroll-animate="fadeInUp"
                data-scroll-delay={`${0.08 * i}`}
                className="group relative flex h-full flex-col gap-y-3 rounded-xl border border-(--theme-border-color) bg-(--theme-card-bg) p-6 text-(--theme-foreground) shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="pointer-events-none absolute inset-0 rounded-xl bg-linear-to-br from-(--theme-primary)/5 via-transparent to-(--theme-accent)/5 opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative">
                  {showIcons && (
                    <div className="mb-3">
                      <IconBubble icon={slot.data.icon} />
                    </div>
                  )}
                  <h3 className="text-lg leading-7 font-semibold">{slot.data.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-(--theme-foreground)/60">
                    {slot.data.description}
                  </p>
                </div>
              </div>
            ) : (
              <PlaceholderCard key={i} text={slot.text} />
            ),
          )}
        </SlotGrid>
      </div>
    </section>
  );
}
