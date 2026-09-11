import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface AccountSectionProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

/** Shared card chrome for account settings panels. */
export function AccountSection({
  title,
  description,
  icon: Icon,
  actions,
  children,
  className,
  bodyClassName,
}: AccountSectionProps) {
  return (
    <section
      className={cn(
        "flex h-full flex-col rounded-2xl border border-theme bg-card p-5 sm:p-6",
        className,
      )}
    >
      {title ? (
        <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <h2 className="flex items-center gap-2 text-base font-semibold text-(--theme-foreground)">
              {Icon ? (
                <span
                  className="flex size-8 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor:
                      "color-mix(in srgb, var(--theme-primary) 12%, var(--theme-background))",
                    color: "var(--theme-primary-ink)",
                  }}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </span>
              ) : null}
              {title}
            </h2>
            {description ? (
              <p className="text-sm text-muted">{description}</p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex shrink-0 items-center gap-2">{actions}</div>
          ) : null}
        </header>
      ) : null}
      <div className={cn("flex min-h-0 flex-1 flex-col", bodyClassName)}>
        {children}
      </div>
    </section>
  );
}
