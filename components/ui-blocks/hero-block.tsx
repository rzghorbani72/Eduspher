import { HeroSlideshow, type SlideConfig } from './hero-slideshow';
import { CodeHero } from './hero-block/code-hero';
import { CommunityHero } from './hero-block/community-hero';
import { CreativeHero } from './hero-block/creative-hero';
import { CreatorHero } from './hero-block/creator-hero';
import { DarkProgrammerHero } from './hero-block/dark-programmer-hero';
import { DefaultHero } from './hero-block/default-hero';
import { ExpertAcademyHero } from './hero-block/expert-academy-hero';
import { FlowHero } from './hero-block/flow-hero';
import { HeroBlockProps, speedToMs } from './hero-block/shared';
import { SocialHero } from './hero-block/social-hero';
import { StudioHero } from './hero-block/studio-hero';

// In "dynamic data" mode, fill the hero's learner-count field from real academy
// stats. Falls back to the static config when live data is off or unavailable
// (e.g. a brand-new academy with zero students), so the hero never reads "0".
function applyDynamicData(
  config: HeroBlockProps['config'],
  stats: { courseCount: number; studentCount: number } | null | undefined,
): HeroBlockProps['config'] {
  if (!config?.useLiveData || !stats) return config;
  const next = { ...config };
  if (stats.studentCount > 0) {
    next.trustCount = `${stats.studentCount.toLocaleString('fa-IR')}+`;
  }
  return next;
}

export function HeroBlock({ id, config: rawConfig, storeContext, blockType }: HeroBlockProps) {
  const config = applyDynamicData(rawConfig, storeContext?.stats);
  // Slideshow block type: always render as full-width image carousel
  if (blockType === 'slideshow') {
    const slides = (config?.slides as SlideConfig[] | undefined) ?? [];
    const height = (config?.height ?? 'large') as 'small' | 'medium' | 'large';
    const alignment = (config?.alignment ?? 'center') as 'left' | 'center' | 'right';
    return (
      <section id={id || 'hero'}>
        <HeroSlideshow
          slides={slides.length > 0 ? slides : [{}]}
          alignment={alignment}
          height={height}
          storeContext={storeContext}
          dark
          interval={speedToMs(config?.speed)}
        />
      </section>
    );
  }

  const style = config?.style ?? 'default';
  if (style === 'expert' || style === 'expert-academy')
    return <ExpertAcademyHero id={id} config={config} storeContext={storeContext} />;
  if (style === 'creator-store' || style === 'creator')
    return <CreatorHero id={id} config={config} storeContext={storeContext} />;
  if (style === 'social') return <SocialHero id={id} config={config} storeContext={storeContext} />;
  if (style === 'community')
    return <CommunityHero id={id} config={config} storeContext={storeContext} />;
  if (style === 'studio') return <StudioHero id={id} config={config} storeContext={storeContext} />;
  if (style === 'dark-programmer')
    return <DarkProgrammerHero id={id} config={config} storeContext={storeContext} />;
  if (style === 'flow') return <FlowHero id={id} config={config} storeContext={storeContext} />;
  if (style === 'code') return <CodeHero id={id} config={config} storeContext={storeContext} />;
  if (style === 'creative')
    return <CreativeHero id={id} config={config} storeContext={storeContext} />;
  return <DefaultHero id={id} config={config} storeContext={storeContext} />;
}
