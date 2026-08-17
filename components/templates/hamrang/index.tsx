import type { TemplateSectionMap } from '../registry-types';
import { HamrangHero } from './hero';

/**
 * Hamrang currently implements only its hero design. Every other section type
 * falls through to the legacy shared block, which is the supported mixable
 * pattern documented on `TemplateSectionMap`.
 */
export const HAMRANG_SECTIONS: TemplateSectionMap = {
  hero: HamrangHero,
};
