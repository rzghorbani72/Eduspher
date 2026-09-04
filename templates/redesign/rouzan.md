# Redesign Prompt — `rouzan` (روزن)

> One of five **personal-brand teacher** templates: a single instructor selling their own
> teaching, as opposed to the fourteen institution templates. Self-contained — paste
> everything below the line into a fresh Claude Design chat, or hand it straight to
> Claude Code to redesign in place.
>
> **Stack:** Next.js 16 App Router · React 19 (server components by default) ·
> TypeScript strict · Tailwind v4 (CSS-first `@theme`) + one CSS Module per template ·
> runtime `--theme-*` custom properties · Persian / RTL / IRANYekan · lightningcss.

---

You are a senior product designer. Redesign one page template for an academy platform.
The template already ships; you are raising it, not replacing its purpose.

```
TEMPLATE: rouzan — روزن
FOR:      A fullstack programming teacher selling their own video courses
FIELD:    coding      (do not change — it decides which academies get seeded with this)
CATEGORY: personal    (برند شخصی)
PALETTE:  primary #4f46e5 · secondary #0b0b12 · accent #06b6d4 · background #fbfbfd
          rounded corners · subtle shadow · subtle motion
```

**Keep — this is what makes it this template:**

- **The video is the design.** The hero's centrepiece is a wide 16:9 intro reel framed
  as a **code-editor window** — traffic-light dots, a filename tab. With no video chosen
  it still reads as finished: a framed play affordance, never a grey box.
- Near-white page, one vivid indigo, enormous tight display type, generous whitespace.
- Courses as **clean ruled rows** with level and duration — not a card wall.
- The learning path as a **single vertical rule with three stops**, so it says "do these
  in this order" rather than "pick one".

**Push further:**

- Make the editor window convincing: a real tab bar, a line gutter, a status strip. It
  is the one piece of chrome on the whole page, so it has to earn its place.
- The whitespace is the design. Resist filling it — if a section feels empty, cut copy
  rather than adding decoration.
- Type does all the work: you have one family, so the jump between display and body must
  be dramatic and consistent.

**Reference feel:** Mosh Hamedani and Josh Comeau's personal course sites; Swiss poster typography; Stripe's documentation type scale.

**Avoid:** Looking like a SaaS marketing landing page, or like `andisheh` (the other coding template — that one is dark and technical, this one is bright and editorial).

### 0. What this template is for

A **single teacher's personal site**, not a school's. The visitor is deciding whether to
trust *this person*. That means the intro video, the teacher's own voice in the copy,
proof of results, and one clear next step. It does **not** mean a faculty grid, a campus
photo, or an "about our institution" band.

### 1. Hard constraints — not style preferences

**Persian, RTL, typography**

- Everything is Persian (`fa`), right-to-left. Text right-aligned, mirrored spacing,
  arrows point `←`.
- **All displayed numbers use Persian numerals** (۰۱۲۳۴۵۶۷۸۹).
- **Never apply `letter-spacing` to Persian text.** It breaks letter joining — the
  clearest sign the design was made by someone who does not read Persian.
- **Never set a monospace font on Persian text or digits** — it breaks their shaping.
  Monospace is for latin tokens only (a filename, a code chip); isolate those with
  `direction: ltr; unicode-bidi: isolate`.
- **Logical properties only** (`inset-inline-start`, `margin-inline`, `padding-block`),
  never `left`/`right`. One exception: a media **play** glyph points right in RTL too —
  transport controls are not mirrored.
- ⚠️ Logical inset + physical `translate` is a trap: `inset-inline-start: 50%` with
  `translate: -50%` centres in LTR and throws the element **completely off-canvas** in
  RTL. Centre with `inset-inline: 0; margin-inline: auto;`.

**Colour**

- Every colour comes from a token. The shipped implementation has no hardcoded colours
  at all — sections are re-tinted by each academy's own palette at runtime, so a literal
  hex is a bug.
- Three brand colours plus neutrals: primary, secondary (the deep/ink colour), accent.
  Do not add a fourth brand hue.
- Design a light **and** a dark state. Both deliberate, neither auto-inverted.

**Images**

- Every image slot **defaults to empty** and stays that way for most academies. Design
  each one twice — with a photo and without. The no-photo state is permanent for most
  sites and must look finished, not like a loading skeleton.
- **Course cards have no photo slot, ever.** Their thumbnail is a flat theme-derived
  tint. Do not draw cover photos on course cards.
- The hero media frame holds a photo, a slideshow, or a video in the same frame at the
  same ratio.

**Motion**

- Opt-in and decoration-only. Nothing a person reads may move.
- Two budgets: *ambient* (18–30s loops, a few px or a few percent of opacity — felt, not
  seen) and *signal* (2–3s, reserved for liveness and scarcity: a class running now, a
  nearly-full seat count).
- Everything must still read correctly with motion fully disabled.

### 2. Anti-AI-look rules

- No purple/indigo gradient hero. No glassmorphism as the whole idea. No emoji as icons.
- No row of three identical centred cards with a circle icon on top.
- Not everything centred — use asymmetry, real editorial alignment, and at least one
  intentionally off-grid element.
- Vary section rhythm: height, background tone and density must differ. Never stack five
  identical padded white sections.
- Real copy: specific numbers, real Toman prices, honest FAQ answers, actual durations.
  **Never** lorem ipsum or «عنوان اینجا».
- Include what makes a site feel real: hover and focus states, a footer with four genuine
  column groups and a legal line, and one dense data area.

### 3. Design brief — write this before drawing anything (max 12 lines)

- **Reference feel:** two real-world directions you are borrowing from. Not "modern and
  clean".
- **Type system:** display vs text usage, concrete sizes and weights. One font family, so
  hierarchy and scale carry the entire personality.
- **Palette:** the full token list with hex, light and dark, starting from the values
  above — adjust them if you can justify it, but stay in this colour world.
- **Layout spine:** the grid, and the **one structural idea** that makes this template
  recognisable at a glance.

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

### 5. If you are drawing artboards (Claude Design)

An artboard is one screen drawn at a fixed width. Produce four:

1. **Home page, 1440px** — the full section order above.
2. **Hero, three states side by side** — no media, a photo, a video playing. This is the
   state most often got wrong in implementation.
3. **Dark palette** — the hero plus one mid-page section.
4. **390px mobile** — hero through the courses grid, no horizontal scroll.

### 6. Output order

1. One line: the teacher and their world — invented, but specific and Iranian.
2. The design brief from §3.
3. The home page — then stop for review.
4. On go-ahead: the remaining views.
5. A closing note: final palette token table (light + dark hex), which of the ten
   sections you used, what motion you intend and where, and one paragraph on what makes
   this template unmistakable next to the other four.

### 7. Then implement it

Hand the approved design, plus
`edusphere/templates/template-redesign-prompt.md` (Part B — the implementation
contract), to Claude Code. That file carries the file layout, the section props
contract, the media slots, the backdrop and motion tokens, the `--theme-*` list, the
three registries that must agree, and the traps that have already cost time here.
