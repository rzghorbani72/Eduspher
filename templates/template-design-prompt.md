# Design Prompt — Author a New Template Mockup in Claude Design

> Step 1 of the template pipeline. Produces a self-contained HTML mockup in the exact
> shape `template-porting-prompt-6.md` expects.
>
> ```
> Claude Design  → template-<N>-<slug>.html   (this file)
> Claude Code    → template-porting-prompt-*.md → preset + palette
> ```

## How to use it

1. Open **claude.ai → Claude Design**, a **new chat per template**.
2. Paste everything below the line, setting `TEMPLATE NUMBER` and `ALREADY USED`.
3. Review the home page first, then say "add the 4 secondary page views".
4. Save the download as `edusphere/templates/template-<N>-<slug>.html`.
5. Screenshot full-page in light and dark as `template-<slug>-{light,dark}.png` — the
   porting prompt requires both.
6. To ship it: copy `template-porting-prompt-6.md`, swap the source file, preset id and
   screenshot names, and run it in a fresh Claude Code chat.

**Existing verticals, do not repeat:** flow (general), marketplace, elite, creative,
artisan, code (programming). Shipped presets: `flow`, `code`, `creative`.

**This batch — run once per row, in a fresh chat each time:**

| #   | Vertical                                                                                                                                       | Slug        |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 7   | English language school                                                                                                                        | `english`   |
| 8   | High-school math & exam prep                                                                                                                   | `mathprep`  |
| 9   | Strength & fitness coaching                                                                                                                    | `workout`   |
| 10  | Astronomy & space science                                                                                                                      | `aerospace` |
| 11  | Chef / cooking academy                                                                                                                         | `cooking`   |
| 12  | Kids' fast mental-math academy (abacus / speed calculation) — **modern, playful direction, not the editorial/textbook feel of the other rows** | `kidsmath`  |

⚠️ **Backend generation gap — flag, don't block on it.** The AI-generate-a-template
flow (`Backend/src/ui-template/templates/template-content.ts`, `ACADEMY_FIELDS`) only
knows `language | exam | coding | arts | business | general`. `workout`, `aerospace`,
`cooking`, and `kidsmath` have no matching field yet. This doesn't affect the design
step below — these presets are hand-authored blocks, not AI-generated per-academy —
but whoever ports and wires these in later must add `FieldContent` entries for those
four, or the "generate my site" wizard will keep recommending the wrong preset for
those academies.

---

You are a senior product designer building a website template for an online academy
platform. Output **one** template per run, as a **single self-contained HTML file**.

```
TEMPLATE NUMBER: 7
VERTICAL: English language school (see table above — use the row matching TEMPLATE NUMBER)
ALREADY USED (do not repeat these verticals or visual directions): flow (general), marketplace, elite, creative, artisan, code (programming)
```

### 0. Non-negotiable technical shape

The file is a design mockup that will later be ported into a component system, so it
must follow this shape exactly:

- `<!doctype html><html lang="fa" dir="rtl" data-theme="light">` — **Persian, RTL**.
- Font: IRANYekan via `@font-face`, sources
  `https://cdn.sqp.ir/Plugins/fonts/IRANYekan/iran-yekan-{400,500,700}.woff2`,
  fallback `Tahoma, sans-serif`. Persian numerals in all displayed numbers.
- One `<style>` block. **All colors defined as CSS custom properties in `:root`**, then
  a complete `[data-theme="dark"]` override block. Never write a raw color inside a
  component rule — always `var(--token)`. This is how the port maps your palette onto
  `--theme-*` variables; a hardcoded color there is a bug.
- Palette must define, at minimum: brand/primary, a deep contrast color, muted text,
  border, page background, surface/card background — and the dark equivalent of each.
- Plain vanilla HTML + CSS. No Tailwind, no framework, no external JS libraries. A few
  lines of inline JS only for the theme toggle, the mobile nav, an accordion, and the
  page switcher.
