# Porting Prompt — Convert the Remaining Static Templates into Pixel-Perfect Presets

> Paste this whole file as the opening message of a **new chat**. It reproduces the
> exact pipeline already used to ship **template-1-flow** (preset id `flow`) so the
> remaining templates are done identically. **Do ONE template per session, end-to-end,
> then STOP for the user's visual sign-off before starting the next.**

---

## Role & Goal

Senior fullstack engineer in this monorepo (Next.js storefront `edusphere/`, NestJS
`Backend/`, admin `AdminPanel/`). Follow `CLAUDE.md`: strict TypeScript (no `any`),
minimal changes, theme-variable-driven styling, RTL/Persian-first
(`dir="rtl"`, `lang="fa"`, IRANYekan).

Convert each remaining static mockup in `edusphere/templates/template-N-*.html` into a
**pixel-perfect, production-ready preset** rendered through the existing block-catalog
system — NOT a live data page. All content (titles, instructors, ratings, stats,
testimonials, pricing) is **static seed data embedded in the components' defaults /
preset config, copied verbatim from the source HTML**. No fetch/API in preset
components. The preset is the gallery-preview representation and must render identically
regardless of backend state.

---

## ⭐ Reference implementation — STUDY THIS FIRST

Template-1-flow is already fully ported as preset **`flow`**. Read these before doing
anything; mimic them exactly:

- **Palette registry (per-preset light+dark):** `AdminPanel/lib/design-systems.ts`
  → `DESIGN_SYSTEMS.flow` + `buildThemePayload()`.
- **Preset (ordered blocks):** registered in BOTH
  `Backend/src/ui-template/templates/template-presets.ts` AND
  `edusphere/lib/template-presets.ts` (the two MUST stay identical).
- **Section components:** `edusphere/components/ui-blocks/`
  - `FlowHero` variant in `hero-block.tsx` (`style: "flow"`)
  - `flow-cards` + `flow-stats` variants in `features-block.tsx`
  - `flow` variant in `testimonials-block.tsx`
  - new block types `marquee-block.tsx`, `course-grid-block.tsx`,
    `pricing-block.tsx`, `cta-block.tsx`
  - all registered in `blocks-renderer.tsx`
- **Catalog labels:** `Backend/src/ui-template/section-catalog.ts` (`BLOCK_LABELS`).
- **Gallery thumbnail:** `AdminPanel/components/ui-template/template-preview.tsx`
  (`BLOCK_STYLE` map).

---

## How the per-preset palette actually works (do NOT invent a new field)

There is **no `designSystemBaseline` field**. The mechanism is:

1. `AdminPanel/lib/design-systems.ts` holds `DESIGN_SYSTEMS[presetId]` with **explicit
   light + dark** values: `primary`, `primaryDark`, `secondary`, `secondaryDark`,
   `accent`, `background`, `backgroundDark`, `surface`, plus `typography`,
   `shape.borderRadius`, `shape.shadow`, `darkMode`.
2. Applying a preset (`handleCardClick` in
   `AdminPanel/app/(protected)/settings/ui-template/page.tsx`) calls
   `buildThemePayload(ds)` → `apiClient.saveThemeDraft(...)` which **seeds the draft
   theme** from that palette. The preview iframe (preview token) renders the draft.
3. Backend `saveDraftThemeConfig` (`Backend/src/theme/theme.service.ts`) only **fills
   colors the caller did NOT send**, so an explicit baseline is never overwritten by
   primary-derived approximations. (This fix is already in place — keep it.)
4. Components read only `--theme-*` CSS vars; `buildThemeCssVariables`
   (`edusphere/lib/theme-apply.ts` + `Backend/src/theme/theme-css.util.ts`) resolves
   them and flips light/dark.

**Color format:** store palette values as **hex** in `DESIGN_SYSTEMS` (the theme
builder runs `hexContrast` hex-math, so `oklch()` would break it). Convert the source
`:root` `oklch(...)` values to hex with this node snippet:

```js
// node: prints the hex for an oklch(L% C H) source value. L as 0..1.
function oklchToSrgb(L, C, hDeg) {
  const h = (hDeg * Math.PI) / 180;
  const a = C * Math.cos(h), b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;
  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bl = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
  const f = (x) => {
    x = x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
    return Math.round(Math.min(1, Math.max(0, x)) * 255).toString(16).padStart(2, "0");
  };
  return "#" + f(r) + f(g) + f(bl);
}
// oklchToSrgb(0.68, 0.14, 168) === "#00b388"  (template-1 mint)
```

---

## Decisions already made by the user — apply to EVERY template

1. **Full explicit baseline.** Use the exact source light **and** dark values. Never
   single-primary derivation.
2. **One template per session, then sign-off.** Build it fully, verify, then STOP and
   ask the user to compare against screenshots before the next.
3. **Bespoke config-driven variant per section.** Existing generic variants
   hardcode their content and map palette roles differently, so in practice **each
   section needs its own faithful variant**. Reuse an existing variant ONLY when both
   its structure AND content model genuinely match. New section kinds → new block types.
4. **Screenshots for verification.** The user attaches labeled source PNGs (light+dark,
   full-page, e.g. `template-2-marketplace-light.png`). Ask for them; compare side by side.

