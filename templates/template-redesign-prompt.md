# Redesign Prompt — The Five Personal-Brand Teacher Templates

> Companion to `template-design-prompt.md`. That one authors a **new** vertical from
> scratch; this one **redesigns five templates that already ship**, so the output has to
> land back on an existing key, palette slot and section map.
>
> There is no mockup step: these templates already render, so they are redesigned in
> place, in code. Part A is the design brief, Part B the implementation contract, and
> both go to Claude Code together.
>
> **Per-template prompts live in `redesign/` — one self-contained file each. Use those
> to run a single template; use this file for the shared rules and Part B.**

## The five templates

All five are **personal-brand teacher** designs — one instructor selling their own
teaching — as opposed to the other fourteen, which are institution sites. They ship
under the gallery category `personal` (برند شخصی).

| Key         | Name   | Vertical                        | `AcademyField` | Signature                                                                  |
| ----------- | ------ | ------------------------------- | -------------- | -------------------------------------------------------------------------- |
| `rouzan`    | روزن   | Fullstack programming teacher   | `coding`       | Video-first hero in an editor window; near-white page, huge tight type     |
| `daneshvar` | دانشور | University teacher / faculty    | `general`      | Ruled paper, brass keyline, matted portrait plate, publications table      |
| `peleh`     | پله    | Konkur & highschool teacher     | `exam`         | Stair motif, oversized rank numerals as proof, exam countdown              |
| `andisheh`  | اندیشه | AI & DevOps mentor              | `coding`       | Dark terminal stage, deployment-pipeline rail, video-first demo frame      |
| `shaparak`  | شاپرک  | Programming for children (7–14) | `coding`       | Blobs, sticker cards with hard offset shadow, Scratch-style command blocks |

`AcademyField` is the classifier bucket in
`Backend/src/ui-template/templates/template-content.ts` (`ACADEMY_FIELDS =
language | exam | coding | arts | business | general`). It decides which template a new
academy is seeded with, via `presetCandidates` on each field. **Do not change a
template's field** — it is what keeps a kids-coding academy off the university design.

Two of them deliberately overlap an institution template on subject, and are separated
by _who the site is for_, not by topic. Keep that separation visible in the redesign:

- `nokhbeh` (نخبه) is a konkur **academy**; `peleh` is one konkur **teacher**.
- `parastoo` (پرستو) is a kids **academy**; `shaparak` is one kids-coding **teacher**.

## Stack

| Layer     | What it is                                                                                                                                                         |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Framework | Next.js 16 (App Router), React 19, **server components by default** — a template section only becomes `'use client'` if it genuinely needs state                   |
| Language  | TypeScript, `strict: true`. No `any`, no `as` casts to escape a type                                                                                               |
| Styling   | Tailwind CSS v4 (CSS-first `@theme` in `app/globals.css`, no `tailwind.config.js` colours) **+ one CSS Module per template** for decoration Tailwind can't express |
| Theming   | Runtime CSS custom properties (`--theme-*`) emitted per academy by `lib/theme-apply.ts`                                                                            |
| Direction | Persian (`fa`), **RTL**, IRANYekan                                                                                                                                 |
| Build     | lightningcss via Tailwind v4 — it silently drops rules it cannot parse                                                                                             |

---

# PART A — the design brief

Run **one template per chat**. Set `TEMPLATE` to a row from the table above and paste
everything from the line below to the end of Part A, together with Part B.

(For a single template, prefer the ready-made self-contained file in `redesign/`.)

---

You are a senior product designer. Redesign one page template for an academy platform.
The template already exists and ships; you are raising it, not replacing its purpose.

```
TEMPLATE: rouzan — روزن
FOR:      A fullstack programming teacher selling their own video courses
FIELD:    coding
KEEP:     Video-first hero framed as a code-editor window; near-white page; one vivid
          brand colour; huge tight display type; generous whitespace
AVOID:    Looking like the other four (see table) or like a generic SaaS landing page
```

### 0. What this template is for

A **single teacher's personal site**, not a school's. The visitor is deciding whether
to trust _this person_. That means: the intro video, the teacher's own voice in the
copy, proof of results, and a clear next step. It does **not** mean a faculty grid, a
campus photo, or an "about our institution" band.

The buyer of the platform is an academy manager, but the audience of _this page_ is the
teacher's prospective student (or, for `shaparak`, their parent — write to the parent).

### 1. Hard constraints — these are not style preferences

