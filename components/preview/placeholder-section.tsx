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