---

## Per-template recipe (repeat exactly)

1. **Read the source HTML fully.** Capture the `:root` (light) and `[data-theme="dark"]`
   palette blocks; list the ordered body sections (nav, hero, promo/topbar, features,
   courses, stats, instructors, testimonials, pricing, cta, footer, …).
2. **Register the palette** in `AdminPanel/lib/design-systems.ts` as
   `DESIGN_SYSTEMS[<presetId>]` (hex; convert oklch). Map source role-vars consistently,
   e.g. brand→`primary`, dark-navy→`secondary`. Note: a "navy" value is used BOTH as
   text (→ `--theme-foreground`) and as dark section backgrounds (→ `--theme-secondary`
   with `--theme-on-secondary` text), and it **flips** in dark mode — design your role
   mapping so both light and dark render faithfully.
3. **Per section:** reuse a matching variant, else author a new config-driven variant
   (content from config with verbatim source defaults), styled ONLY via `--theme-*`.
   New section kinds → new block type: add to `blocks-renderer.tsx`, `BLOCK_LABELS`
   (`section-catalog.ts`), and the gallery `BLOCK_STYLE` thumbnail map.
4. **Embed seed content verbatim** (exact Persian strings + numerals).
5. **Register the preset** in BOTH `Backend/.../template-presets.ts` and
   `edusphere/lib/template-presets.ts` — identical ordered `blocks[]`.
6. **Light + dark** come only from theme-var flipping (the `_dark` baseline). No
   per-mode hardcoded colors in components.

---

## Hard constraints (gotchas already learned — don't re-trip them)

- **Zero fetch** in preset components. Static seed only.
- **`--theme-*` only.** `grep -nE '#[0-9a-fA-F]{3,6}|oklch|rgb\('` on new component
  files must return nothing except universal overlay colors (white/black text on
  gradients) and exact source box-shadows. Brand colors NEVER hardcoded.
- **Buttons:** primary CTAs must use a **plain `<button>`/`<Link>`** with
  `rounded-(--theme-border-radius)`. Do NOT use the shadcn `<Button>` for them — its base
  class is `rounded-full` and overrides the radius, so the radius customizer won't apply.
  Cards use `rounded-(--theme-border-radius)` (canonical parenthesis form).
- **Hero/banner image:** read `config.backgroundImage` (the customizer writes
  `backgroundImage`). Render an owner image when present, gradient otherwise.
- **Images default `null`.** Owner-uploadable slots only where required (course/
  instructor/testimonial avatars, hero photos). Gradient-only thumbnails stay CSS
  gradients **built from theme vars** (no image slot).
- **RTL/Persian preserved** exactly (arrows `←`, margin mirroring, IRANYekan, numerals).
- **TypeScript strict, no `any`.**
- **Don't break customization:** keep every color/radius/shadow on `--theme-*` so the
  live customizer applies. Don't add tokenless theme fetches (the live updater already
  forwards `?preview=`). The light/dark "both" toggle (`ThemeToggleButton`) already
  exists — new templates only need faithful `_dark` baselines.

---

## Known fidelity deltas — decide per template

- **Surface derivation:** `--theme-surface`/`card-bg` come from `color-mix`, so they may
  differ slightly from a source's exact `--white`/surface. If a template's cards must be
  exact, propose adding explicit `surface`/`border` baseline tokens to the theme builder.
- **"Featured" dark card inversion:** a card painted with `--theme-secondary` flips light
  in dark mode; if the source hand-overrides it to stay dark, special-case it.
- **Header/footer:** template-1 reuses the default header/footer components. If a
  template needs a pixel-exact nav/footer, author bespoke variants.

---

## Verification (run per template, before sign-off)

1. `cd Backend && npx tsc --noEmit` · `cd edusphere && npx tsc --noEmit` ·
   `cd AdminPanel && npx tsc --noEmit` → all zero errors.
2. `grep -nE '#[0-9a-fA-F]{3,6}|oklch|rgb\('` new component files → no brand literals.
3. Apply the preset in the UI-template gallery; compare the preview (light AND dark)
   against the user's source PNG: hero + one content grid + footer — no visible diff.
4. Spot-check 5 random seed values verbatim against the HTML.
5. Confirm no network requests fire during the preset render (devtools).
6. RTL check: text alignment, arrow direction, margin mirroring.
7. **STOP and ask the user to sign off** before the next template.

---

## Remaining templates (suggested order)

- **template-2-marketplace** ("بازار") — orange / dark `#1c1d1f` / purple; topbar promo
  bar, category grid, picsum thumbnails + avatars → owner image slots (default `null`).
- **template-3-elite**, **template-4-creative**, **template-5-artisan** — re-read each
  for exact `:root` + `[data-theme="dark"]` palettes; decompose and port.
- **template-6-code** ("کدیار") — preset `kodiyar` already exists as a layout but is NOT
  a faithful pixel port and its `DESIGN_SYSTEMS.kodiyar` palette needs the full source
  light/dark baseline (blue `#3b82f6` / green `#10b981`, full `--bg/--surface/--text`
  sets). Bring it up to template-1 fidelity.

**Start by telling the user which template you'll port, ask for its light+dark
screenshots, then follow the recipe. One template, then stop.**
