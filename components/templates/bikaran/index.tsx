import type { TemplateSectionMap } from '../registry-types';
import { TemplateTopBar, headerDefaults, COMPACT_NAV } from '../_shared/header';
import { TemplateMarquee } from '../_shared/marquee';
import { TemplateSiteFooter } from '../_shared/footer';
import { TemplatePricing } from '../_shared/pricing';
import { TemplateTeachers } from '../_shared/teachers';
import { TemplateCta } from '../_shared/cta';
import { TemplateCourses } from '../_shared/courses';
import { TemplateDataTable } from '../_shared/data-table';
import { BIKARAN_DEFAULTS } from './defaults';
import { BikaranHero } from './hero';
import { BikaranFeatures } from './features';
import styles from './bikaran.module.css';

const BIKARAN_THUMBS = [styles.t1, styles.t2, styles.t3, styles.t4];

/** Bikaran — printed star atlas: warm paper, ink chart, margin numerals. */
const BIKARAN_HEADER = headerDefaults({
  tagline: 'آموزشکدهٔ نجوم',
  ctaText: 'ثبت‌نام در دوره',
  nav: COMPACT_NAV,
});

export const BIKARAN_SECTIONS: TemplateSectionMap = {
  header: ({ id, config, storeContext }) => (
    <TemplateTopBar id={id} config={config} editMode={storeContext?.editMode} defaults={BIKARAN_HEADER} spec={{ tone: 'page', height: 74, navStyle: 'underline', markClassName: styles.logoMark }} />
  ),
  hero: BikaranHero,
  marquee: ({ id, config }) => (
    <TemplateMarquee id={id} config={config} fallbackItems={BIKARAN_DEFAULTS.marquee.items} tone="deep" />
  ),
  features: BikaranFeatures,
  courses: ({ id, config, storeContext }) => (
    <TemplateCourses
      id={id}
      config={config}
      storeContext={storeContext}
      defaults={BIKARAN_DEFAULTS.courses}
      thumbTones={BIKARAN_THUMBS}
      thumbClassName={styles.thumb}
      tone="page"
    />
  ),
  showcase: ({ id, config }) => (
    <TemplateDataTable id={id} config={config} defaults={BIKARAN_DEFAULTS.calendar} tone="surface" />
  ),
  teachers: ({ id, config }) => (
    <TemplateTeachers id={id} config={config} defaults={BIKARAN_DEFAULTS.teachers} tone="page" />
  ),
  pricing: ({ id, config }) => (
    <TemplatePricing id={id} config={config} defaults={BIKARAN_DEFAULTS.pricing} tone="surface" />
  ),
  cta: ({ id, config }) => <TemplateCta id={id} config={config} defaults={BIKARAN_DEFAULTS.cta} tone="deep" />,
  footer: ({ id, config }) => <TemplateSiteFooter id={id} config={config} defaults={BIKARAN_DEFAULTS.footer} />,
};
