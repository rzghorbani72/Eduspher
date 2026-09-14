---
name: client-browser-performance-expert
description: Use when a public page feels slow, before adding memoization, when reviewing bundle size, image/video loading, or asked to improve Lighthouse/Core-Web-Vitals/load performance. Measure first -- this skill is not a license to add useMemo everywhere.
---

# Client & Browser Performance Expert — edusphere

This is the **public, SEO-critical** site — Core Web Vitals (LCP, CLS, INP) are a ranking factor here, not just a nice-to-have (unlike AdminPanel). Measure-then-optimize still applies: no speculative `useMemo`.

## Before touching anything: measure

- `next build` per-route bundle size, before/after.
- Lighthouse (or Chrome DevTools Performance panel) on the actual page, not a proxy for it.
- A slow academy storefront is often a slow **template/theme resolution** or a heavy `ui-blocks/*` component, not generic "React is slow" — profile the specific block.

## LCP — usually the hero image or hero block

- `next/image` for every raster image, always with explicit `width`/`height` (or `fill` + a sized container) to avoid layout shift. A hero background image is almost always the LCP element on an academy home page — prioritize it (`priority` prop), don't lazy-load it.
- `components/motion/*` (animated/creative backgrounds) can delay LCP if they block the hero's paint — check whether the animation can start after first paint instead of gating it.

## Bundle size

- Dynamic-`import()` rarely-used `ui-blocks/*` variants and the preview/edit bridge (`components/preview/preview-edit-bridge.tsx` — only relevant when embedded in the AdminPanel iframe, never needed on a normal visitor's load).
- `lib/i18n/translations/*.ts` are large; confirm only the active locale ships to the client where possible.

## Video

HLS via `hls.js` — lazy-load it only on pages that actually play video (course/lesson pages), never in the shared layout. Platform-wide delivered video is capped at 1500 kbps/720p (Backend's `HLS_MAX_BITRATE_KBPS`) — don't fight that cap with custom player settings.

## Data fetching / SSR cost

Server-side fetchers (`lib/api/server.ts`) are `react.cache`-wrapped — check whether a slow page is doing a redundant duplicate fetch instead of reusing the cached call within the same request. `@tanstack/react-query` (`lib/query/keys.ts`) handles client-side re-fetch avoidance the same way as AdminPanel.

## Fonts

Persian web fonts are a common LCP/CLS cost on this site — verify font loading strategy (`next/font`, `app/styles/gfonts.css`) isn't blocking first paint or causing a visible font swap that shifts layout.

## Measuring the fix

Playwright trace (`--trace on`) or Lighthouse CI for the specific page, before and after — a "feels faster" without a number isn't a verified fix, especially since a Core Web Vitals regression has a real SEO cost here.

## When reviewing a "make it faster" request

Ask which specific page and which Core Web Vital moved (or should move), and check it's not actually an SSR/theme-resolution issue on the Backend side before optimizing client code.
