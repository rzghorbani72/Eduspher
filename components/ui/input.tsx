import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", value, ...props }, ref) => {
    // Ensure value is always a string to prevent controlled/uncontrolled warning
    const normalizedValue = value === undefined || value === null ? "" : String(value);
    
    return (
      <input
        ref={ref}
        type={type}
        value={normalizedValue}
        className={cn(
          "flex h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-base text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

