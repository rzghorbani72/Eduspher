"use client";

import { useEffect, useRef } from "react";

import { useLocaleDigits } from "@/hooks/use-locale-digits";
import { toEnglishDigits } from "@/lib/phone-utils";
import { cn } from "@/lib/utils";

interface OtpBoxInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  /** Fired once the last box is filled, so the code submits without a click. */
  onComplete?: (code: string) => void;
}

/**
 * Boxed code field. The value handed to `onChange` is always English digits so
 * it can go straight to the API, while a Persian page reads Persian digits.
 */
export function OtpBoxInput({
  length = 5,
  value,
  onChange,
  disabled,
  autoFocus = true,
  className,
  onComplete,
}: OtpBoxInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const localeDigits = useLocaleDigits();
  const firedRef = useRef<string | null>(null);

  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  useEffect(() => {
    if (value.length < length || disabled) {
      if (value.length < length) firedRef.current = null;
      return;
    }
    if (firedRef.current === value) return;
    firedRef.current = value;
    onComplete?.(value);
  }, [value, length, disabled, onComplete]);

  function handleChange(index: number, raw: string) {
    const digit = toEnglishDigits(raw).replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    onChange(next.join(""));
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        onChange(next.join(""));
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const text = toEnglishDigits(e.clipboardData.getData("text"))
      .replace(/\D/g, "")
      .slice(0, length);
    const next = Array.from({ length }, (_, i) => text[i] ?? "");
    onChange(next.join(""));
    const focusIdx = Math.min(text.length, length - 1);
    inputRefs.current[focusIdx]?.focus();
  }

  return (
    <div className={cn("flex justify-center gap-2.5", className)} dir="ltr">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={localeDigits(digit)}
          disabled={disabled}
          autoFocus={autoFocus && i === 0}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.currentTarget.select()}
          onPaste={handlePaste}
          className={cn(
            "h-14 w-14 rounded-2xl border bg-card text-center text-xl font-semibold tabular-nums",
            "outline-none transition-colors",
            "focus:border-(--theme-primary) focus:ring-2 focus:ring-(--theme-primary)/20",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        />
      ))}
    </div>
  );
}
