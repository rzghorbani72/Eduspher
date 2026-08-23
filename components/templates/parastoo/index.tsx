import type { TemplateSectionMap } from '../registry-types';
import { TemplateTopBar, headerDefaults, FULL_NAV } from '../_shared/header';
import { TemplateMarquee } from '../_shared/marquee';
import { TemplateSiteFooter } from '../_shared/footer';
import { TemplatePricing } from '../_shared/pricing';
import { TemplateTeachers } from '../_shared/teachers';
import { TemplateCta } from '../_shared/cta';
import { TemplateCourses } from '../_shared/courses';
import type { CourseCardSpec } from '../_shared/course-card';
import { PARASTOO_DEFAULTS } from './defaults';
import { ParastooHero } from './hero';
import { ParastooFeatures } from './features';
import { ParastooCategories } from './categories';
import { ParastooLevels } from './levels';
import styles from './parastoo.module.css';

const PARASTOO_THUMBS = [styles.t1, styles.t2, styles.t3, styles.t4];

/** Parastoo — playful but measured: outlined squircles, tilted flashcards. */
const PARASTOO_HEADER = headerDefaults({
  tagline: 'چرتکه · محاسبات ذهنی',
  ctaText: 'جلسهٔ آزمایشی رایگان',
  nav: FULL_NAV,
});

export const PARASTOO_COURSE_CARD: CourseCardSpec = {
  thumbTones: PARASTOO_THUMBS,
  thumbClassName: styles.thumb,
};

export const PARASTOO_SECTIONS: TemplateSectionMap = {
  header: ({ id, config, storeContext }) => (
    <TemplateTopBar id={id} config={config} editMode={storeContext?.editMode} defaults={PARASTOO_HEADER} spec={{ tone: 'page', height: 84, navStyle: 'pill', markClassName: styles.logoMark, thickBorder: true }} />
  ),
  hero: ParastooHero,
  marquee: ({ id, config }) => (
    <TemplateMarquee
      id={id}
      config={config}
      fallbackItems={PARASTOO_DEFAULTS.marquee.items}
      tone="deep"
      separator="square"
    />
  ),
  features: ParastooFeatures,
  courses: ({ id, config, storeContext }) => (
    <TemplateCourses
      id={id}
      config={config}
      storeContext={storeContext}
      defaults={PARASTOO_DEFAULTS.courses}
      card={PARASTOO_COURSE_CARD}
      tone="page"
      bordered={false}
    />
  ),
  categories: ParastooCategories,
  showcase: ParastooLevels,
  teachers: ({ id, config }) => (
    <TemplateTeachers id={id} config={config} defaults={PARASTOO_DEFAULTS.teachers} tone="page" />
  ),
  pricing: ({ id, config }) => (
    <TemplatePricing id={id} config={config} defaults={PARASTOO_DEFAULTS.pricing} tone="surface" />
  ),
  cta: ({ id, config }) => (
    <TemplateCta id={id} config={config} defaults={PARASTOO_DEFAULTS.cta} tone="accent" boxed />
  ),
  footer: ({ id, config }) => <TemplateSiteFooter id={id} config={config} defaults={PARASTOO_DEFAULTS.footer} />,
};
