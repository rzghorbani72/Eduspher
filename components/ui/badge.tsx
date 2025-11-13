import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "outline" | "soft" | "success" | "warning";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const badgeVariants: Record<BadgeVariant, string> = {
  default: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200",
  outline:
    "border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-200",
  soft: "bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-200",
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200",
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

