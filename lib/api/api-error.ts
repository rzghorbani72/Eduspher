/**
 * Parse Nest HttpExceptionFilter bodies so the storefront can branch on
 * `code` / `status` instead of sniffing English prose.
 */

export type ParsedApiError = {
  readonly status: number;
  readonly code: string;
  readonly message: string;
};

export type ApiErrorUxKind =
  | 'login_required'
  | 'forbidden'
  | 'not_found'
  | 'rate_limited'
  | 'csrf'
  | 'legal_consent'
  | 'server'
  | 'generic';

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function parseApiError(status: number, body: unknown): ParsedApiError {
  const row = asRecord(body);
  const code = typeof row?.code === 'string' && row.code.length > 0 ? row.code : `HTTP_${status}`;
  const message =
    (typeof row?.message === 'string' && row.message) ||
    (typeof row?.error === 'string' && row.error) ||
    '';
  return { status, code, message };
}

/** Thrown errors from `lib/api/client` carry `{ code, status }` on the Error. */
export function parseThrownApiError(error: unknown): ParsedApiError | null {
  if (!error || typeof error !== 'object') return null;
  const row = error as {
    message?: unknown;
    code?: unknown;
    status?: unknown;
  };
  if (typeof row.status !== 'number') return null;
  return {
    status: row.status,
    code: typeof row.code === 'string' ? row.code : `HTTP_${row.status}`,
    message: typeof row.message === 'string' ? row.message : '',
  };
}

const LOGIN_CODES = new Set([
  'UNAUTHENTICATED',
  'AUTH_NOT_AUTHENTICATED',
  'AUTH_SESSION_EXPIRED',
  'AUTH_REFRESH_TOKEN_MISSING',
  'AUTH_REFRESH_TOKEN_INVALID',
  'AUTH_SESSION_NOT_FOUND',
]);

export function classifyApiError(error: ParsedApiError): ApiErrorUxKind {
  if (error.code === 'CSRF_REQUIRED') return 'csrf';
  if (error.code === 'LEGAL_CONSENT_REQUIRED') return 'legal_consent';
  if (error.status === 401 || LOGIN_CODES.has(error.code)) {
    return 'login_required';
  }
  if (error.status === 429 || error.code === 'RATE_LIMITED') {
    return 'rate_limited';
  }
  if (error.status === 404 || error.code === 'NOT_FOUND' || error.code === 'RESOURCE_NOT_FOUND') {
    return 'not_found';
  }
  if (error.status === 403 || error.code === 'FORBIDDEN' || error.code === 'PERMISSION_DENIED') {
    return 'forbidden';
  }
  if (error.status >= 500) return 'server';
  return 'generic';
}

/** Fallback copy key under `errors.*` when Nest left `message` empty. */
export function fallbackErrorKey(kind: ApiErrorUxKind): string {
  switch (kind) {
    case 'login_required':
      return 'errors.loginRequired';
    case 'forbidden':
      return 'errors.forbidden';
    case 'not_found':
      return 'errors.notFound';
    case 'rate_limited':
      return 'errors.rateLimited';
    case 'csrf':
      return 'errors.csrfRetry';
    case 'legal_consent':
      return 'errors.legalConsent';
    case 'server':
      return 'errors.server';
    default:
      return 'errors.generic';
  }
}