**Persian, RTL, and typography**

- Everything is Persian (`fa`) and right-to-left. Text right-aligned, mirrored spacing,
  arrows point `←`.
- **All displayed numbers use Persian numerals** (۰۱۲۳۴۵۶۷۸۹).
- **Never apply `letter-spacing` to Persian text.** It breaks letter joining and is the
  single most obvious "this was designed by someone who doesn't read Persian" tell.
- **Never set a monospace font on Persian text or Persian digits** — it breaks their
  shaping. Monospace is allowed only on latin tokens (a filename, a code chip); isolate
  them with `direction: ltr; unicode-bidi: isolate`.
- Use **logical properties only** (`inset-inline-start`, `margin-inline`, `padding-block`),
  never `left`/`right`. One exception: a media **play** glyph points right in RTL too —
  transport controls are not mirrored.
- ⚠️ Logical inset + physical `translate` is a trap: `inset-inline-start: 50%` with
  `translate: -50%` centres in LTR and throws the element **completely off-canvas** in
  RTL. Centre with `inset-inline: 0; margin-inline: auto;` instead.

**Colour**

- Every colour must come from a token. The final implementation has no hardcoded
  colours at all — a section is re-tinted by the academy's own palette at runtime, and
  a literal hex there is a bug.
- The whole design is driven by **three brand colours** plus neutrals: primary,
  secondary (the deep/ink colour), accent. Do not introduce a fourth brand hue.
- Design a **light and a dark state** for the palette. Both must look deliberate, not
  auto-inverted. (`andisheh` is the exception: it is dark by definition.)

**Images**

- Every image slot **defaults to empty** and stays that way for most academies. Design
  each one twice: with a photo, and with no photo. The no-photo state is the permanent
  state for most sites and must look finished, not like a loading skeleton.
- **Course cards have no photo slot, ever.** Their thumbnail is a flat theme-derived
  tint. Do not draw cover photos on course cards.
- The hero media frame can hold a **photo, a slideshow, or a video** — same frame, same
  ratio. For `rouzan` and `andisheh` the **video is the design**: draw the empty state
  with a play affordance, not a grey box.

**Motion**

- Motion is opt-in and decoration-only. Nothing a person reads may move.
- Two budgets: _ambient_ (18–30s loops, a few px or a few percent of opacity — felt, not
  seen) and _signal_ (2–3s, reserved for liveness and scarcity: a class running now, a
  nearly-full seat count).
- Everything must be correct with motion fully disabled (`prefers-reduced-motion`).

### 2. Anti-AI-look rules

- No purple/indigo gradient hero. No glassmorphism-as-the-whole-idea. No emoji as icons.
- No row of three identical centred cards with a circle icon on top.
- Not everything centred. Use asymmetry, real editorial alignment, and at least one
  intentionally off-grid element.
- Vary section rhythm — height, background tone, and density must differ. Never stack
  five identical padded white sections.
- Real copy: specific numbers, real prices in Toman, honest FAQ answers, actual
  durations. **Never** lorem ipsum or «عنوان اینجا».
- Include the details that make a site feel real: hover and focus states, a footer with
  four genuine column groups and a legal line, and at least one dense data area (a class
  schedule table, a syllabus accordion, a results table).

### 3. Design brief — write this before drawing anything (max 12 lines)

- **Reference feel:** two real-world design directions you are borrowing from (Swiss
  editorial print, 90s science textbook, terminal UI, a children's activity book,
  a printed course handout…). Not "modern and clean".
- **Type system:** display vs text usage, concrete sizes and weights. You have one font
  family, so hierarchy and scale carry the entire personality.
- **Palette:** the full token list with hex, light and dark. Colours that belong to this
  teacher's world — not default indigo.
- **Layout spine:** the grid, and the **one structural idea** that makes this template
  recognisable at a glance.

Each of the five must be unmistakable next to the others: different grid, different
navigation shape, different hero composition, different card style, different colour
temperature.

### 4. Sections — the home page maps one-to-one onto these

1. `header` — sticky bar, logo, nav, login + primary CTA
2. `hero` — the signature composition, including the media frame
3. `marquee` — a scrolling strip of topics or stats
4. `features` — why this teacher (differentiated, not three clone cards)
5. `courses` — 6–9 cards: title, level, duration, rating, Toman price. **Flat tinted
   thumbnail, no photo.**
