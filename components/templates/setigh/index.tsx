import type { TemplateSectionMap } from '../registry-types';
import { TemplateTopBar, headerDefaults, FULL_NAV } from '../_shared/header';
import { TemplateMarquee } from '../_shared/marquee';
import { TemplateSiteFooter } from '../_shared/footer';
import { TemplatePricing } from '../_shared/pricing';
import { TemplateTeachers } from '../_shared/teachers';
import { TemplateCta } from '../_shared/cta';
import { TemplateCourses } from '../_shared/courses';
import { SETIGH_DEFAULTS } from './defaults';
import { SetighHero } from './hero';
import { SetighFeatures } from './features';
import { SetighCategories } from './categories';
import { SetighLadder } from './ladder';
import styles from './setigh.module.css';

const SETIGH_THUMBS = [styles.t1, styles.t2, styles.t3, styles.t4];

/** Setigh — performance lab: hazard stripes, ghost numerals, load bars. */
const SETIGH_HEADER = headerDefaults({
  tagline: 'آزمایشگاه قدرت و اجرا',
  ctaText: 'شروع هفتهٔ صفر',
  nav: FULL_NAV,
});

export const SETIGH_SECTIONS: TemplateSectionMap = {
  header: ({ id, config, storeContext }) => (
    <TemplateTopBar id={id} config={config} editMode={storeContext?.editMode} defaults={SETIGH_HEADER} spec={{ tone: 'deep', height: 80, navStyle: 'plain', markClassName: styles.logoMark, accentBar: true }} />
  ),
  hero: SetighHero,
  marquee: ({ id, config }) => (
    <TemplateMarquee
      id={id}
      config={config}
      fallbackItems={SETIGH_DEFAULTS.marquee.items}
      tone="accent"
      separator="slash"
    />
  ),
  features: SetighFeatures,
  courses: ({ id, config, storeContext }) => (
    <TemplateCourses
      id={id}
      config={config}
      storeContext={storeContext}
      defaults={SETIGH_DEFAULTS.courses}
      thumbTones={SETIGH_THUMBS}
      thumbClassName={styles.thumb}
      tone="surface"
      footer="action"
    />
  ),
  categories: SetighCategories,
  showcase: SetighLadder,
  teachers: ({ id, config }) => (
    <TemplateTeachers id={id} config={config} defaults={SETIGH_DEFAULTS.teachers} tone="surface" />
  ),
  pricing: ({ id, config }) => (
    <TemplatePricing id={id} config={config} defaults={SETIGH_DEFAULTS.pricing} tone="page" />
  ),
  cta: ({ id, config }) => <TemplateCta id={id} config={config} defaults={SETIGH_DEFAULTS.cta} tone="deep" />,
  footer: ({ id, config }) => <TemplateSiteFooter id={id} config={config} defaults={SETIGH_DEFAULTS.footer} />,
};
