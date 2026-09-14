---
name: react-nextjs-expert
description: Use when adding a route, page, component, or data fetch in this repo, or asked how server/client boundaries, proxy.ts, templates, or the data layer work here. Not for visual polish -- use pixel-perfect-design-implement. Not for SEO -- use seo-marketing-expert.
---

# React / Next.js Expert — edusphere

Next.js 16 App Router, React 19, TypeScript (`strict: true`), Tailwind v4, shadcn/ui + Radix. This is the public, SEO-critical storefront — the Mentoma marketing site AND every academy's own white-label site, port 5000. Sibling repos: `../Backend` (API), `../AdminPanel` (manager panel).

## SEO/SSR is a hard constraint, not a preference

Content must be server-rendered — Google (and a cold-load user) must see real text in the HTML. `'use client'` only at leaves that truly need state/effects/browser APIs. Before writing a client component, ask whether it can be a server component with a small interactive child instead. See `seo-marketing-expert` for the full SEO checklist.

## Route groups

`app/(platform)/` — about, academies, contact, pricing, privacy, refund, terms (the marketing root, no academy context).
`app/[slug]/page.tsx` — an academy's own home page.
`app/{courses,bundles,classes,learn,checkout,payment,account,auth,blog,certificates,roadmap}/` — feature areas, resolved within whichever academy the request is on.
`app/api/{cart,health,log,payment}/` — route handlers.

## proxy.ts (this app's `middleware.ts`) — tenant resolution

`extractSubdomainSlug(host)` against `BASE_DOMAIN`, or a custom domain lookup via `GET {BACKEND_ORIGIN}{API_PATH}/academies/public`. Sets `x-academy-id`, `x-academy-slug`, `x-academy-subdomain`, `x-academy-home` headers for the request; rewrites a subdomain's `/` to `/{slug}`; unknown subdomain → `academy-not-found`. Also carries preview/embed CSP for the AdminPanel site-builder iframe and refresh-token handling. This is tenant *routing*, not authorization — the Backend still scopes every query.

## Data layer — two clients, one set of endpoints

- `lib/api/client.ts` — browser fetch, calls the Backend origin directly (`getClientBackendApiBaseUrl()`, `NEXT_PUBLIC_BACKEND_ORIGIN` + `/v1`), adds `X-Academy-ID` (from cookie or `NEXT_PUBLIC_DEFAULT_ACADEMY_ID`), `X-Academy-Slug`, `X-CSRF-Token`.
- `lib/api/server.ts` — server-only (`react.cache`-wrapped), forwards cookies, used in Server Components / `generateMetadata`.
- These two historically duplicated a lot of endpoint logic — if adding a call, check whether it already exists in both, and prefer writing the endpoint once and instantiating for each fetcher rather than copy-pasting (see the target layout for this pair in `docs/ARCHITECTURE.md`).
- `lib/backend-internal.ts` — trusted server-to-server calls with `X-API-Key` (`INTERNAL_API_KEY`), for internal-only endpoints.

## Theming and templates

Academy sites are white-label: theme tokens resolve at runtime from `app/globals.css` `@theme` → `--theme-*` custom properties (`lib/theme-apply.ts`, `lib/theme-config.ts`, `lib/theme-mode.ts`). Site layout comes from a **template** (`templates/`, `components/templates/`, `lib/active-template.ts`, `lib/template-presets.ts`) the academy picked in AdminPanel's site builder. Never hardcode a color, font, or copy string that should come from the academy's theme/template — it breaks white-labeling for every other academy.

## Preview / edit bridge

AdminPanel's site builder embeds this app in an iframe for live preview (`components/preview/preview-edit-bridge.tsx` handles the postMessage protocol). Changes to block rendering that also affect the editor's live preview need testing in both standalone and embedded mode.

## i18n

`lib/i18n/` (`translations/{fa,en,ar,tr}.ts`, DEFAULT `fa`). Same convention as AdminPanel — no hardcoded user-facing strings, RTL logical CSS.

## Reuse before creating

`components/ui-blocks/*` are the site-builder block components (hero, features, testimonials, footer…) — each often has several visual variants behind one block type; check for an existing variant before adding a new component. `components/ui/` is shadcn.

## The 400-line rule

Same as AdminPanel: `max-lines` errors at 400. `eslint.oversize.mjs`'s `OVERSIZE_ALLOWLIST` lists current legacy files (several `ui-blocks/*`, `lib/api/{client,server}.ts`) — split by extracting variants/endpoints into their own files, not by disabling the rule.

## Commands

`pnpm dev` (port 5000) · `pnpm build` · `pnpm test:e2e` / `test:e2e:smoke` (Playwright) · `pnpm lint` · `pnpm typecheck`.
