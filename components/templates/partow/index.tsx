import type { TemplateSectionMap } from '../registry-types';
import { TemplateTopBar, headerDefaults, FULL_NAV } from '../_shared/header';
import { TemplateMarquee } from '../_shared/marquee';
import { TemplateSiteFooter } from '../_shared/footer';
import { PARTOW_DEFAULTS } from './defaults';
import { PartowHero } from './hero';
import { PartowFeatures } from './features';
import { PartowCourses } from './courses';
import { PartowTestimonials } from './testimonials';
import { PartowShowcase } from './showcase';
import { PartowTeachers } from './teachers';
import { PartowCta } from './cta';

export { PARTOW_COURSE_CARD } from './course-card-spec';

/**
 * Partow — "beam": the centred, card-led sibling of Rouzan.
 *
 * Same buyer as Rouzan (one programming teacher selling their own courses), a
 * different argument: Rouzan looks into the teacher's editor window, Partow
 * puts the claim in the middle of the page and answers objections in order —
 * proof, courses, quotes, reasons, the teacher, then the FAQ. It ships no
 * `categories` section, so the preset omits that slot rather than falling back
 * to an off-brand shared block.
 */
const PARTOW_HEADER = headerDefaults({
  tagline: 'دوره‌های برنامه‌نویسی فول‌استک',
  ctaText: 'شروع یادگیری',
  nav: FULL_NAV,
});

export const PARTOW_SECTIONS: TemplateSectionMap = {
  header: ({ id, config, storeContext }) => (
    <TemplateTopBar
      id={id}
      config={config}
      editMode={storeContext?.editMode}
      defaults={PARTOW_HEADER}
      spec={{ tone: 'page', height: 72, navStyle: 'pill', translucent: true }}
    />
  ),
  hero: PartowHero,
  marquee: ({ id, config }) => (
    <TemplateMarquee
      id={id}
      config={config}
      fallbackItems={PARTOW_DEFAULTS.marquee.items}
      tone="deep"
      separator="dot"
    />
  ),
  features: PartowFeatures,
  // Async server component: wrapped so the map keeps its sync element type.
  courses: ({ id, config, storeContext }) => (
    <PartowCourses id={id} config={config} storeContext={storeContext} />
  ),
  testimonials: PartowTestimonials,
  showcase: PartowShowcase,
  teachers: PartowTeachers,
  cta: PartowCta,
  footer: ({ id, config, storeContext }) => (
    <TemplateSiteFooter
      id={id}
      config={config}
      storeContext={storeContext}
      defaults={PARTOW_DEFAULTS.footer}
    />
  ),
};
