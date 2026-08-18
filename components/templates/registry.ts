import { KEYHAN_SECTIONS } from './keyhan';
import { TAVAN_SECTIONS } from './tavan';
import { DASTAN_SECTIONS } from './dastan';
import { PARASTOO_SECTIONS } from './parastoo';
import { NOKHBEH_SECTIONS } from './nokhbeh';
import { ZABANEH_SECTIONS } from './zabaneh';
import { BIKARAN_SECTIONS } from './bikaran';
import { RAUSHAN_SECTIONS } from './raushan';
import { SHABTAB_SECTIONS } from './shabtab';
import { SEPID_SECTIONS } from './sepid';
import { HAMRANG_SECTIONS } from './hamrang';
import { BARAN_SECTIONS } from './baran';
import { SHAFAGH_SECTIONS } from './shafagh';
import { ELEKTRON_SECTIONS } from './elektron';
import type { TemplateKey, TemplateSectionMap, TemplateSectionType } from './registry-types';
import { isTemplateKey } from './registry-types';
import type { ComponentType } from 'react';
import type { TemplateSectionProps } from './_shared/types';

/**
 * Template key → its section implementations.
 *
 * A block carries its template in `config.style`, so a section keeps its own
 * design when a manager imports it into a page built from another template.
 * Nothing here mutates the legacy block components: a type this map does not
 * cover falls through to the shared block, so academies on older styles are
 * untouched.
 */
const TEMPLATE_SECTIONS: Record<TemplateKey, TemplateSectionMap> = {
  keyhan: KEYHAN_SECTIONS,
  tavan: TAVAN_SECTIONS,
  dastan: DASTAN_SECTIONS,
  parastoo: PARASTOO_SECTIONS,
  nokhbeh: NOKHBEH_SECTIONS,
  zabaneh: ZABANEH_SECTIONS,
  bikaran: BIKARAN_SECTIONS,
  raushan: RAUSHAN_SECTIONS,
  shabtab: SHABTAB_SECTIONS,
  sepid: SEPID_SECTIONS,
  hamrang: HAMRANG_SECTIONS,
  baran: BARAN_SECTIONS,
  shafagh: SHAFAGH_SECTIONS,
  elektron: ELEKTRON_SECTIONS,
};

export function resolveTemplateSection(
  style: unknown,
  type: string
): ComponentType<TemplateSectionProps> | null {
  if (!isTemplateKey(style)) return null;
  const sections = TEMPLATE_SECTIONS[style];
  return sections[type as TemplateSectionType] ?? null;
}
