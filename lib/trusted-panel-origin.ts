function normalizeOrigin(raw: string): string | null {
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

/** postMessage from the AdminPanel template editor must match this origin. */
export function isTrustedPanelOrigin(origin: string): boolean {
  const configured = process.env.NEXT_PUBLIC_ADMIN_PANEL_URL?.trim();
  if (configured) {
    const expected = normalizeOrigin(configured);
    if (expected) return origin === expected;
  }

  if (process.env.NODE_ENV !== 'production') {
    return (
      origin === window.location.origin ||
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:')
    );
  }

  return false;
}

/** Target origin for postMessage to the AdminPanel parent window. */
export function getPanelPostMessageTarget(): string {
  const configured = process.env.NEXT_PUBLIC_ADMIN_PANEL_URL?.trim();
  if (configured) {
    const expected = normalizeOrigin(configured);
    if (expected) return expected;
  }

  if (process.env.NODE_ENV !== 'production') {
    return '*';
  }

  return '*';
}
