# Redesign Prompt — `shaparak` (شاپرک)

> One of five **personal-brand teacher** templates: a single instructor selling their own
> teaching, as opposed to the fourteen institution templates. Self-contained — paste
> everything below the line into a fresh Claude Code chat. The template already exists
> and renders, so it is redesigned in place, in code; there is no mockup step.
>
> **Stack:** Next.js 16 App Router · React 19 (server components by default) ·
> TypeScript strict · Tailwind v4 (CSS-first `@theme`) + one CSS Module per template ·
> runtime `--theme-*` custom properties · Persian / RTL / IRANYekan · lightningcss.

---

You are a senior product designer. Redesign one page template for an academy platform.
The template already ships; you are raising it, not replacing its purpose.

```
TEMPLATE: shaparak — شاپرک
FOR:      One teacher running small coding & robotics classes for children aged 7–14
FIELD:    coding      (do not change — it decides which academies get seeded with this)
CATEGORY: personal    (برند شخصی)
PALETTE:  primary #7c3aed · secondary #0f172a · accent #f97316 · background #fffdf7
          rounded corners · medium shadow · moderate motion
```

**Keep — this is what makes it this template:**

- **Write to the parent, not the child.** The parent reads and pays. The page should be
  playful to look at and reassuring to read.
- Soft **blobs** and **sticker cards** with a hard offset shadow (not a soft blur) —
  nothing on the page is a plain rectangle.
- A stack of **Scratch-style command blocks** showing the child's first program, each
  block notched and stepped further in than the last. This shows a parent exactly what
  their child will do in session one — far better than a paragraph about
  "computational thinking".
- **Age-group cards** where the age leads, because "which one is my child?" is the
  parent's first question.

**Push further:**

- The reassurance signals matter as much as the play: small class size, monthly progress
  report, vetted instructors, free trial session. Give them real weight.
- The command blocks should read as genuinely runnable, with real Persian block labels —
  not decorative coloured bars.
- Playful must not become childish-for-adults. The parent should feel this teacher is
  organised.

**Reference feel:** A children's activity book; Scratch and Lego packaging; a well-designed school report card.

**Avoid:** Looking like `parastoo` (پرستو), the general kids **academy** template. That is a school; this is one teacher with a named class, a mascot and a trial lesson. Also: no rainbow gradients, no comic-sans-adjacent type, no clip-art.

### 0. What this template is for

A **single teacher's personal site**, not a school's. The visitor is deciding whether to
trust _this person_. That means the intro video, the teacher's own voice in the copy,
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
- Two budgets: _ambient_ (18–30s loops, a few px or a few percent of opacity — felt, not
  seen) and _signal_ (2–3s, reserved for liveness and scarcity: a class running now, a
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

### 5. How to work

The template already exists and renders. Redesign it **in place**, in code — there is no
mockup step.

1. One line: the teacher and their world — invented, but specific and Iranian.
2. The design brief from §3.
3. Rewrite `defaults.ts` (all Persian copy) and the hero — `hero.tsx` plus the template's
   CSS module. Render it and **stop for review**:
   `http://localhost:5000/preview/blocks?template=<key>&sample=1&only=hero`
4. On go-ahead: the remaining sections, then the whole page at
   `?template=<key>&sample=1`.
5. A closing note: the final palette token table (light + dark), which of the ten
   sections you used, what motion you added and where, and one paragraph on what makes
   this template unmistakable next to the other four.

Check the hero in all three media states — no media, a photo, a video — because that is
the state most often got wrong. Check 390px for horizontal scroll, and confirm Persian
digits render correctly.

> Scroll-reveal will make a full-page screenshot look blank below the fold: sections sit
> at `opacity: 0` until they enter the viewport. Scroll first, or force `opacity: 1`
> before capturing. That is not a bug in your design.

### 6. The implementation contract

Read `edusphere/templates/template-redesign-prompt.md` (**Part B**) before writing code.
It carries the file layout, the section props contract, how copy is made canvas-editable,
which hero media slot to use, the backdrop and motion tokens, the full `--theme-*` list,
the three registries that must agree, and the traps that have already cost time in this
repo.

Two of those are worth repeating here, because they are invisible until they bite:

- **`section h2` is force-sized.** `app/globals.css` sets `.ui-blocks-root section h2` to
  the theme heading scale at ≥768px and it beats a utility class. Use `<h2>` only for real
  section headings; a small label must be a `<span>` or `<p>`.
- **Linked cards tint their own headings.** A card wrapped in `<a>` inherits the global
  `a { color: primary }`. Pin the title back with a module class setting
  `color: var(--theme-foreground)`.

### 7. Definition of done

- [ ] `npx tsc --noEmit` clean in `edusphere`, and `npm run build` clean
- [ ] Renders with no console errors; every section re-tints when the design system changes
- [ ] Hero looks finished with no media, with a photo, and with a video
- [ ] Persian digits correct; no `letter-spacing` and no monospace on Persian
- [ ] 390px with no horizontal scroll; motion stills under `prefers-reduced-motion`
- [ ] Every file under ~200 lines; no hardcoded colours
