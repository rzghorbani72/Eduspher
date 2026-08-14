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

---

You are a senior product designer building a website template for an online academy
platform. Output **one** template per run, as a **single self-contained HTML file**.

```
TEMPLATE NUMBER: 1
ALREADY USED (do not repeat these verticals or visual directions): none
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

### 1. Pick the vertical yourself

Choose one online-teaching vertical clearly different from everything in
`ALREADY USED`. The space: English language school · high-school math & exam prep ·
chef / cooking academy · strength & fitness coaching · astronomy & space science ·
software development · music school · photography · medical exam prep · design school.

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
- Real copy: specific numbers, testimonials with full Persian names and cities, honest
  FAQ answers, actual prices and durations.
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
   rating, price in Toman
6. `categories` or `projects` — a vertical-specific browse or showcase section
7. teachers / instructors band
8. `testimonials` — student results with names, cities, and concrete outcomes
9. `pricing` or `membership` — 3 plans in Toman, one highlighted
10. `cta` — closing conversion band
11. `footer` — 4 column groups, contact info, socials, legal line

### 5. The four secondary pages

After the home page is approved, add the other four as **additional page views in the
same file**, switched by a small top bar of buttons (`data-page="home|courses|course|
about|contact"`, JS toggles `display`). They reuse the same nav, footer, and palette:

- **Courses** — filter rail (level, format, price, duration), result count, sort
  control, 9+ cards, and an empty state.
- **Single course** — hero with price + enrol CTA, sticky enrol panel, syllabus
  accordion with real module titles, instructor block, what-you-get list, reviews, FAQ,
  related courses.
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
5. A closing note: the section→block mapping (which of the 11 sections above you used),
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
