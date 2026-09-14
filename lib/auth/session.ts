import 'server-only';

import { cookies } from 'next/headers';
import { decodeJwt } from 'jose';

export type SessionPayload = {
  userId: string | null;
  profileId: string | null;
  academyId: string | null;
  roles: string[];
};

// Ids are cuid strings; older tokens carried numbers, so both are accepted.
const readId = (value: unknown): string | null => {
  if (typeof value === 'string' && value.length > 0) return value;
  if (typeof value === 'number') return String(value);
  return null;
};

export const getSession = async (): Promise<SessionPayload | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get('jwt')?.value;
  if (!token) return null;
  try {
    const payload = decodeJwt(token);
    const isExpired = typeof payload.exp === 'number' && payload.exp < Date.now() / 1000;
    if (isExpired) return null;

    const profileId = readId(payload.profileId) ?? readId(payload.userId);
    if (!profileId) return null;

    return {
      userId: readId(payload.userId) ?? profileId,
      profileId,
      academyId: readId(payload.academyId),
      roles: Array.isArray(payload.roles) ? (payload.roles as string[]) : [],
    };
  } catch {
    return null;
  }
};
