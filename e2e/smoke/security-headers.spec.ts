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
    // No legacy powered-by leak.
    expect(h['x-powered-by']).toBeFalsy();
  });

  test('CSP restricts default-src to self', async ({ page }) => {
    const res = await page.goto('/auth/register');
    const csp = res!.headers()['content-security-policy'] ?? '';
    expect(csp).toContain("default-src 'self'");
  });
});
