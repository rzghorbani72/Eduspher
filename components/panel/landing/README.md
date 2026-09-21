# Platform landing

The public marketing page at `/` (composed by `landing-page.tsx`, rendered from
`app/page.tsx`). Built from the Claude Design file `Mentoma Landing.dc.html`
(project `9163ac56-…`) — cream surface `#fdfcfa`, navy ink `#0b1a2e`, mint
`#3ff2b8`, blue `#0a6cc0`, RTL Persian, Vazirmatn.

## Layout

Sixteen numbered sections in design order, each its own file
(`hero-section.tsx` → `cta-section.tsx`). Every section starts with
`SectionLabel` ("۰۱ · label" over a hairline) and uses the same
`max-w-[1180px] px-5 md:px-7` column. Tinted sections (`steps`, `domain`,
`students`, `samples`, `faq`) sit on `bg-lp-surface-2` with a `border-y`.

`LandingShell` is the shared chrome (sticky pill header, footer, mobile CTA
bar) and is also worn by `/pricing`, `/academies`, `/about`, `/contact`.

## Mockups

The product visuals are **drawn in CSS**, not screenshots — everything under
`mockups/`. Shared pieces: `MockFrame` (window chrome), `.lp-stripe`
(placeholder stripes; override `--lp-stripe-s/-a/-b` inline), `FlowRail`
(chip → chip rail), `CheckList` (✓ rows). Bar charts use `.lp-bar`; the
typing caret `.lp-caret`; the live dot `.lp-live`; the floating card
`.lp-float`. All four stop under `prefers-reduced-motion`.

Do not add photos, Lottie, or scroll-driven animation — the design has none.

## Copy

Every string lives in `messages/<section>.ts`; `landing.messages.ts` is the
barrel that exposes them as `LANDING.<section>` (also read by the FAQ JSON-LD
and the `/academies` page). No literal user-facing text in JSX.

## Tokens

All colours are `lp-` tokens in the `@theme` block of `globals.css`,
deliberately **not** bound to the academy `--theme-*` variables so a cached
tenant theme can never restyle the marketing page. Dark mode re-points the
same variables under `.lp-root[data-theme='dark']`; plain `bg-white` cards
are swept to a dark surface there, so use `bg-white` for cards, not a hex.

## Pricing

Prices and plan bullets come from the live `PublicPlan` rows; the catalog
copy in `messages/pricing.ts` is only the fallback when the API is down.
Quarterly = 3 × monthly × 0.95 floored to 500k (`pricing-math.ts`). The
compare table reads the live `limits`; rows without a live counterpart
(videos, templates) stay catalog values.

## Cascade-layer gotcha

`globals.css` styles all `a` inside `@layer base` with the _academy_ theme
colour. `.lp-root a { color: inherit }` (also in `@layer base`) neutralises it
here, and the `!important` white-link hack carries `:not(.lp-root a)`. If link
colours on this page ever go wrong, check those two first.
