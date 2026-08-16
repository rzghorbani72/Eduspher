import type { TemplateSectionMap } from '../registry-types';
import { TemplateTopBar, headerDefaults, FULL_NAV } from '../_shared/header';
import { TemplateMarquee } from '../_shared/marquee';
import { TemplateSiteFooter } from '../_shared/footer';
import { TemplatePricing } from '../_shared/pricing';
import { TemplateTeachers } from '../_shared/teachers';
import { TemplateCta } from '../_shared/cta';
import { TemplateCourses } from '../_shared/courses';
import { TemplateDataTable } from '../_shared/data-table';
import { HAVAN_DEFAULTS } from './defaults';
import { HavanHero } from './hero';
import { HavanFeatures } from './features';
import { HavanCategories } from './categories';
import styles from './havan.module.css';

const HAVAN_THUMBS = [styles.t1, styles.t2, styles.t3, styles.t4];

/** Havan — working kitchen: warm paper, chalk service board, printed hairlines. */
const HAVAN_HEADER = headerDefaults({
  tagline: 'کارگاه آموزش آشپزی',
  ctaText: 'ثبت‌نام دوره',
  nav: FULL_NAV,
});

export const HAVAN_SECTIONS: TemplateSectionMap = {
  header: ({ id, config, storeContext }) => (
    <TemplateTopBar id={id} config={config} editMode={storeContext?.editMode} defaults={HAVAN_HEADER} spec={{ tone: 'page', height: 78, navStyle: 'border', markClassName: styles.logoMark }} />
  ),
  hero: HavanHero,
  marquee: ({ id, config }) => (
    <TemplateMarquee
      id={id}
      config={config}
      fallbackItems={HAVAN_DEFAULTS.marquee.items}
      tone="brand"
      separator="diamond"
    />
  ),
  features: HavanFeatures,
  courses: ({ id, config, storeContext }) => (
    <TemplateCourses
      id={id}
      config={config}
      storeContext={storeContext}
      defaults={HAVAN_DEFAULTS.courses}
      thumbTones={HAVAN_THUMBS}
      thumbClassName={styles.thumb}
      tone="surface"
    />
  ),
  categories: HavanCategories,
  showcase: ({ id, config }) => (
    <TemplateDataTable id={id} config={config} defaults={HAVAN_DEFAULTS.schedule} tone="page" />
  ),
  teachers: ({ id, config }) => (
    <TemplateTeachers id={id} config={config} defaults={HAVAN_DEFAULTS.teachers} tone="deep" avatarShape="round" />
  ),
  pricing: ({ id, config }) => (
    <TemplatePricing id={id} config={config} defaults={HAVAN_DEFAULTS.pricing} tone="surface" />
  ),
  cta: ({ id, config }) => <TemplateCta id={id} config={config} defaults={HAVAN_DEFAULTS.cta} tone="brand" />,
  footer: ({ id, config }) => <TemplateSiteFooter id={id} config={config} defaults={HAVAN_DEFAULTS.footer} />,
};
