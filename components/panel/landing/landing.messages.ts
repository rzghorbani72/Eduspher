import { ACADEMY } from './messages/academy';
import { ACADEMIES } from './messages/academies';
import { COURSES } from './messages/courses';
import { CTA } from './messages/cta';
import { DOMAIN } from './messages/domain';
import { FAQ } from './messages/faq';
import { FEATURES } from './messages/features';
import { FOOTER } from './messages/footer';
import { HERO } from './messages/hero';
import { LIVE } from './messages/live';
import { NAV } from './messages/nav';
import { PERSONAS } from './messages/personas';
import { PRICING } from './messages/pricing';
import { PROBLEM } from './messages/problem';
import { QUICK_SIGNUP } from './messages/quick-signup';
import { SALES } from './messages/sales';
import { SAMPLES } from './messages/samples';
import { SOLUTION } from './messages/solution';
import { STEPS } from './messages/steps';
import { STUDENTS } from './messages/students';

/** Every user-facing string on the platform landing, grouped by section. */
export const LANDING = {
  nav: NAV,
  hero: HERO,
  personas: PERSONAS,
  steps: STEPS,
  live: LIVE,
  solution: SOLUTION,
  features: FEATURES,
  domain: DOMAIN,
  courses: COURSES,
  students: STUDENTS,
  sales: SALES,
  problem: PROBLEM,
  academy: ACADEMY,
  samples: SAMPLES,
  pricing: PRICING,
  faq: FAQ,
  cta: CTA,
  footer: FOOTER,
  academies: ACADEMIES,
  quickSignup: QUICK_SIGNUP,
} as const;
