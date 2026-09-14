import type { ComponentType } from 'react';
import type { TemplateSectionProps } from './_shared/types';

/** The templates shipped as the public gallery. */
export const TEMPLATE_KEYS = [
  'keyhan',
  'tavan',
  'dastan',
  'parastoo',
  'nokhbeh',
  'zabaneh',
  'bikaran',
  'raushan',
  'shabtab',
  'sepid',
  'hamrang',
  'baran',
  'shafagh',
  'elektron',
  'rouzan',
  'daneshvar',
  'peleh',
  'andisheh',
  'shaparak',
  'partow',
  'pardeh',
] as const;

export type TemplateKey = (typeof TEMPLATE_KEYS)[number];

export function isTemplateKey(value: unknown): value is TemplateKey {
  return typeof value === 'string' && (TEMPLATE_KEYS as readonly string[]).includes(value);
}

/**
 * Canonical section types a template may implement. A template does not have to
 * implement all of them — anything missing falls back to the legacy shared block
 * for that type, which is what keeps sections mixable across templates.
 */
export type TemplateSectionType =
  | 'header'
  | 'hero'
  | 'marquee'
  | 'features'
  | 'courses'
  | 'categories'
  | 'showcase'
  | 'teachers'
  | 'testimonials'
  | 'cta'
  | 'footer';

export type TemplateSectionMap = Partial<
  Record<TemplateSectionType, ComponentType<TemplateSectionProps>>
>;
