import type { TemplateSectionMap } from '../registry-types';
import { TemplateTopBar, headerDefaults, FULL_NAV } from '../_shared/header';
import { TemplateMarquee } from '../_shared/marquee';
import { TemplateSiteFooter } from '../_shared/footer';
import { TemplatePricing } from '../_shared/pricing';
import { TemplateTeachers } from '../_shared/teachers';
import { TemplateCta } from '../_shared/cta';
import { TemplateCourses } from '../_shared/courses';
import { TemplateDataTable } from '../_shared/data-table';
import { NABZ_DEFAULTS } from './defaults';
import { NabzHero } from './hero';
import { NabzFeatures } from './features';
import { NabzCategories } from './categories';
import styles from './nabz.module.css';

/** Nabz — digital/media academy: dark pulse stage, signal dots and a gradient wave. */
const NABZ_HEADER = headerDefaults({
  tagline: 'آکادمی دیجیتال، رسانه و طراحی',
  ctaText: 'ثبت‌نام در دوره',
  nav: FULL_NAV,
});

export const NABZ_SECTIONS: TemplateSectionMap = {
  header: ({ id, config, storeContext }) => (
    <TemplateTopBar
      id={id}
      config={config}
      editMode={storeContext?.editMode}
      defaults={NABZ_HEADER}
      spec={{ tone: 'deep', height: 72, navStyle: 'pill' }}
    />
  ),
  hero: NabzHero,
  marquee: ({ id, config }) => (
    <TemplateMarquee id={id} config={config} fallbackItems={NABZ_DEFAULTS.marquee.items} tone="accent" />
  ),
  features: NabzFeatures,
  courses: ({ id, config, storeContext }) => (
    <TemplateCourses
      id={id}
      config={config}
      storeContext={storeContext}
      defaults={NABZ_DEFAULTS.courses}
      thumbTones={[styles.stage, styles.stage, styles.stage, styles.stage]}
      thumbClassName="relative aspect-video overflow-hidden"
      tone="surface"
    />
  ),
  categories: NabzCategories,
  showcase: ({ id, config }) => (
    <TemplateDataTable id={id} config={config} defaults={NABZ_DEFAULTS.showcase} tone="surface" />
  ),
  teachers: ({ id, config }) => (
    <TemplateTeachers id={id} config={config} defaults={NABZ_DEFAULTS.teachers} tone="page" />
  ),
  pricing: ({ id, config }) => (
    <TemplatePricing id={id} config={config} defaults={NABZ_DEFAULTS.pricing} tone="deep" />
  ),
  cta: ({ id, config }) => <TemplateCta id={id} config={config} defaults={NABZ_DEFAULTS.cta} tone="accent" boxed />,
  footer: ({ id, config }) => <TemplateSiteFooter id={id} config={config} defaults={NABZ_DEFAULTS.footer} />,
};
