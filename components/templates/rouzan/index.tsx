import type { TemplateSectionMap } from '../registry-types';
import { TemplateTopBar, headerDefaults, FULL_NAV } from '../_shared/header';
import { TemplateMarquee } from '../_shared/marquee';
import { TemplateSiteFooter } from '../_shared/footer';
import { ROUZAN_DEFAULTS } from './defaults';
import { RouzanHero } from './hero';
import { RouzanFeatures } from './features';
import { RouzanCourses } from './courses';
import { RouzanCategories } from './categories';
import { RouzanShowcase } from './showcase';
import { RouzanTeachers } from './teachers';
import { RouzanCta } from './cta';

export { ROUZAN_COURSE_CARD } from './course-card-spec';

/**
 * Rouzan — a fullstack programming teacher's personal site.
 *
 * A near-white page carried by large type and whitespace, with the intro reel
 * framed as a code-editor window — the one piece of chrome on the page. Its own
 * sections share one container so the content edge lines up throughout; the
 * header, marquee and footer stay shared.
 */
const ROUZAN_HEADER = headerDefaults({
  tagline: 'دوره‌های برنامه‌نویسی فول‌استک',
  ctaText: 'شروع یادگیری',
  nav: FULL_NAV,
});

export const ROUZAN_SECTIONS: TemplateSectionMap = {
  header: ({ id, config, storeContext }) => (
    <TemplateTopBar
      id={id}
      config={config}
      editMode={storeContext?.editMode}
      defaults={ROUZAN_HEADER}
      spec={{ tone: 'page', height: 68, navStyle: 'plain', translucent: true }}
    />
  ),
  hero: RouzanHero,
  marquee: ({ id, config }) => (
    <TemplateMarquee
      id={id}
      config={config}
      fallbackItems={ROUZAN_DEFAULTS.marquee.items}
      tone="deep"
      separator="diamond"
    />
  ),
  features: RouzanFeatures,
  // Async server component: wrapped so the map keeps its sync element type.
  courses: ({ id, config, storeContext }) => (
    <RouzanCourses id={id} config={config} storeContext={storeContext} />
  ),
  categories: RouzanCategories,
  showcase: RouzanShowcase,
  teachers: RouzanTeachers,
  cta: RouzanCta,
  footer: ({ id, config, storeContext }) => (
    <TemplateSiteFooter id={id} config={config} storeContext={storeContext} defaults={ROUZAN_DEFAULTS.footer} />
  ),
};
