import type { TemplateSectionMap } from '../registry-types';
import { TemplateTopBar, headerDefaults, FULL_NAV } from '../_shared/header';
import { TemplateMarquee } from '../_shared/marquee';
import { TemplateSiteFooter } from '../_shared/footer';
import { TemplatePricing } from '../_shared/pricing';
import { TemplateTeachers } from '../_shared/teachers';
import { TemplateCta } from '../_shared/cta';
import { TemplateCourses } from '../_shared/courses';
import { TemplateTracks } from '../_shared/tracks';
import { MOMAS_DEFAULTS } from './defaults';
import { MomasHero } from './hero';
import { MomasFeatures } from './features';
import { MomasQuiz } from './quiz';
import styles from './momas.module.css';

const MOMAS_THUMBS = [styles.t1, styles.t2, styles.t3, styles.t4];

/** Momas — worked on paper: squared grid, blue ink, red pen, mono numerals. */
const MOMAS_HEADER = headerDefaults({
  tagline: 'ریاضی و آمادگی کنکور',
  ctaText: 'مشاورهٔ رایگان',
  nav: FULL_NAV,
});

export const MOMAS_SECTIONS: TemplateSectionMap = {
  header: ({ id, config, storeContext }) => (
    <TemplateTopBar id={id} config={config} editMode={storeContext?.editMode} defaults={MOMAS_HEADER} spec={{ tone: 'page', height: 76, navStyle: 'plain', markClassName: styles.logoMark, monoTagline: true }} />
  ),
  hero: MomasHero,
  marquee: ({ id, config }) => (
    <TemplateMarquee id={id} config={config} fallbackItems={MOMAS_DEFAULTS.marquee.items} tone="deep" />
  ),
  features: MomasFeatures,
  courses: ({ id, config, storeContext }) => (
    <TemplateCourses
      id={id}
      config={config}
      storeContext={storeContext}
      defaults={MOMAS_DEFAULTS.courses}
      thumbTones={MOMAS_THUMBS}
      thumbClassName={styles.thumb}
      tone="page"
    />
  ),
  categories: ({ id, config }) => (
    <TemplateTracks id={id} config={config} defaults={MOMAS_DEFAULTS.categories} tone="surface" columns={4} />
  ),
  showcase: MomasQuiz,
  teachers: ({ id, config }) => (
    <TemplateTeachers id={id} config={config} defaults={MOMAS_DEFAULTS.teachers} tone="surface" />
  ),
  pricing: ({ id, config }) => (
    <TemplatePricing id={id} config={config} defaults={MOMAS_DEFAULTS.pricing} tone="page" />
  ),
  cta: ({ id, config }) => <TemplateCta id={id} config={config} defaults={MOMAS_DEFAULTS.cta} tone="deep" />,
  footer: ({ id, config }) => <TemplateSiteFooter id={id} config={config} defaults={MOMAS_DEFAULTS.footer} />,
};
