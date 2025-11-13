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

export const env = {
  backendOrigin: normalizeBaseUrl(process.env.NEXT_PUBLIC_BACKEND_ORIGIN ?? ''),
  backendApiPath: normalizeApiPath(process.env.NEXT_PUBLIC_BACKEND_API_PATH ?? '/api'),
  defaultSchoolId: Number(process.env.NEXT_PUBLIC_DEFAULT_SCHOOL_ID ?? '1'),
  defaultSchoolSlug: process.env.NEXT_PUBLIC_DEFAULT_SCHOOL_SLUG ?? null,
  siteName: process.env.NEXT_PUBLIC_SITE_NAME ?? 'EduSpher',
  siteDescription:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ??
    'Discover flexible online learning with EduSpher.',
  schoolIdCookie: process.env.NEXT_PUBLIC_SCHOOL_ID_COOKIE ?? 'eduspher_school_id',
  schoolSlugCookie: process.env.NEXT_PUBLIC_SCHOOL_SLUG_COOKIE ?? 'eduspher_school_slug',
  schoolNameCookie: process.env.NEXT_PUBLIC_SCHOOL_NAME_COOKIE ?? 'eduspher_school_name',
};

export const backendApiBaseUrl = `${env.backendOrigin}${env.backendApiPath}`;

