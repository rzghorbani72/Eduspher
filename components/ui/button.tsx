import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "link";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  asChild?: boolean;
}

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-60";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--theme-primary)] text-white hover:opacity-90 focus-visible:outline-[var(--theme-primary)] shadow-lg shadow-[var(--theme-primary)]/30 hover:shadow-xl hover:shadow-[var(--theme-primary)]/40 transition-all magnetic hover:scale-105 active:scale-95 relative overflow-hidden",
  secondary:
    "bg-[var(--theme-secondary)] text-white hover:opacity-90 focus-visible:outline-[var(--theme-secondary)] shadow-lg shadow-[var(--theme-secondary)]/30 hover:shadow-xl hover:shadow-[var(--theme-secondary)]/40 transition-all dark:bg-[var(--theme-secondary)] dark:text-white magnetic hover:scale-105 active:scale-95 relative overflow-hidden",
  outline:
    "border-2 border-[var(--theme-primary)] bg-transparent text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/10 focus-visible:outline-[var(--theme-primary)] transition-all magnetic hover:scale-105 active:scale-95",
  ghost:
    "bg-transparent text-slate-900 hover:bg-slate-100 focus-visible:outline-slate-200 dark:text-slate-100 dark:hover:bg-slate-900 transition-all magnetic hover:scale-105 active:scale-95",
  link: "bg-transparent text-[var(--theme-primary)] underline-offset-4 hover:underline focus-visible:outline-[var(--theme-primary)] transition-all hover:scale-105",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-base",
  lg: "h-12 px-8 text-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = "primary", size = "md", loading, disabled, asChild = false, ...props }, ref) => {
    const isDisabled = loading || disabled;
    const Comp = asChild ? Slot : "button";
    
    // If asChild is true, we don't want to pass disabled/aria-busy to the child component
    // as it might be a Link or other non-button element
    // Also, we need to exclude asChild from props to prevent it from being passed to DOM
    const { asChild: _, ...restProps } = props;
    const buttonProps = asChild
      ? restProps
      : { ...restProps, disabled: isDisabled, "aria-busy": loading };
    
    // When asChild is true, Slot expects exactly one child element
    // So we render differently based on asChild
    if (asChild) {
      return (
        <Comp
          ref={ref}
          className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
          data-animation-style="moderate"
          {...buttonProps}
        >
          {children}
        </Comp>
      );
    }

    // Regular button with shimmer effect
    const shimmerEffect = (variant === 'primary' || variant === 'secondary') ? (
      <span className="absolute inset-0 animate-shimmer opacity-0 hover:opacity-100 transition-opacity duration-300" />
    ) : null;
    
    return (
      <Comp
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        data-animation-style="moderate"
        {...buttonProps}
      >
        {shimmerEffect}
        <span className="relative z-10">{children}</span>
      </Comp>
    );
  }
);

Button.displayName = "Button";

