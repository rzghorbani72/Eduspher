/**
 * Keeps the phone/email the visitor typed across auth screens (login ↔ forgot,
 * phone ↔ email tabs). sessionStorage so a refresh on the same tab still has it;
 * never put secrets here — only the public identifier.
 */

export type AuthIdentifierChannel = 'phone' | 'email';

export type AuthIdentifierDraft = {
  phone: string;
  email: string;
  channel: AuthIdentifierChannel;
};

const STORAGE_KEY = 'mentoma.auth.identifier-draft';

export function readAuthIdentifierDraft(): AuthIdentifierDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    const draft = parsed as Partial<AuthIdentifierDraft>;
    return {
      phone: typeof draft.phone === 'string' ? draft.phone : '',
      email: typeof draft.email === 'string' ? draft.email : '',
      channel: draft.channel === 'email' ? 'email' : 'phone',
    };
  } catch {
    return null;
  }
}

export function writeAuthIdentifierDraft(patch: Partial<AuthIdentifierDraft>): void {
  if (typeof window === 'undefined') return;
  try {
    const current = readAuthIdentifierDraft() ?? { phone: '', email: '', channel: 'phone' };
    const next: AuthIdentifierDraft = {
      phone: patch.phone ?? current.phone,
      email: patch.email ?? current.email,
      channel: patch.channel ?? current.channel,
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // private mode / quota — ignore
  }
}

export function clearAuthIdentifierDraft(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** Build `?identifier=` (and keep other query keys) for auth path handoffs. */
export function withAuthIdentifier(
  path: string,
  identifier: string,
  extra?: Record<string, string | null | undefined>,
): string {
  const trimmed = identifier.trim();
  const [base, existing = ''] = path.split('?');
  const params = new URLSearchParams(existing);
  if (trimmed) params.set('identifier', trimmed);
  else params.delete('identifier');
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
  }
  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

export function isEmailIdentifier(value: string): boolean {
  return value.includes('@');
}
