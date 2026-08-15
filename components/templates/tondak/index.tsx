import type { TemplateSectionMap } from '../registry-types';
import { TemplateTopBar, headerDefaults, FULL_NAV } from '../_shared/header';
import { TemplateMarquee } from '../_shared/marquee';
import { TemplateSiteFooter } from '../_shared/footer';
import { TemplatePricing } from '../_shared/pricing';
import { TemplateTeachers } from '../_shared/teachers';
import { TemplateCta } from '../_shared/cta';
import { TemplateCourses } from '../_shared/courses';
import { TONDAK_DEFAULTS } from './defaults';
import { TondakHero } from './hero';
import { TondakFeatures } from './features';
import { TondakCategories } from './categories';
import { TondakLevels } from './levels';
import styles from './tondak.module.css';

const TONDAK_THUMBS = [styles.t1, styles.t2, styles.t3, styles.t4];

/** Tondak — playful but measured: outlined squircles, tilted flashcards. */
const TONDAK_HEADER = headerDefaults({
  tagline: 'چرتکه · محاسبات ذهنی',
  ctaText: 'جلسهٔ آزمایشی رایگان',
  nav: FULL_NAV,
});

export const TONDAK_SECTIONS: TemplateSectionMap = {
  header: ({ id, config }) => (
    <TemplateTopBar id={id} config={config} defaults={TONDAK_HEADER} spec={{ tone: 'page', height: 84, navStyle: 'pill', markClassName: styles.logoMark, thickBorder: true }} />
  ),
  hero: TondakHero,
  marquee: ({ id, config }) => (
    <TemplateMarquee
      id={id}
      config={config}
      fallbackItems={TONDAK_DEFAULTS.marquee.items}
      tone="deep"
      separator="square"
    />
  ),
  features: TondakFeatures,
  courses: ({ id, config, storeContext }) => (
    <TemplateCourses
      id={id}
      config={config}
      storeContext={storeContext}
      defaults={TONDAK_DEFAULTS.courses}
      thumbTones={TONDAK_THUMBS}
      thumbClassName={styles.thumb}
      tone="page"
      bordered={false}
    />
  ),
  categories: TondakCategories,
  showcase: TondakLevels,
  teachers: ({ id, config }) => (
    <TemplateTeachers id={id} config={config} defaults={TONDAK_DEFAULTS.teachers} tone="page" />
  ),
  pricing: ({ id, config }) => (
    <TemplatePricing id={id} config={config} defaults={TONDAK_DEFAULTS.pricing} tone="surface" />
  ),
  cta: ({ id, config }) => (
    <TemplateCta id={id} config={config} defaults={TONDAK_DEFAULTS.cta} tone="accent" boxed />
  ),
  footer: ({ id, config }) => <TemplateSiteFooter id={id} config={config} defaults={TONDAK_DEFAULTS.footer} />,
};
