"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import { useDebounce } from "@/lib/hooks/use-debounce";
import { useTranslation } from "@/lib/i18n/hooks";

interface CourseSearchProps {
  initialQuery?: string;
}

export function CourseSearch({ initialQuery = "" }: CourseSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [, startTransition] = useTransition();
  const isTypingRef = useRef(false);

  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (!isTypingRef.current) setQuery(initialQuery);
  }, [initialQuery]);

  const submit = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) params.set("q", value.trim());
    else params.delete("q");
    params.delete("page");
    startTransition(() => router.replace(`${pathname}?${params.toString()}`));
  };

  useEffect(() => {
    const current = searchParams.get("q") ?? "";
    if (debouncedQuery !== current) submit(debouncedQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit(query);
      }}
      className="mt-7 flex max-w-xl items-center gap-2.5 rounded-full border bg-(--cc-card) border-(--cc-bd) py-1.5 pe-1.5 ps-5 shadow-(--cc-sh-sm)"
    >
      <Search className="h-5 w-5 shrink-0 text-(--cc-ink-3)" />
      <input
        value={query}
        onChange={(e) => {
          isTypingRef.current = true;
          setQuery(e.target.value);
          setTimeout(() => {
            isTypingRef.current = false;
          }, 600);
        }}
        placeholder={t("courses.searchPlaceholder")}
        autoComplete="off"
        className="min-w-0 flex-1 bg-transparent! text-base text-(--cc-ink) outline-none placeholder:text-(--cc-ink-3)"
      />
      <button
        type="submit"
        className="shrink-0 rounded-full bg-(--cc-brand) px-[22px] py-[11px] text-sm font-extrabold text-(--theme-on-primary) transition-transform hover:scale-105"
      >
        {t("common.search")}
      </button>
    </form>
  );
}
