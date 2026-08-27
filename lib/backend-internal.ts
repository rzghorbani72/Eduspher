/** Headers for trusted server-to-server calls to the Nest API. */
export function buildInternalBackendHeaders(
  extra?: Record<string, string | undefined>,
): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const key = process.env.INTERNAL_API_KEY;
  if (key) headers['x-api-key'] = key;
  if (extra) {
    for (const [name, value] of Object.entries(extra)) {
      if (value !== undefined) headers[name] = value;
    }
  }
  return headers;
}
