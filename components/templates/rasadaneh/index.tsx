import type { TemplateSectionMap } from '../registry-types';
import { TemplateTopBar, headerDefaults, COMPACT_NAV } from '../_shared/header';
import { TemplateMarquee } from '../_shared/marquee';
import { TemplateSiteFooter } from '../_shared/footer';
import { TemplatePricing } from '../_shared/pricing';
import { TemplateTeachers } from '../_shared/teachers';
import { TemplateCta } from '../_shared/cta';
import { TemplateCourses } from '../_shared/courses';
import { TemplateDataTable } from '../_shared/data-table';
import { RASADANEH_DEFAULTS } from './defaults';
import { RasadanehHero } from './hero';
import { RasadanehFeatures } from './features';
import styles from './rasadaneh.module.css';

const RASADANEH_THUMBS = [styles.t1, styles.t2, styles.t3, styles.t4];

/** Rasadaneh — printed star atlas: warm paper, ink chart, margin numerals. */
const RASADANEH_HEADER = headerDefaults({
  tagline: 'آموزشکدهٔ نجوم',
  ctaText: 'ثبت‌نام در دوره',
  nav: COMPACT_NAV,
});

export const RASADANEH_SECTIONS: TemplateSectionMap = {
  header: ({ id, config }) => (
    <TemplateTopBar id={id} config={config} defaults={RASADANEH_HEADER} spec={{ tone: 'page', height: 74, navStyle: 'underline', markClassName: styles.logoMark }} />
  ),
  hero: RasadanehHero,
  marquee: ({ id, config }) => (
    <TemplateMarquee id={id} config={config} fallbackItems={RASADANEH_DEFAULTS.marquee.items} tone="deep" />
  ),
  features: RasadanehFeatures,
  courses: ({ id, config, storeContext }) => (
    <TemplateCourses
      id={id}
      config={config}
      storeContext={storeContext}
      defaults={RASADANEH_DEFAULTS.courses}
      thumbTones={RASADANEH_THUMBS}
      thumbClassName={styles.thumb}
      tone="page"
    />
  ),
  showcase: ({ id, config }) => (
    <TemplateDataTable id={id} config={config} defaults={RASADANEH_DEFAULTS.calendar} tone="surface" />
  ),
  teachers: ({ id, config }) => (
    <TemplateTeachers id={id} config={config} defaults={RASADANEH_DEFAULTS.teachers} tone="page" />
  ),
  pricing: ({ id, config }) => (
    <TemplatePricing id={id} config={config} defaults={RASADANEH_DEFAULTS.pricing} tone="surface" />
  ),
  cta: ({ id, config }) => <TemplateCta id={id} config={config} defaults={RASADANEH_DEFAULTS.cta} tone="deep" />,
  footer: ({ id, config }) => <TemplateSiteFooter id={id} config={config} defaults={RASADANEH_DEFAULTS.footer} />,
};
