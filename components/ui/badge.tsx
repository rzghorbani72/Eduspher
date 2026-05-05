import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "outline" | "soft" | "success" | "warning";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const badgeVariants: Record<BadgeVariant, string> = {
  // Uses the brand primary color — always contrasts via --theme-primary and its subtle bg
  default: "bg-primary-subtle text-primary",
  // Quiet border-only badge using the semantic border token
  outline: "border border-theme text-muted",
  // Neutral surface badge, inherits foreground
  soft: "bg-surface text-foreground opacity-80",
  // Semantic status colors — intentionally keep their own hue for legibility
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
};

export const Badge = ({ className, variant = "default", ...props }: BadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  );
};
