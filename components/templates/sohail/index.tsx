import type { TemplateSectionMap } from '../registry-types';
import { TemplateTopBar, headerDefaults, FULL_NAV } from '../_shared/header';
import { TemplateMarquee } from '../_shared/marquee';
import { TemplateSiteFooter } from '../_shared/footer';
import { TemplatePricing } from '../_shared/pricing';
import { TemplateTeachers } from '../_shared/teachers';
import { TemplateCta } from '../_shared/cta';
import { TemplateCourses } from '../_shared/courses';
import { SOHAIL_DEFAULTS } from './defaults';
import { SohailHero } from './hero';
import { SohailFeatures } from './features';
import { SohailCategories } from './categories';
import { TemplateDataTable } from '../_shared/data-table';
import styles from './sohail.module.css';

const SOHAIL_THUMBS = [styles.t1, styles.t2, styles.t3, styles.t4];

/** Sohail — observatory instrument: deep void bands, teal signal, plotter grid. */
const SOHAIL_HEADER = headerDefaults({
  tagline: 'آکادمی نجوم و فضا',
  ctaText: 'ثبت‌نام در دوره',
  nav: FULL_NAV,
});

export const SOHAIL_SECTIONS: TemplateSectionMap = {
  header: ({ id, config }) => (
    <TemplateTopBar id={id} config={config} defaults={SOHAIL_HEADER} spec={{ tone: 'page', height: 72, navStyle: 'plain', markClassName: styles.logoMark, translucent: true }} />
  ),
  hero: SohailHero,
  marquee: ({ id, config }) => (
    <TemplateMarquee id={id} config={config} fallbackItems={SOHAIL_DEFAULTS.marquee.items} tone="brand" />
  ),
  features: SohailFeatures,
  courses: ({ id, config, storeContext }) => (
    <TemplateCourses
      id={id}
      config={config}
      storeContext={storeContext}
      defaults={SOHAIL_DEFAULTS.courses}
      thumbTones={SOHAIL_THUMBS}
      thumbClassName={styles.thumb}
      tone="surface"
    />
  ),
  categories: SohailCategories,
  showcase: ({ id, config }) => (
    <TemplateDataTable id={id} config={config} defaults={SOHAIL_DEFAULTS.missions} tone="surface" />
  ),
  teachers: ({ id, config }) => (
    <TemplateTeachers id={id} config={config} defaults={SOHAIL_DEFAULTS.teachers} tone="page" />
  ),
  pricing: ({ id, config }) => (
    <TemplatePricing id={id} config={config} defaults={SOHAIL_DEFAULTS.pricing} tone="deep" />
  ),
  cta: ({ id, config }) => <TemplateCta id={id} config={config} defaults={SOHAIL_DEFAULTS.cta} tone="deep" />,
  footer: ({ id, config }) => <TemplateSiteFooter id={id} config={config} defaults={SOHAIL_DEFAULTS.footer} />,
};
