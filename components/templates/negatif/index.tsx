import type { TemplateSectionMap } from '../registry-types';
import { TemplateTopBar, headerDefaults, FULL_NAV } from '../_shared/header';
import { TemplateMarquee } from '../_shared/marquee';
import { TemplateSiteFooter } from '../_shared/footer';
import { TemplatePricing } from '../_shared/pricing';
import { TemplateTeachers } from '../_shared/teachers';
import { TemplateCta } from '../_shared/cta';
import { TemplateCourses } from '../_shared/courses';
import { TemplateDataTable } from '../_shared/data-table';
import { NEGATIF_DEFAULTS } from './defaults';
import { NegatifHero } from './hero';
import { NegatifFeatures } from './features';
import { NegatifCategories } from './categories';
import styles from './negatif.module.css';

const NEGATIF_THUMBS = [styles.tSepia, styles.tCross, styles.tMagenta, styles.tAmber];

/** Negatif — photography academy: film negative, contact sheet and darkroom motifs. */
const NEGATIF_HEADER = headerDefaults({
  tagline: 'آکادمی عکاسی و فیلم آنالوگ',
  ctaText: 'ثبت‌نام در دوره',
  nav: FULL_NAV,
});

export const NEGATIF_SECTIONS: TemplateSectionMap = {
  header: ({ id, config, storeContext }) => (
    <TemplateTopBar
      id={id}
      config={config}
      editMode={storeContext?.editMode}
      defaults={NEGATIF_HEADER}
      spec={{ tone: 'page', height: 72, navStyle: 'underline', markClassName: styles.lensMark, thickBorder: true }}
    />
  ),
  hero: NegatifHero,
  marquee: ({ id, config }) => (
    <TemplateMarquee id={id} config={config} fallbackItems={NEGATIF_DEFAULTS.marquee.items} tone="brand" />
  ),
  features: NegatifFeatures,
  courses: ({ id, config, storeContext }) => (
    <TemplateCourses
      id={id}
      config={config}
      storeContext={storeContext}
      defaults={NEGATIF_DEFAULTS.courses}
      thumbTones={NEGATIF_THUMBS}
      thumbClassName="relative aspect-video overflow-hidden bg-(--theme-deep)"
      tone="page"
    />
  ),
  categories: NegatifCategories,
  showcase: ({ id, config }) => (
    <TemplateDataTable id={id} config={config} defaults={NEGATIF_DEFAULTS.showcase} tone="surface" />
  ),
  teachers: ({ id, config }) => (
    <TemplateTeachers id={id} config={config} defaults={NEGATIF_DEFAULTS.teachers} tone="page" avatarShape="round" />
  ),
  pricing: ({ id, config }) => (
    <TemplatePricing id={id} config={config} defaults={NEGATIF_DEFAULTS.pricing} tone="deep" />
  ),
  cta: ({ id, config }) => (
    <TemplateCta id={id} config={config} defaults={NEGATIF_DEFAULTS.cta} tone="deep" boxed />
  ),
  footer: ({ id, config }) => <TemplateSiteFooter id={id} config={config} defaults={NEGATIF_DEFAULTS.footer} />,
};