- Include a working **light/dark toggle button** that flips `data-theme`. Both modes
  must look deliberately designed, not one auto-inverted from the other.
- No images from the internet. Use CSS gradients, shapes, and initials-in-a-circle for
  avatars. Where a real photo would go, leave a labelled placeholder block.
- Responsive: 1440 / 1024 / 390 breakpoints, no horizontal scroll at any width.
- RTL done properly: text right-aligned, mirrored margins/padding, arrows pointing `←`.

### 0b. How images actually work here — design both states, don't skip this

The platform draws a hard line between two kinds of image, and mixing them up is the
most common porting bug:

- **Course cards have NO image slot at all — ever.** `course-grid`/`courses` blocks
  render title/teacher/level/price only; the thumbnail is always a **theme-derived CSS
  gradient**, cycled per card from a fixed palette-based list
  (`edusphere/components/ui-blocks/course-grid-block.tsx`). There is no upload, no
  fallback-vs-real-photo branch — just design the gradient thumbnail well. **Do not
  draw course-card cover photos** in the mockup; it will not port to anything real.
- **Hero, features, header/footer, and slideshow DO have real, owner-uploadable image
  slots — and they default to `null`.** An academy owner may never upload anything, so
  every one of these sections must be designed **twice in your head** (only one needs
  to render in the HTML, but note both in your design brief): once as it looks with a
  gradient/pattern in place of the image, and once as it looks with a real photo. The
  gradient state is not a loading placeholder — for most academies it's the permanent
  state, so it must look finished, not "empty."
- Practical rule: any section you design around a large photograph must still look
  complete with that photograph removed and replaced with a themed gradient block. If
  it collapses without the photo, redesign it — that's the state most academies ship.

### 1. The vertical is assigned — invent the academy around it

Use the `VERTICAL` given above (do not pick a different one — it's fixed so the batch
covers 5 distinct worlds without collision).

State in 2 lines: the vertical, and the fictional Iranian academy — name, city, who it
teaches, what makes it different. Invent real-sounding Persian course titles, teacher
names, prices in Toman, durations, and ratings. **Never** use lorem ipsum or
"عنوان اینجا" placeholders.

### 2. Design brief — write this before any code (max 12 lines)

- **Reference feel:** 2 real-world design directions you are borrowing from (e.g.
  Swiss editorial print, 90s science textbook, Japanese bento grid, warm analog
  cookbook, brutalist zine, premium fitness magazine).
- **Type system:** display vs text usage, concrete sizes and weights. Type carries the
  personality — you only have one font family, so the hierarchy must do the work.
- **Palette:** the full token list with hex or oklch values, light **and** dark. Pick
  colors that belong to this vertical's world — not default indigo/violet.
- **Layout spine:** the grid, and the one structural idea that makes this template
  recognizable at a glance (sticky side rail, asymmetric 2-col hero, full-bleed bands,
  ticker strip, oversized numbered sections, editorial column rule…).

Each template must be **unmistakable** next to the others: different grid, different
navigation shape, different hero composition, different card style, different color
temperature.

### 3. Anti-AI-look rules (hard requirements)

- No purple/indigo gradient hero. No glassmorphism. No emoji used as icons.
- No row of three identical centered cards with a circle icon on top.
- Not everything centered — use asymmetry and real editorial alignment, plus at least
  one intentionally off-grid element.
- Vary section rhythm: sections must differ in height, background, and density. Never
  stack five identical padded white sections.
- Real copy: specific numbers, honest FAQ answers, actual prices and durations.
- Include the "real website" details: hover and focus states, breadcrumbs on inner
  pages, a footer with 4 real column groups and a legal line, and at least one dense
  data area (class schedule table, syllabus accordion, or price comparison).

### 4. Home page — section order

The home page is the part that becomes the actual template, so its sections must map
onto the platform's block types. Use this order, adapting the content to your vertical
(you may skip at most two, and you may add one vertical-specific section):

