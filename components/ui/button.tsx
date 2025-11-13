import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "link";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-60";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-sky-600 text-white hover:bg-sky-700 focus-visible:outline-sky-600 dark:bg-sky-500 dark:hover:bg-sky-400 dark:focus-visible:outline-sky-400",
  secondary:
    "bg-slate-900 text-slate-50 hover:bg-slate-800 focus-visible:outline-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300",
  outline:
    "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 focus-visible:outline-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900",
  ghost:
    "bg-transparent text-slate-900 hover:bg-slate-100 focus-visible:outline-slate-200 dark:text-slate-100 dark:hover:bg-slate-900",
  link: "bg-transparent text-sky-600 underline-offset-4 hover:underline focus-visible:outline-sky-600 dark:text-sky-400",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-base",
  lg: "h-12 px-8 text-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = "primary", size = "md", loading, disabled, ...props }, ref) => {
    const isDisabled = loading || disabled;
    return (
      <button
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

