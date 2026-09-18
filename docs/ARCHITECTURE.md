# Architecture — edusphere

Full business context: `docs/project-context.md`. This file is the technical map.

## System context

```mermaid
flowchart LR
  Visitor -->|HTTPS| ED[edusphere :5000]
  ED -->|"/v1/* + X-Academy-ID"| API[Backend :3000]
  API --> PG[(PostgreSQL)]
  Manager[Manager, via AdminPanel] -.->|"site-builder preview iframe"| ED
```

## Tenant resolution: proxy.ts

```mermaid
sequenceDiagram
  participant U as Browser
  participant PX as proxy.ts
  participant BE as Backend

  U->>PX: GET https://<slug>.mentoma.ir/  (or a custom domain)
  PX->>PX: extractSubdomainSlug(host) against BASE_DOMAIN
  alt subdomain not recognized
    PX->>BE: GET /v1/academies/public (match slug or custom public_address)
    BE-->>PX: academy record or none
  end
  alt academy found
    PX->>PX: set x-academy-id, x-academy-slug, x-academy-subdomain headers
    PX->>PX: rewrite "/" → "/{slug}"
    PX-->>U: render academy home
  else not found
    PX-->>U: render academy-not-found
  end
```

Platform marketing pages (`app/(platform)/*`) are the no-academy-context path — `proxy.ts` leaves them alone.

## Request → render (server-first)

```mermaid
sequenceDiagram
  participant U as Browser / Googlebot
  participant Pg as Page (Server Component)
  participant API as lib/api/server.ts
  participant BE as Backend /v1
  participant Th as Theme/template resolver

  U->>Pg: GET /courses/algebra-101
  Pg->>API: getCourse(slug) [react.cache, forwards cookies]
  API->>BE: fetch /v1/courses/public/algebra-101
  BE-->>API: course JSON
  API-->>Pg: typed data
  Pg->>Th: resolve academy theme + active template
  Th-->>Pg: CSS custom properties + block config
  Pg-->>U: fully server-rendered HTML (SEO requirement)
```

## Component layering

```mermaid
flowchart TB
  ui["components/ui (shadcn)"] --> blocks["components/ui-blocks/ (hero, features, testimonials, footer — multiple variants each)"]
  blocks --> templates["components/templates/ (full-page compositions)"]
  templates --> pages["app/[slug]/page.tsx, app/courses/[slug]/page.tsx, …"]
  bridge["components/preview/preview-edit-bridge.tsx"] -.->|postMessage, iframe only| pages
```

## Data layer — two fetchers

```mermaid
flowchart LR
  ClientComp["Client component"] --> clientApi["lib/api/client.ts (browser fetch, X-Academy-ID from cookie)"]
  ServerComp["Server component / generateMetadata"] --> serverApi["lib/api/server.ts (react.cache, forwards cookies)"]
  clientApi -->|"direct to backend origin"| Backend
  serverApi -->|"direct to backend origin, server-side"| Backend
  Internal["Route handlers (app/api/*)"] --> internalApi["lib/backend-internal.ts (X-API-Key, trusted S2S)"]
  internalApi --> Backend
```

## Theming

```mermaid
flowchart LR
  Academy["Academy.theme_config (DB)"] --> apply["lib/theme-apply.ts"]
  apply --> vars["CSS custom properties (--theme-*)"]
  vars --> globalsCss["app/globals.css @theme tokens"]
  globalsCss --> render["Rendered page, white-labeled"]
```

## System design: exists / partial / planned

| Concern                                  | Status   | Where                                                                                                                            |
| ---------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Tenant/subdomain resolution              | Exists   | `proxy.ts`                                                                                                                       |
| Server-rendered SEO                      | Exists   | enforced by convention + `lib/seo/`                                                                                              |
| White-label theming                      | Exists   | `lib/theme-apply.ts`, `app/globals.css`                                                                                          |
| Site builder live preview                | Exists   | `components/preview/preview-edit-bridge.tsx`                                                                                     |
| hreflang / multi-market (IR/COM)         | Partial  | `lib/seo/domains.ts`, `market-link.ts` — COM/English content is phase 2, not fully localized                                     |
| Checkout / payment                       | Exists   | `app/checkout`, `app/payment`, backed by Backend payment-providers                                                               |
| Guest quick enroll (live class)          | Exists   | `components/courses/quick-enroll/` — phone + OTP dialog on the course page; `?class=<id>` resumes into checkout after the reload |
| Client/server API fetcher de-duplication | Not done | `lib/api/{client,server}.ts` still duplicate a lot of endpoint logic — target layout in the Backend repo's split notes           |

## Owner map — update these docs when you touch these paths

| Change                                                       | Update                                                                                |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| `proxy.ts`                                                   | Tenant-resolution diagram                                                             |
| `lib/api/{client,server}.ts` structure                       | Data-layer diagram                                                                    |
| `lib/theme-apply.ts`, theme token shape                      | Theming diagram                                                                       |
| A new `components/templates/` or top-level `ui-blocks/` type | Component layering                                                                    |
| `lib/seo/**`                                                 | `seo-marketing-expert` skill (not this file — that skill is the living SEO reference) |

Update `docs/ONBOARDING.md` too whenever a command, env var, or gotcha changes.