6. `categories` — the browse / learning-path section
7. `showcase` — the dense data area
8. `teachers` — assistants, lab group, or support team
9. `cta` — closing conversion band
10. `footer` — four column groups, contact, legal line

### 5. How to work

1. One line: the teacher and their world (invented, but specific and Iranian).
2. The design brief from §3.
3. Rewrite `defaults.ts` and the hero, render it, and **stop for review**:
   `http://localhost:5000/preview/blocks?template=<key>&sample=1&only=hero`
4. On go-ahead: the remaining sections, then the whole page at `?template=<key>&sample=1`.
5. A closing note: the final palette token table (light + dark hex), which of the ten
   sections you used, what motion you added and where, and one paragraph on what makes
   this template unmistakable next to the other four.

Check the hero in all three media states — no media, a photo, a video. Scroll-reveal
holds sections at `opacity: 0` until they enter the viewport, so a full-page screenshot
looks blank below the fold; scroll first, or force `opacity: 1` before capturing.

---

# PART B — the implementation contract

Read this before writing code. It is what makes the redesign land in the template system
instead of becoming a one-off page.

## Where the code goes

```
edusphere/components/templates/<key>/
  index.tsx          # <KEY>_SECTIONS: TemplateSectionMap  +  <KEY>_COURSE_CARD
  hero.tsx           # usually the only fully bespoke section
  features.tsx
  categories.tsx
  defaults.ts        # ALL Persian copy lives here, `as const`
  <key>.module.css   # decoration only
```

**Every file stays under ~200 lines.** Reuse from `_shared/` instead of rewriting:
`header.tsx` (`TemplateTopBar`, `headerDefaults`, `FULL_NAV`), `footer.tsx`,
`courses.tsx`, `cta.tsx`, `teachers.tsx`, `marquee.tsx`, `data-table.tsx`,
`section.tsx` (`Container`, `SectionHead`), `primitives.tsx` (`Button`, `Card`, `Pill`).

## The three rules a section must satisfy

From the header comment of `Backend/src/ui-template/templates/template-presets.ts`:

1. **Every image field defaults to `null`.** Presets ship no placeholder art.
2. **Styling uses only `--theme-*` variables** — no hardcoded colours, px or rem for
   anything the theme owns. This is what lets a section keep working when a manager
   mixes it into a page built from a different template.
3. **Renders full-width with no cross-section assumptions.** Any section must be
   stackable above or below any other.

## Contracts to implement against

**Section props** — `_shared/types.ts`:

```ts
export interface TemplateSectionProps {
  id?: string;
  config?: SectionConfig; // Record<string, unknown>
  storeContext?: TemplateStoreContext; // { name, slug, isSubdomain, stats, editMode, … }
}
```

Read copy through the helpers, never directly, so a manager's edit always wins over the
default: `text(config, 'title', d.title)`, `list<T>(config, 'items', d.items)`,
`flag(config, key, fallback)`, `featureVisible(config, flagKey)`.

**Making copy editable on the canvas**

- A scalar field: `data-editable="title"`.
- A repeated field: spread `editableList('items', items)` on the container and
  `editableItem('items', index, 'title')` on each cell (`_shared/editable-list.ts`).
- An optional decoration: wrap it in `<RemovableSlot config flagKey="showStats"
editMode={storeContext?.editMode}>` so a manager can hide and restore it.
- An inline highlighted word: `<EditableAccent config>` — gives it a per-span colour picker.

**Hero media** — pick one, do not hand-roll a frame:

| Need                                       | Use                                                                                        |
| ------------------------------------------ | ------------------------------------------------------------------------------------------ |
| Video is the design (`rouzan`, `andisheh`) | `HeroVideoSlot` directly; ship `mediaRatio: '16:9'` on the preset's hero block             |
| Photo by default, video when chosen        | `HeroSlideshowSlot` — it swaps in `HeroVideoSlot` automatically when `heroVideoUrl` is set |
| One photo, possibly as a background        | `HeroVisualSlot` (`_shared/hero-media.tsx`)                                                |

All three share `resolveBoxStyle` (`_shared/hero-box.ts`), so the manager's ratio and
height controls work without extra wiring. Video config keys are fixed:
`heroVideoUrl`, `heroVideoPoster`, `heroVideoAutoplay`. Autoplay is always muted +
looping; when it is off, nothing but the poster loads.

