import type { TemplateSectionMap } from '../registry-types';
import { ShabtabHero } from './hero';

/**
 * Shabtab currently implements only its hero design. Every other section type
 * falls through to the legacy shared block, which is the supported mixable
 * pattern documented on `TemplateSectionMap`.
 */
export const SHABTAB_SECTIONS: TemplateSectionMap = {
  hero: ShabtabHero,
};
