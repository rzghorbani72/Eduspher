# Per-template redesign prompts

One self-contained prompt per template. Paste a whole file into a **fresh Claude Design
chat** to draw artboards first, or hand it straight to **Claude Code** to redesign the
template in place — each file works either way.

| File | Key | Name | Vertical | `AcademyField` |
|------|-----|------|----------|----------------|
| `rouzan.md` | `rouzan` | روزن | Fullstack programming teacher | `coding` |
| `daneshvar.md` | `daneshvar` | دانشور | University teacher / faculty | `general` |
| `peleh.md` | `peleh` | پله | Konkur & highschool teacher | `exam` |
| `andisheh.md` | `andisheh` | اندیشه | AI & DevOps mentor | `coding` |
| `shaparak.md` | `shaparak` | شاپرک | Programming for children (7–14) | `coding` |

All five are **personal-brand teacher** designs — one instructor selling their own
teaching — and ship under the gallery category `personal` (برند شخصی). That is what
separates them from the institution templates covering the same subjects: `nokhbeh` is a
konkur *academy* while `peleh` is one konkur *teacher*; `parastoo` is a kids *academy*
while `shaparak` is one kids-coding *teacher*.

`AcademyField` is the classifier bucket in
`Backend/src/ui-template/templates/template-content.ts`. It decides which template a new
academy is seeded with, through the `presetCandidates` list. **Do not change it** as part
of a visual redesign.

## Is the artboard step worth it?

An artboard is one screen drawn at a fixed width — a picture of the design, not running
code. It is worth drawing when you want to explore a genuinely new direction before
committing to implementation.

For these five it is optional, and often skippable: they already exist and render live at
`/preview/blocks?template=<key>&sample=1`, so you can iterate on the real thing and see
real Persian text, real RTL and the real theme system — none of which an artboard proves.

## After the design is agreed

Hand the result, plus `../template-redesign-prompt.md` (Part B — the implementation
contract), to Claude Code. That file carries the file layout, the section props contract,
the hero media slots, the backdrop and motion tokens, the full `--theme-*` list, the three
registries that must agree, and the traps that have already cost time in this repo.

## Related

- `../template-design-prompt.md` — authors a **brand-new** vertical from scratch.
- `../template-redesign-prompt.md` — the shared version of these five, plus Part B.
