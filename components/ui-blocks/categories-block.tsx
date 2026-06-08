interface CategoryPill {
  icon: string;
  label: string;
}

interface CategoriesBlockProps {
  id?: string;
  config?: {
    label?: string;
    categories?: CategoryPill[];
  };
}

const DEFAULT_CATEGORIES: CategoryPill[] = [
  { icon: "🎨", label: "تصویرسازی" },
  { icon: "🖥", label: "طراحی گرافیک" },
  { icon: "✏️", label: "نقاشی" },
  { icon: "📸", label: "عکاسی" },
  { icon: "🎬", label: "فیلم و ویدیو" },
  { icon: "🎵", label: "موسیقی" },
  { icon: "💼", label: "فریلنسری" },
  { icon: "📱", label: "UI/UX" },
  { icon: "✍️", label: "نوشتن" },
  { icon: "🤖", label: "هوش مصنوعی" },
];

export function CategoriesBlock({ id, config }: CategoriesBlockProps) {
  const label = config?.label || "جستجو بر اساس دسته‌بندی";
  const categories = config?.categories?.length ? config.categories : DEFAULT_CATEGORIES;

  return (
    <section id={id || "categories"} className="border-b-2 border-(--theme-border-color) bg-(--theme-surface)">
      <div className="px-[40px] pt-[16px] text-[12px] font-extrabold text-(--theme-muted)">{label}</div>
      <div className="overflow-x-auto pb-[20px] pt-[12px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max gap-[12px] px-[40px]">
          {categories.map((cat, i) => (
            <div
              key={i}
              className={
                i === 0
                  ? "flex min-w-[100px] cursor-pointer flex-col items-center gap-[8px] rounded-[16px] border-2 border-(--theme-primary) bg-(--theme-primary-subtle) px-[20px] py-[16px] transition-all"
                  : "flex min-w-[100px] cursor-pointer flex-col items-center gap-[8px] rounded-[16px] border-2 border-(--theme-border-color) bg-(--theme-surface) px-[20px] py-[16px] transition-all hover:-translate-y-0.5 hover:border-(--theme-primary)"
              }
            >
              <div className="text-[28px]">{cat.icon}</div>
              <div className="whitespace-nowrap text-[12px] font-extrabold text-(--theme-foreground)">{cat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
