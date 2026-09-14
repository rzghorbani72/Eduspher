import { test, expect } from '@playwright/test';

/**
 * Smoke: every response from the storefront carries the baseline security
 * headers (OWASP A05). No backend needed — `next.config.ts` `headers()` applies
 * in dev too. Guards the clickjacking + sniffing + CSP hardening.
 */
test.describe('edusphere security headers (smoke)', () => {
  test('auth page response sets frame, sniff, referrer and CSP headers', async ({ page }) => {
    const res = await page.goto('/auth/login');
    expect(res, 'navigation returned a response').toBeTruthy();
    const h = res!.headers();

    expect(h['x-frame-options']).toBe('DENY');
    expect(h['x-content-type-options']).toBe('nosniff');
    expect(h['referrer-policy']).toBeTruthy();
    expect(h['content-security-policy']).toContain("frame-ancestors 'none'");
    expect(h['content-security-policy']).toContain('worker-src');
    // No legacy powered-by leak.
    expect(h['x-powered-by']).toBeFalsy();
  });

  test('CSP restricts default-src to self', async ({ page }) => {
    const res = await page.goto('/auth/register');
    const csp = res!.headers()['content-security-policy'] ?? '';
    expect(csp).toContain("default-src 'self'");
  });

  // JSON-LD carries academy/author-supplied text. JSON.stringify does not escape
  // `<`, so an unescaped `</script>` in any field would close the tag and run the
  // rest as HTML (stored XSS). serializeJsonLd escapes it to <.
  test('JSON-LD blocks a </script> breakout and stays valid JSON', async ({ page }) => {
    // JSON-LD only renders on API-backed routes (home / academy / blog).
    test.skip(!process.env.E2E_BACKEND, 'set E2E_BACKEND=1 to run against the API');
    await page.goto('/');
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();

    for (const raw of blocks) {
      expect(raw, 'no literal closing tag inside JSON-LD').not.toContain('</script');
      expect(() => JSON.parse(raw), 'JSON-LD stays parseable').not.toThrow();
    }
  });
});
