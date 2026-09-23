import { buildAcademyPath } from '@/lib/utils';
import type { TemplateStoreContext } from './types';

/**
 * Every destination a template button may point at.
 *
 * The set is closed on purpose: a manager edits colours and copy, never links,
 * so no section can be configured into a dead end. In-page anchors are not in
 * here either — a section the manager hides would take the anchor with it and
 * the button would scroll nowhere.
 */
export const TEMPLATE_ROUTES = {
  home: '/',
  courses: '/courses',
  bundles: '/bundles',
  blog: '/blog',
  support: '/account/support?new=1',
  login: '/auth/login',
  register: '/auth/register',
  account: '/account',
} as const;

export type TemplateRoute = keyof typeof TEMPLATE_ROUTES;

/**
 * Resolves a route for the academy being rendered. Path-based academies live
 * under `/{slug}`, subdomain academies at the root, so a hardcoded "/courses"
 * is wrong for half of them.
 */
export function templateHref(
  storeContext: TemplateStoreContext | undefined,
  route: TemplateRoute,
): string {
  const slug = storeContext?.isSubdomain ? null : (storeContext?.slug ?? null);
  return buildAcademyPath(slug, TEMPLATE_ROUTES[route]);
}
