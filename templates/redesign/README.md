# Per-template redesign prompts

One self-contained prompt per template. Paste a whole file into a **fresh Claude Code
chat**. Each template already exists and renders, so it is redesigned **in place, in
code** — there is no mockup step.

| File           | Key         | Name   | Vertical                        | `AcademyField` |
| -------------- | ----------- | ------ | ------------------------------- | -------------- |
| `rouzan.md`    | `rouzan`    | روزن   | Fullstack programming teacher   | `coding`       |
| `daneshvar.md` | `daneshvar` | دانشور | University teacher / faculty    | `general`      |
| `peleh.md`     | `peleh`     | پله    | Konkur & highschool teacher     | `exam`         |
| `andisheh.md`  | `andisheh`  | اندیشه | AI & DevOps mentor              | `coding`       |
| `shaparak.md`  | `shaparak`  | شاپرک  | Programming for children (7–14) | `coding`       |

All five are **personal-brand teacher** designs — one instructor selling their own
teaching — and ship under the gallery category `personal` (برند شخصی). That is what
separates them from the institution templates covering the same subjects: `nokhbeh` is a
konkur _academy_ while `peleh` is one konkur _teacher_; `parastoo` is a kids _academy_
while `shaparak` is one kids-coding _teacher_.

`AcademyField` is the classifier bucket in
`Backend/src/ui-template/templates/template-content.ts`. It decides which template a new
academy is seeded with, through the `presetCandidates` list. **Do not change it** as part
of a visual redesign.

## Seeing the work

Every template renders live, so iterate on the real thing rather than on a picture of it —
only the real page shows real Persian text, real RTL and the real theme system:

```
http://localhost:5000/preview/blocks?template=<key>&sample=1            # whole page
http://localhost:5000/preview/blocks?template=<key>&sample=1&only=hero  # one section
```

## The implementation contract

Each prompt points at `../template-redesign-prompt.md` (**Part B**) for the code rules:
file layout, the section props contract, how copy is made canvas-editable, the hero media
slots, the backdrop and motion tokens, the full `--theme-*` list, the three registries
that must agree, and the traps that have already cost time in this repo.

## Related

- `../template-design-prompt.md` — authors a **brand-new** vertical from scratch.
- `../template-redesign-prompt.md` — the shared version of these five, plus Part B.