1. `header` — sticky nav, logo, links, login + primary CTA, theme toggle
2. `hero` — headline, subheadline, 2 CTAs, and a bespoke visual composition
3. `marquee` — scrolling strip of logos / topics / stats
4. `features` — why this academy (differentiated, not 3 clone cards)
5. `courses` / `course-grid` — 6–9 course cards: title, teacher, level, duration,
   rating, price in Toman. **Thumbnail is a themed CSS gradient only — no photo** (see
   §0b); vary the gradient angle/stops per card so the grid doesn't look monotonous.
6. `categories` or `projects` — a vertical-specific browse or showcase section
7. teachers / instructors band
8. `pricing` or `membership` — 3 plans in Toman, one highlighted
9. `cta` — closing conversion band
10. `footer` — 4 column groups, contact info, socials, legal line

### 5. The four secondary pages

After the home page is approved, add the other four as **additional page views in the
same file**, switched by a small top bar of buttons (`data-page="home|courses|course|
about|contact"`, JS toggles `display`). They reuse the same nav, footer, and palette:

- **Courses** — filter rail (level, format, price, duration), result count, sort
  control, 9+ cards (same gradient-only thumbnail rule as §4.5), and an empty state.
- **Single course** — hero with price + enrol CTA (gradient/pattern banner, no cover
  photo — the `Course` model has no cover image field), sticky enrol panel, syllabus
  accordion with real module titles, instructor block, what-you-get list, FAQ, related
  courses.
- **About us** — founding story with dates, team grid with real bios, a numbers band,
  values written as sentences not buzzwords, location.
- **Contact us** — validated form (name, phone, email, topic, message) with success and
  error states, contact details, opening hours, a map placeholder, department routing.

These four exist so the palette and chrome can be checked against real page density.
They are reference views, not part of the template's block list.

### 6. Output order

1. Vertical + academy one-liner
2. Design brief
3. The HTML file with **home page only** — then stop for my review
4. On my go-ahead: the same file extended with the four secondary page views
5. A closing note: the section→block mapping (which of the 10 sections above you used),
   the final palette token table (light + dark hex), and one paragraph on what makes
   this template different from a generic AI-generated site

---

## Checks before porting

- Open the HTML: toggle light/dark, resize to 390px, tab through for focus rings,
  confirm RTL alignment and Persian numerals.
- Scan component rules for stray hex literals — any color defined outside `:root` /
  `[data-theme="dark"]` will break the port.
- Compare the section list against `edusphere/components/ui-blocks/blocks-renderer.tsx`.
  A section that maps to no existing block type means a new block file plus registration
  in `blocks-renderer.tsx`, `BLOCK_LABELS` (`Backend/src/ui-template/section-catalog.ts`),
  `SECTION_SCHEMAS` (`AdminPanel/components/ui-template/section-schema.ts`), and the
  `BLOCK_STYLE` map (`AdminPanel/components/ui-template/template-preview.tsx`).
- **Image-slot check (§0b):** every hero/features/header/footer/slideshow section that
  shows a photo must still look complete with `config.<imageField>: null` — that is the
  real default (`template-content.ts:1-6`, "images default `null`"). Course/course-grid
  cards must have **zero** photo elements — `deriveImageSlots()`
  (`Backend/src/ui-template/section-catalog.ts`) returns no slots for `courses`, so a
  photo there has nothing to bind to and the port would have to invent new plumbing.
- **What actually gets persisted:** porting this preset writes its `blocks[]` (with your
  `null` image defaults) into `TEMPLATE_PRESETS` in both
  `Backend/src/ui-template/templates/template-presets.ts` and
  `edusphere/lib/template-presets.ts`, plus a `DESIGN_SYSTEMS[<id>]` palette entry in
  `AdminPanel/lib/design-systems.ts`. Nothing about the mockup's course/instructor
  _content_ is stored per-academy — an owner who adopts this preset gets your
  seed copy until they edit it in the customizer; their real `Course` rows never
  populate these cards automatically.
