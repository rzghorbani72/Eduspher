import type { TemplateSectionMap } from '../registry-types';
import { TemplateTopBar, headerDefaults, COMPACT_NAV } from '../_shared/header';
import { TemplateMarquee } from '../_shared/marquee';
import { TemplateSiteFooter } from '../_shared/footer';
import { TemplatePricing } from '../_shared/pricing';
import { TemplateTeachers } from '../_shared/teachers';
import { TemplateCta } from '../_shared/cta';
import { TemplateCourses } from '../_shared/courses';
import { GOFTAVARD_DEFAULTS } from './defaults';
import { GoftavardHero } from './hero';
import { GoftavardFeatures } from './features';
import { GoftavardLevels } from './levels';
import styles from './goftavard.module.css';

const GOFTAVARD_THUMBS = [styles.t1, styles.t2, styles.t3, styles.t4];

/** Goftavard — dictionary and transcript: highlighter signal, tilted cards. */
const GOFTAVARD_HEADER = headerDefaults({
  tagline: 'آکادمی زبان',
  ctaText: 'آزمون تعیین سطح',
  nav: COMPACT_NAV,
});

export const GOFTAVARD_SECTIONS: TemplateSectionMap = {
  header: ({ id, config, storeContext }) => (
    <TemplateTopBar id={id} config={config} editMode={storeContext?.editMode} defaults={GOFTAVARD_HEADER} spec={{ tone: 'surface', height: 74, navStyle: 'underline' }} />
  ),
  hero: GoftavardHero,
  marquee: ({ id, config }) => (
    <TemplateMarquee id={id} config={config} fallbackItems={GOFTAVARD_DEFAULTS.marquee.items} tone="deep" />
  ),
  features: GoftavardFeatures,
  courses: ({ id, config, storeContext }) => (
    <TemplateCourses
      id={id}
      config={config}
      storeContext={storeContext}
      defaults={GOFTAVARD_DEFAULTS.courses}
      thumbTones={GOFTAVARD_THUMBS}
      thumbClassName={styles.thumb}
      tone="surface"
    />
  ),
  showcase: GoftavardLevels,
  teachers: ({ id, config }) => (
    <TemplateTeachers id={id} config={config} defaults={GOFTAVARD_DEFAULTS.teachers} tone="page" avatarShape="round" />
  ),
  pricing: ({ id, config }) => (
    <TemplatePricing id={id} config={config} defaults={GOFTAVARD_DEFAULTS.pricing} tone="page" />
  ),
  cta: ({ id, config }) => <TemplateCta id={id} config={config} defaults={GOFTAVARD_DEFAULTS.cta} tone="deep" />,
  footer: ({ id, config }) => <TemplateSiteFooter id={id} config={config} defaults={GOFTAVARD_DEFAULTS.footer} />,
};
