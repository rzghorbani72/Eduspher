const normalizeBaseUrl = (origin: string) => {
  const trimmed = origin.trim().replace(/\/+$/, '');
  return trimmed.length ? trimmed : 'http://localhost:3000';
};

const normalizeApiPath = (path: string) => {
  if (!path) return '/api';
  if (!path.startsWith('/')) {
    return `/${path}`;
  }
  return path;
};

const defaultAcademyId = Number(process.env.NEXT_PUBLIC_DEFAULT_ACADEMY_ID ?? '1');
const defaultAcademySlug = process.env.NEXT_PUBLIC_DEFAULT_ACADEMY_SLUG ?? null;
const academyIdCookie =
  process.env.NEXT_PUBLIC_ACADEMY_ID_COOKIE ?? 'skillforge_selected_academy_id';
const academySlugCookie =
  process.env.NEXT_PUBLIC_ACADEMY_SLUG_COOKIE ?? 'eduspher_academy_slug';
const academyNameCookie =
  process.env.NEXT_PUBLIC_ACADEMY_NAME_COOKIE ?? 'eduspher_academy_name';

const adminPanelOrigin = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_ADMIN_PANEL_URL ?? 'http://localhost:4000'
);

export const env = {
  backendOrigin: normalizeBaseUrl(process.env.NEXT_PUBLIC_BACKEND_ORIGIN ?? ''),
  backendApiPath: normalizeApiPath(process.env.NEXT_PUBLIC_BACKEND_API_PATH ?? '/api'),
  adminPanelOrigin,
  defaultAcademyId,
  defaultAcademySlug,
  academyIdCookie,
  academySlugCookie,
  academyNameCookie,
  siteName: process.env.NEXT_PUBLIC_SITE_NAME ?? 'EduSpher',
  siteDescription:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ??
    'Online courses for your institute — one branded site for classes, teachers, and students.',
  appUrl: normalizeBaseUrl(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:5000'),
};

export const backendApiBaseUrl = `${env.backendOrigin}${env.backendApiPath}`;

