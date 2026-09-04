# Prompt — One New Template Home Page (Claude Design)

> Small, single-run version of `template-design-prompt.md`: **one page**, not a full
> mockup with secondary views. Paste everything below the line into a fresh Claude
> Design chat, fill in `VERTICAL`, and go.

```
VERTICAL: <e.g. "photography academy" — pick something not already covered below>
ALREADY USED, do not repeat the vertical or its visual direction: flow (general),
marketplace, elite, creative, artisan, code (programming), english, mathprep, workout,
aerospace, cooking, kidsmath
```

You are a senior product designer — the kind whose portfolio gets studied, not an AI
asked to "make a landing page." Design **one home page** for a fictional Iranian online
academy in the vertical above. It must look hand-crafted by someone who thought hard
about this specific business, not generated from a template library.

**Technical shape — non-negotiable, this gets ported into a component system:**

- `<!doctype html><html lang="fa" dir="rtl" data-theme="light">`. Persian text, RTL
  layout (mirrored spacing, arrows `←`), Persian numerals everywhere.
- Font: IRANYekan via `@font-face`
  (`https://cdn.sqp.ir/Plugins/fonts/IRANYekan/iran-yekan-{400,500,700}.woff2`),
  fallback `Tahoma, sans-serif`.
- One `<style>` block. **Every color is a CSS variable in `:root`**, plus a full
  `[data-theme="dark"]` override — never a raw hex inside a component rule. Include a
  working light/dark toggle; both modes must look deliberately designed.
- Plain HTML + CSS, no framework. A little inline JS only for the toggle, mobile nav,
  and any accordion.
- No internet images — CSS gradients, shapes, and initials-in-a-circle avatars. Where a
  real photo would go, leave a labelled placeholder block, and make sure the section
  still looks finished without it (most academies never upload one).
- **Course cards never get a photo slot** — thumbnail is always a themed CSS gradient,
  varied per card. Don't draw cover photos on course cards; it won't port to anything.
- Responsive at 1440 / 1024 / 390, no horizontal scroll.

**Design brief, before any code (max 8 lines):** two real-world references you're
borrowing from (not "modern and clean"); the type system (display vs. body, concrete
sizes/weights — you have one font family, hierarchy does the work); the full palette
(hex, light + dark) in colors that belong to this vertical, not default indigo/violet;
and the one structural idea that makes this page recognizable at a glance.

**Rules against the generic AI look:**

- No purple/indigo gradient hero, no glassmorphism, no emoji-as-icons.
- No row of three identical centered cards with a circle icon on top.
- Not everything centered — real asymmetry, at least one intentionally off-grid element.
- Sections must differ in height, background, and density — never five identical padded
  white blocks in a row.
- Real, specific copy: actual Persian course titles, teacher names, Toman prices,
  durations, ratings. Never lorem ipsum or «عنوان اینجا».
- Include real hover/focus states and at least one dense data area (schedule, syllabus
  accordion, or price table).

**Section order** (skip at most one, add at most one vertical-specific section):
`header` (sticky nav + CTA + theme toggle) → `hero` (headline, subheadline, 2 CTAs,
bespoke visual) → `marquee` (scrolling stats/topics) → `features` (why this academy,
not 3 clone cards) → `courses` (6–9 cards, gradient thumbnails only) →
`categories`/`showcase` (vertical-specific) → teachers → `pricing`/`membership`
(3 plans, one highlighted) → `cta` → `footer` (4 real column groups + legal line).

**Output:** one line naming the academy, the design brief, then the single
self-contained HTML file.

---

To ship it into the codebase afterward, use `template-porting-prompt-6.md` (swap the
source file and preset id) or hand it with `../template-redesign-prompt.md` Part B to
Claude Code.
