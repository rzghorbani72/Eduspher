# Platform landing

The public marketing page at `/` (composed by `landing-page.tsx`, rendered from
`app/page.tsx`). Built from the Figma `Landing` frame — white surface, mint
`#30FFB4` accent, RTL Persian.

## Why motion is centralized

`landing-motion.tsx` owns **every** scroll-driven GSAP animation; sections stay
plain markup and opt in with `data-lp="..."` attributes. This keeps sections
server components (only `publish-section` and `site-header` are clients) and
keeps GSAP in one dynamically-imported place so it never enters the initial
bundle of an LCP-critical page.

Three motion systems, deliberately separate:

| What | Where | Why not GSAP / why GSAP |
|---|---|---|
| Header hide-on-scroll-down | `use-hide-on-scroll.ts` | A passive scroll listener toggling one boolean. Must feel instant and must not wait on a dynamic import. |
| Section fade-in on enter | `section-reveal.tsx` | IntersectionObserver, zero bundle cost. The common case doesn't need a timeline. |
| Hero earth scrub + image accordion | `landing-motion.tsx` | Genuinely scrubbed to scroll position — this is what GSAP ScrollTrigger is for. |

All three bail out under `prefers-reduced-motion: reduce` and render the final
state. The hero is never opacity-hidden at rest because it owns LCP.

## Cascade-layer gotcha

`globals.css` styles all `a` inside `@layer base` with the *academy* theme color,
and has an unlayered `a[class*="rounded-full"][class*="bg-"] { color: white
!important }` hack for button-shaped links. Neither should apply here — this page
is not an academy page.

Two things in `globals.css` handle that, and both matter:

1. `.lp-root a { color: inherit }` — **inside `@layer base`**. If it were
   unlayered it would beat every Tailwind utility regardless of specificity,
   and no `text-lp-*` class on a link would ever apply.
2. The `!important` white-link hack carries `:not(.lp-root a)`.

If link colors on this page ever go wrong, check those two first.

## Tokens

Design tokens live in the `@theme` block in `globals.css`, prefixed `lp-`
(`bg-lp-mint`, `text-lp-muted`, `rounded-lp`, `shadow-lp-mint`, …). They are
intentionally **not** bound to the `--theme-*` academy variables so a cached
tenant theme can never restyle the marketing page.

## Copy

All Persian strings live in `landing.messages.ts`. No literal user-facing text in
JSX.

## Placeholder art

`public/landing/*.svg` are placeholders standing in for the real Figma exports.
Replacing a file in place is enough — no code change needed.
