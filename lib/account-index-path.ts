/** Old `?tab=` bookmarks still resolve after /account was split into real routes. */
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

export const ACCOUNT_HOME_PATH = '/account/courses';

export const accountIndexPath = (tab: string | null): string =>
  (tab && TAB_ROUTES[tab]) || ACCOUNT_HOME_PATH;
