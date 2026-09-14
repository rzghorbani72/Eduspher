/**
 * Contract every template section implements.
 *
 * A section is a pure presentation component: all of its copy comes from
 * `config` (seeded by the Backend preset, edited by the manager in AdminPanel)
 * and all of its colour comes from `--theme-*` variables. It never reads a
 * hardcoded colour and never assumes what renders above or below it, so any
 * section can be mixed into any other template's page.
 */
export interface TemplateSectionProps {
  id?: string;
  config?: SectionConfig;
  storeContext?: TemplateStoreContext;
}

export interface TemplateStoreContext {
  id: string | null;
  slug: string | null;
  isSubdomain?: boolean;
  name: string | null;
  stats?: { courseCount: number; studentCount: number } | null;
  academyId?: string | null;
  /**
   * Preview surfaces only. When true, sections may top their live records up
   * with clearly-marked sample rows so an empty academy still previews as a
   * finished site. The published storefront never sets this.
   */
  sampleData?: boolean;
  /** Template editor canvas (`?edit=1`) — shows dashed placeholders for removed slots. */
  editMode?: boolean;
}

/**
 * Section config is free-form by design — each section declares which keys it
 * reads, and AdminPanel's `section-schema.ts` declares which of those keys the
 * manager can edit. `unknown` keeps that flexible without reaching for `any`.
 */
export type SectionConfig = Record<string, unknown>;

export function text(config: SectionConfig | undefined, key: string, fallback: string): string {
  const value = config?.[key];
  return typeof value === 'string' && value.trim() ? value : fallback;
}

export function list<T>(
  config: SectionConfig | undefined,
  key: string,
  fallback: readonly T[],
): readonly T[] {
  const value = config?.[key];
  return Array.isArray(value) && value.length > 0 ? (value as T[]) : fallback;
}

export function flag(config: SectionConfig | undefined, key: string, fallback: boolean): boolean {
  const value = config?.[key];
  return typeof value === 'boolean' ? value : fallback;
}

/** Decoration / sub-block visibility — hidden when config flag is explicitly false. */
export function featureVisible(config: SectionConfig | undefined, flagKey: string): boolean {
  return config?.[flagKey] !== false;
}
