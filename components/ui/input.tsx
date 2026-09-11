import { forwardRef } from "react";
import type { InputHTMLAttributes, CSSProperties } from "react";

import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

const inputBaseStyle: CSSProperties = {
  backgroundColor: 'var(--theme-surface)',
  borderColor: 'var(--theme-border-color)',
  color: 'var(--theme-foreground)',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", value, style, ...props }, ref) => {
    // Only control the value when one is actually provided. Forcing value=""
    // for uncontrolled inputs (e.g. react-hook-form `{...register()}` fields)
    // pins them empty and makes typing impossible.
    const isControlled = value !== undefined && value !== null;

    return (
      <input
        ref={ref}
        type={type}
        {...(isControlled ? { value: String(value) } : {})}
        className={cn(
          "flex h-11 w-full rounded-xl border bg-surface px-4 text-sm text-(--theme-foreground) transition-colors placeholder:text-muted placeholder:opacity-70 focus-visible:border-(--theme-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--theme-primary)/20",
          className
        )}
        style={{ ...inputBaseStyle, ...style }}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

