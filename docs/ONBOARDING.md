# Onboarding — edusphere

## What this app is

The public storefront for **Mentoma** — the marketing site (`mentoma.ir`) AND every academy's own white-label site (`<slug>.mentoma.ir`, or a custom domain), served from one codebase. See `docs/project-context.md` for business context. Runs on **port 5000**.

Sibling repos (separate git checkouts, expected as `../Backend` and `../AdminPanel`):
- **Backend** — the API and only source of truth for data, port 3000.
- **AdminPanel** — the manager dashboard that configures each academy's site (site builder, theme), port 4000.

## Stack & versions

Next.js 16 (App Router), React 19, TypeScript (`strict: true`), Tailwind v4, shadcn/ui + Radix, `@tanstack/react-query`, pnpm, Playwright, ESLint 9 flat config + Prettier, Loki/Grafana structured logging (browser → `/api/log`), Sentry.

## Setup

1. `pnpm install`
2. Create `.env.local` with at least:
   ```
   NEXT_PUBLIC_BACKEND_ORIGIN=http://localhost:3000
   NEXT_PUBLIC_BACKEND_API_PATH=/v1
   NEXT_PUBLIC_DEFAULT_ACADEMY_ID=<an academy id from your seeded Backend>
   NEXT_PUBLIC_DEFAULT_ACADEMY_SLUG=<that academy's slug>
   NEXT_PUBLIC_ADMIN_PANEL_URL=http://localhost:4000
   ```
   (The repo's `README.md` env example is stale — `NEXT_PUBLIC_BACKEND_API_PATH` defaults to `/v1` not `/api`, and the var names are `*_ACADEMY_*` not `*_STORE_*`; `lib/env.ts` is the source of truth.)
3. Have `../Backend` running.
4. `pnpm dev` — starts on port 5000. Visit `http://localhost:5000/<academy-slug>` for an academy site, or the bare root for the platform marketing pages.

## Commands

| Command | What it does |
|---|---|
| `pnpm dev` | Dev server, port 5000 |
| `pnpm build` | Production build |
| `pnpm test:e2e` / `test:e2e:smoke` | Playwright (needs Backend running) |
| `pnpm lint` | ESLint + the oversize/legacy-any allowlist check |
| `pnpm format` | Prettier write |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm log:catalog` | Regenerate this app's log catalog (runs `../Backend/tools/build-log-catalog.mjs`) |

## Folder map

```
app/(platform)/          Marketing root: about, academies, contact, pricing, privacy, refund, terms.
app/[slug]/                An academy's own home page.
app/{courses,bundles,classes,learn,checkout,payment,account,auth,blog,certificates,roadmap}/  Feature areas, resolved within whichever academy the request is on.
app/api/                    cart, health, log, payment route handlers.
components/ui-blocks/        Site-builder block components (hero, features, testimonials, footer…), each with several visual variants.
components/templates/         Full-page templates an academy can pick.
components/preview/           postMessage bridge for AdminPanel's live site-builder preview.
lib/api/{client,server}.ts     Browser vs. server-side fetchers — see Gotchas.
lib/seo/                        Metadata, sitemap, JSON-LD, crawl policy (see seo-marketing-expert skill).
lib/theme-apply.ts, theme-config.ts   Runtime theme token resolution.
proxy.ts                        This app's middleware.ts (Next 16 naming) — tenant/subdomain resolution.
docs/                            This documentation.
```

## How a request flows

Full diagram in `ARCHITECTURE.md`. Short version: `proxy.ts` resolves which academy owns this hostname (subdomain or custom domain), sets `x-academy-*` headers → the page (server-rendered, SEO requires this) fetches via `lib/api/server.ts` → Backend `/v1` → renders with the academy's theme and template.

## Where to look for X

| Need | Look here |
|---|---|
| Tenant/academy resolution | `proxy.ts` (`extractSubdomainSlug`), `lib/store-context.ts` |
| API calls (browser) | `lib/api/client.ts` |
| API calls (server component / metadata) | `lib/api/server.ts` |
| SEO (metadata, sitemap, JSON-LD) | `lib/seo/` — see `seo-marketing-expert` skill |
| Theme / white-label branding | `lib/theme-apply.ts`, `app/globals.css` `@theme` tokens |
| Site templates / blocks | `components/templates/`, `components/ui-blocks/`, `lib/active-template.ts` |
| i18n | `lib/i18n/` |
| Structured logging | `lib/logging/` — see `structured-logging` skill |

## Gotchas

- **Server-rendered content is not optional** — this is the public, indexed site. `"use client"` only at leaves; see `react-nextjs-expert` and `seo-marketing-expert` skills.
- **`proxy.ts`, not `middleware.ts`** — and it's doing real tenant *routing* (which academy), not just auth.
- **Two API fetchers with historically duplicated logic** (`lib/api/client.ts` vs `server.ts`) — check both before assuming an endpoint only needs adding once.
- **White-label**: never hardcode a Mentoma-specific color/logo/copy string in a template component — it must come from the academy's theme/template, or it breaks every other academy's site.
- **400-line file limit** — legacy oversize files tracked in `eslint.oversize.mjs`'s `OVERSIZE_ALLOWLIST`.
- **RTL** — `fa` is default; logical CSS, no `font-mono` on Persian digits.
