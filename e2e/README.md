# edusphere E2E (Playwright)

Browser tests for the student storefront.

## Layout
- `e2e/auth/` — student auth-form validation + happy-path login (`@backend`).
- `e2e/smoke/` — **no backend needed**, all green in CI/dev:
  - `security-headers.spec.ts` — CSP / `X-Frame-Options: DENY` / nosniff / referrer (OWASP A05).
  - `public-pages.spec.ts` — auth pages render, 404 page, Persian RTL `<html dir/lang>`.
  - `auth-guard.spec.ts` — **hacker**: `/account`, `/account/orders`, `/checkout` bounce to `/auth/login` when unauthenticated.
- `e2e/roles/` — `@backend` student persona journey (login → catalog → account/orders).

## Running
edusphere is multi-tenant and resolves the academy on the server, so pages can
call the API during SSR. Run the backend on `:3000` for reliable runs:

## Running
edusphere is multi-tenant and resolves the academy on the server, so pages can
call the API during SSR. Run the backend on `:3000` for reliable runs:

```bash
pnpm --dir ../Backend start          # API on :3000 (seed first if needed)
pnpm exec playwright install chromium # first time only
pnpm test:e2e                         # auto-starts next dev on :5000
```

## Backend-dependent specs (`@backend`)
Happy-path login is skipped unless `E2E_BACKEND=1`. Verified recipe:

```bash
# 1) seed a known academy + student (prints ACADEMY_ID)
pnpm --dir ../Backend seed:e2e
# 2) run the API (any free port, e.g. 3001)
PORT=3001 NODE_ENV=development pnpm --dir ../Backend exec nest start &
# 3) point edusphere at it + pass the seeded creds/academy
NEXT_PUBLIC_BACKEND_ORIGIN=http://localhost:3001 \
E2E_BACKEND=1 \
E2E_STUDENT_EMAIL=e2e.student.live@test.local \
E2E_STUDENT_PASSWORD='Passw0rd!' \
E2E_ACADEMY_ID=<cuid printed by seed:e2e> \
pnpm test:e2e
```

The spec sets the `skillforge_selected_academy_id` cookie to `E2E_ACADEMY_ID` so
the login form sends the correct (cuid) academy to public login.
