import type { TemplateSectionMap } from '../registry-types';
import { TemplateTopBar, headerDefaults, FULL_NAV } from '../_shared/header';
import { TemplateMarquee } from '../_shared/marquee';
import { TemplateSiteFooter } from '../_shared/footer';
import { TemplatePricing } from '../_shared/pricing';
import { TemplateTeachers } from '../_shared/teachers';
import { TemplateCta } from '../_shared/cta';
import { TemplateCourses } from '../_shared/courses';
import { TemplateDataTable } from '../_shared/data-table';
import { SHAFAGH_DEFAULTS } from './defaults';
import { ShafaghHero } from './hero';
import { ShafaghFeatures } from './features';
import { ShafaghCategories } from './categories';
import styles from './shafagh.module.css';

const SHAFAGH_THUMBS = [styles.tA, styles.tB, styles.tC, styles.tD];

/** Shafagh — photography academy: warm coral wash, colour-block visuals, gradient caps. */
const SHAFAGH_HEADER = headerDefaults({
  tagline: 'آکادمی عکاسی و رسانهٔ بصری',
  ctaText: 'ثبت‌نام در دوره',
  nav: FULL_NAV,
});

export const SHAFAGH_SECTIONS: TemplateSectionMap = {
  header: ({ id, config, storeContext }) => (
    <TemplateTopBar
      id={id}
      config={config}
      editMode={storeContext?.editMode}
      defaults={SHAFAGH_HEADER}
      spec={{ tone: 'page', height: 76, navStyle: 'underline' }}
    />
  ),
  hero: ShafaghHero,
  marquee: ({ id, config }) => (
    <TemplateMarquee id={id} config={config} fallbackItems={SHAFAGH_DEFAULTS.marquee.items} tone="brand" />
  ),
  features: ShafaghFeatures,
  courses: ({ id, config, storeContext }) => (
    <TemplateCourses
      id={id}
      config={config}
      storeContext={storeContext}
      defaults={SHAFAGH_DEFAULTS.courses}
      thumbTones={SHAFAGH_THUMBS}
      thumbClassName="relative aspect-video overflow-hidden"
      tone="page"
    />
  ),
  categories: ShafaghCategories,
  showcase: ({ id, config }) => (
    <TemplateDataTable id={id} config={config} defaults={SHAFAGH_DEFAULTS.showcase} tone="surface" />
  ),
  teachers: ({ id, config }) => (
    <TemplateTeachers id={id} config={config} defaults={SHAFAGH_DEFAULTS.teachers} tone="page" avatarShape="round" />
  ),
  pricing: ({ id, config }) => (
    <TemplatePricing id={id} config={config} defaults={SHAFAGH_DEFAULTS.pricing} tone="surface" />
  ),
  cta: ({ id, config }) => <TemplateCta id={id} config={config} defaults={SHAFAGH_DEFAULTS.cta} tone="deep" boxed />,
  footer: ({ id, config }) => <TemplateSiteFooter id={id} config={config} defaults={SHAFAGH_DEFAULTS.footer} />,
};