**Backdrops** — `_shared/backdrop.tsx`. Compose these rather than writing new gradient
stacks: `<Backdrop variant="aurora|grain|grid|spotlight" tone="page|deep"
motion="drift|wash|hue" />` and `<GlowBand />`. `aurora` + `grain` is the modern
mesh look. `tone="deep"` adapts a layer to a dark ground.

**Motion tokens** — put `data-motion` on decorative layers only:
`drift` (24s float), `wash` (20s opacity breathe), `hue` (16s travelling gradient),
`parallax` (scroll-linked, for hero media), `live` / `signal` (2–3s, status only).

**Theme variables available**

```
--theme-primary  --theme-secondary  --theme-accent
--theme-background  --theme-foreground  --theme-muted
--theme-surface  --theme-surface-alt  --theme-card-bg
--theme-deep  --theme-on-deep          (the dark anchor band + its text)
--theme-on-primary  --theme-on-accent  --theme-primary-ink
--theme-primary-subtle  --theme-accent-subtle  --theme-secondary-subtle
--theme-border-color  --theme-border-strong  --theme-hairline
--theme-border-radius  --theme-shadow
--theme-section-padding-y  --theme-container-max-width
--theme-heading-size-sm/md/lg  --theme-font-family
```

Derive anything else with `color-mix(in srgb, var(--theme-primary) 30%, transparent)`.

## Traps that have already cost time here

- **`section h2` is force-sized.** `app/globals.css` sets `.ui-blocks-root section h2`
  to the theme heading scale at ≥768px, and it beats a utility class. Use `<h2>` only
  for real section headings; a small label must be a `<span>` or `<p>`.
- **Linked cards tint their headings.** A card wrapped in `<a>` inherits the global
  `a { color: primary }`, so the title turns brand-coloured. Pin it back with a module
  class setting `color: var(--theme-foreground)`.
- **lightningcss drops what it cannot parse** — notably `-webkit-mask-composite`, which
  removes the whole rule silently. Stick to standard `mask-*`. After building, grep the
  emitted CSS in `.next/static/chunks/*.css` for your distinctive declarations.
- **Scroll-reveal defeats screenshots.** Sections sit at `opacity: 0` until they enter
  the viewport, so a full-page capture looks blank below the fold. Scroll first, or force
  `opacity: 1` before capturing. This is not a bug in your design.
- **Course-card thumbnails are class names, not colours:** `CourseCardSpec.thumbTones`
  takes CSS-module classes that you define in the template's own module file.

## Registering the template

There is no enum; a key is a plain string, and **three registries must agree** or the
build fails:

1. `Backend/src/ui-template/templates/template-presets.ts` — `TEMPLATE_PRESETS[key]`:
   Persian `name`/`description`, the `theme` palette, `blocks: buildBlocks(key)`
   (pass a third argument to add hero config, e.g. `{ mediaRatio: '16:9' }`).
   Then reseed: `prisma/seed.ts` upserts every preset by key.
2. `edusphere/components/templates/registry-types.ts` — append to `TEMPLATE_KEYS`;
   `registry.ts` — register in `TEMPLATE_SECTIONS` and `TEMPLATE_COURSE_CARDS`.
3. `AdminPanel/constants/template-names.ts` — `TEMPLATE_KEYS`, `TEMPLATE_IDENTITY`
   (name / vertical / tagline, all Persian), `TEMPLATE_CATEGORY: 'personal'`;
   `AdminPanel/lib/design-systems.ts` — a `DESIGN_SYSTEMS[key]` entry whose `motion`
   **matches the preset's `element_animation_style`**.

If the field mapping changes, update `presetCandidates` in
`Backend/src/ui-template/templates/template-content.ts` — that list is what the
star-rating default-picker chooses between.

## Definition of done

- [ ] `npx tsc --noEmit` clean in `edusphere`, `AdminPanel` and `Backend`
- [ ] `npm run build` clean in `edusphere`, and the new CSS survives in the output
- [ ] Renders at `/preview/blocks?template=<key>&sample=1` with no console errors
- [ ] Switching the design system in the Style tab re-tints **every** section
- [ ] Hero media: empty, photo, and video states all look finished; ratio chips and the
      height slider drive the frame; autoplay is muted and looping
- [ ] Persian digits render correctly everywhere; no letter-spacing on Persian
- [ ] 390px with no horizontal scroll; `prefers-reduced-motion` stills all motion
- [ ] Every file under ~200 lines; no hardcoded colours outside the module's tokens
