import "server-only";

import { cookies, headers as nextHeaders } from "next/headers";

import { env } from "@/lib/env";

export type ResolvedAcademy = {
  id: number | null;
  slug: string | null;
  name: string;
};

const decodeCookieValue = (value?: string | null) => {
  if (!value) return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

export const getAcademyContext = async (): Promise<ResolvedAcademy> => {
  const cookieStore = await cookies();
  const headerStore = await nextHeaders();

  const headerAcademyId =
    headerStore?.get?.("x-academy-id") ?? headerStore?.get?.("X-Academy-ID") ?? null;
  const headerAcademySlug =
    headerStore?.get?.("x-academy-slug") ?? headerStore?.get?.("X-Academy-Slug") ?? null;
  const cookieAcademyId = cookieStore.get(env.academyIdCookie)?.value;
  const cookieAcademySlug = cookieStore.get(env.academySlugCookie)?.value;
  const cookieAcademyName = decodeCookieValue(
    cookieStore.get(env.academyNameCookie)?.value
  );

  const resolvedId =
    headerAcademyId ??
    cookieAcademyId ??
    (env.defaultAcademyId ? String(env.defaultAcademyId) : null);

  const resolvedSlug =
    headerAcademySlug ??
    cookieAcademySlug ??
    env.defaultAcademySlug ??
    null;

  const resolvedName = cookieAcademyName ?? env.siteName;

  return {
    id: resolvedId ? Number(resolvedId) : null,
    slug: resolvedSlug,
    name: resolvedName,
  };
};
