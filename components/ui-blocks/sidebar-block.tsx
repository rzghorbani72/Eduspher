"use client";

import { useState } from "react";
import { buildAcademyPath } from "@/lib/utils";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ChevronDown, ChevronRight, Filter, X } from "lucide-react";

interface SidebarBlockProps {
  id?: string;
  config?: {
    position?: "left" | "right";
    showCategories?: boolean;
    showFilters?: boolean;
  };
}

// This is a client component wrapper that will fetch server data
// In a real implementation, you might want to pass categories as props from server component
export function SidebarBlock({ id, config }: SidebarBlockProps) {
  const position = config?.position || "left";
  const showCategories = config?.showCategories !== false;
  const showFilters = config?.showFilters !== false;
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Mock categories - in production, fetch from API
  const categories = [
    { id: 1, name: "Web Development", slug: "web-development" },
    { id: 2, name: "Data Science", slug: "data-science" },
    { id: 3, name: "Design", slug: "design" },
    { id: 4, name: "Business", slug: "business" },
    { id: 5, name: "Marketing", slug: "marketing" },
    { id: 6, name: "Programming", slug: "programming" },
  ];

  const filterOptions = [
    { label: "Price", options: ["Free", "Paid", "All"] },
    { label: "Level", options: ["Beginner", "Intermediate", "Advanced"] },
    { label: "Duration", options: ["< 1 hour", "1-5 hours", "> 5 hours"] },
  ];

  return (
    <>
      {/* Mobile toggle button */}
      <div className="lg:hidden fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--theme-primary)] text-[var(--theme-on-primary)] shadow-lg shadow-[var(--theme-primary)]/30 transition-all hover:scale-110"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Filter className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        id={id || "sidebar"}
        style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border-color)', color: 'var(--theme-foreground)' }}
        className={cn(
          "fixed top-0 z-40 h-full w-80 transform border-r transition-transform duration-300 lg:relative lg:z-auto lg:transform-none",
          position === "left" ? "left-0" : "right-0",
          isOpen ? "translate-x-0" : position === "left" ? "-translate-x-full" : "translate-x-full",
          "lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col overflow-y-auto p-6">
          {/* Close button for mobile */}
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <h2 className="text-lg font-semibold">
              Filters & Categories
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-2 opacity-60 hover:opacity-100 hover:bg-[var(--theme-surface-alt)]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Categories Section */}
          {showCategories && (
            <div className="mb-8">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide opacity-60">
                Categories
              </h3>
              <nav className="space-y-2">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={buildAcademyPath(null, `/courses?category=${category.slug}`)}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-4 py-2.5 text-sm transition-colors",
                      selectedCategory === category.slug
                        ? "bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] font-medium"
                        : "opacity-60 hover:opacity-100 hover:bg-[var(--theme-surface-alt)]"
                    )}
                  >
                    <span>{category.name}</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                ))}
              </nav>
            </div>
          )}

          {/* Filters Section */}
          {showFilters && (
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide opacity-60">
                Filters
              </h3>
              <div className="space-y-6">
                {filterOptions.map((filter, index) => (
                  <div key={index}>
                    <button className="flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-sm font-medium opacity-80 hover:opacity-100 hover:bg-[var(--theme-surface-alt)]">
                      <span>{filter.label}</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <div className="mt-2 space-y-1 pl-4">
                      {filter.options.map((option) => (
                        <label
                          key={option}
                          className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm opacity-65 hover:opacity-100 hover:bg-[var(--theme-surface-alt)]"
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-slate-300 text-[var(--theme-primary)] focus:ring-[var(--theme-primary)]"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Apply Filters Button */}
          {showFilters && (
            <div className="mt-8 pt-6 border-t" style={{ borderColor: 'var(--theme-border-color)' }}>
              <button className="w-full rounded-lg bg-[var(--theme-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--theme-on-primary)] shadow-lg shadow-[var(--theme-primary)]/30 transition-all hover:bg-[var(--theme-primary)]/90">
                Apply Filters
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

