# edusphere E2E (Playwright)

Browser tests for the student auth flows (checklist 5.1).

## Routes under test
- `/auth/login` — STUDENT login (email or phone + password)
- `/auth/register` — student sign-up
- `/auth/forgot-password` — password reset

## Running
edusphere is multi-tenant and resolves the academy on the server, so pages can
call the API during SSR. Run the backend on `:3000` for reliable runs:

```bash
pnpm --dir ../Backend start          # API on :3000 (seed first if needed)
pnpm exec playwright install chromium # first time only
pnpm test:e2e                         # auto-starts next dev on :5000
```

## Backend-dependent specs (`@backend`)
Happy-path login is skipped unless `E2E_BACKEND=1`, and needs a seeded STUDENT
plus an academy id edusphere can resolve:

```bash
E2E_BACKEND=1 \
E2E_STUDENT_EMAIL=student@example.com \
E2E_STUDENT_PASSWORD='Passw0rd!' \
pnpm test:e2e
```
