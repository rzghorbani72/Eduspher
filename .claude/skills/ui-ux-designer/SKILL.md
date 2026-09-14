---
name: ui-ux-designer
description: Use for UX flow decisions on the public site -- checkout, enrollment, empty/loading/error states, an academy's storefront layout -- or asked "is this usable". Visual pixel-fidelity -- use pixel-perfect-design-implement. Copy/conversion strategy -- use seo-marketing-expert.
---

# UI/UX Designer — edusphere

## Who uses this

Two very different audiences share this codebase: (1) a **prospective student or their parent** browsing an academy's storefront and enrolling/paying — low patience, often first visit, must trust the checkout; (2) a **manager evaluating Mentoma** on the platform marketing pages — see `seo-marketing-expert` for how that copy should read. Design the storefront for a stranger who has never seen this brand before, every time — academy sites are white-label, so "look professional and trustworthy" carries more UX weight here than on an internal dashboard.

## States checklist

Same discipline as AdminPanel: explicit loading, empty (a course list with zero items still needs a real empty state, not a blank grid), error, and — specific to this app — **academy-not-found** (unknown subdomain) and **legal-consent-required** (`LegalConsentRequiredError`) states are first-class, not edge cases to bolt on later.

## Checkout and payment — highest-stakes flow in this repo

Every step shows exact amounts, currency, and what happens next. No silent failure between "pay" and a confirmed status — a payment can be PENDING, PAID, or FAILED and the UI must show which, never guess. Double-submit protection (disable the button, not just visually) matters more here than anywhere else in the product — this is Pillar 3 territory even though the money logic lives in the Backend.

## White-label consistency

An academy's storefront must look like *their* brand, not Mentoma's. Never bleed a Mentoma-specific color, logo, or copy string into a template component — it should come from the academy's theme (`lib/theme-apply.ts`) and template choice. When building a new `ui-blocks/*` component, make sure it degrades sensibly with no theme customization (a manager who hasn't touched their theme yet still gets something presentable).

## RTL and Persian details

Same rules as AdminPanel (see that repo's `ui-ux-designer` skill): logical CSS, no `font-mono` on Persian numerals, shared number formatter, never a raw id shown to a visitor.

## Empty-container robustness

A hero/features/course-grid block with a fixed layout (e.g. a 4-card hero slot) must not visually break when an academy has fewer courses/items than the slot expects — this bit the product before (memory-documented pattern in `docs/ui/`). Check `docs/ui/ui-template-architecture.md` before adding a new block that assumes a fixed content count.

## When reviewing a UI change

Ask: does it work with zero content (new academy, no courses yet); does it stay on-brand for an arbitrary academy's theme; is checkout/payment state always explicit; is it RTL-correct. Pixel-fidelity to a design file is `pixel-perfect-design-implement`'s job.
