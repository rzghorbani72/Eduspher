/** Empty slot in the template editor — click selects it so the panel offers block types. */
export function PlaceholderSection() {
  return (
    <div className="flex min-h-[min(28vh,220px)] flex-col items-center justify-center gap-2 border-2 border-dashed border-zinc-400/70 bg-zinc-100/80 px-6 py-10 text-center">
      <span className="text-2xl leading-none text-zinc-400" aria-hidden="true">
        +
      </span>
      <p className="text-sm font-semibold text-zinc-600">انتخاب نوع بخش</p>
      <p className="max-w-[36ch] text-xs leading-relaxed text-zinc-500">
        برای افزودن بنر، اسلایدشو، دوره‌ها و سایر بخش‌ها اینجا کلیک کنید
      </p>
    </div>
  );
}

// `<template>` content in preview/blocks/page.tsx must be set via innerHTML
// (template children live in a detached fragment, so React can never hydrate
// them there — see the comment at that call site). `react-dom/server` can't be
// imported from that file because it's a Server Component (the RSC condition
// has no `react-dom/server` export), so this static markup is kept as a plain
// string instead. PlaceholderSection has no props, so keep this in sync by hand
// whenever the JSX above changes.
export const PLACEHOLDER_SECTION_HTML = `<div class="flex min-h-[min(28vh,220px)] flex-col items-center justify-center gap-2 border-2 border-dashed border-zinc-400/70 bg-zinc-100/80 px-6 py-10 text-center"><span class="text-2xl leading-none text-zinc-400" aria-hidden="true">+</span><p class="text-sm font-semibold text-zinc-600">انتخاب نوع بخش</p><p class="max-w-[36ch] text-xs leading-relaxed text-zinc-500">برای افزودن بنر، اسلایدشو، دوره‌ها و سایر بخش‌ها اینجا کلیک کنید</p></div>`;
