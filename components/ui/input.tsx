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
    const normalizedValue = value === undefined || value === null ? "" : String(value);

    return (
      <input
        ref={ref}
        type={type}
        value={normalizedValue}
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

