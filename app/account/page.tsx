import { redirect } from 'next/navigation';

import { getAcademyContext } from '@/lib/store-context';
import { buildAcademyPath } from '@/lib/utils';

/**
 * /account is now a set of real routes. Old `?tab=` bookmarks and links still
 * resolve, so nobody lands on a dead page after the split.
 */
const TAB_ROUTES: Record<string, string> = {
  courses: '/account/courses',
  progress: '/account/progress',
  work: '/account/assignments',
  results: '/account/results',
  classes: '/account/classes',
  history: '/account/classes',
  tutoring: '/account/tutoring',
  transactions: '/account/transactions',
  settings: '/account/profile',
};

export default async function AccountIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const academyContext = await getAcademyContext();
  const target = (tab && TAB_ROUTES[tab]) || '/account/courses';
  redirect(buildAcademyPath(academyContext.isSubdomain ? null : academyContext.slug, target));
}
