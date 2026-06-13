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
          "flex h-11 w-full rounded-lg border px-4 text-base shadow-sm transition-colors placeholder:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-primary)]",
          className
        )}
        style={{ ...inputBaseStyle, ...style }}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

