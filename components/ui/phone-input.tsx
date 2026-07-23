"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Phone, ChevronDown } from "lucide-react";
import { COUNTRY_CODES, getCountryByCode, getDefaultCountry, type CountryCode } from "@/lib/country-codes";
import { toEnglishDigits } from "@/lib/phone-utils";
import { cn } from "@/lib/utils";

interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onCountryChange?: (country: CountryCode) => void;
  defaultCountry?: CountryCode;
  className?: string;
  inputClassName?: string;
  id?: string;
  autoComplete?: string;
  placeholder?: string;
  disabled?: boolean;
  lockCountryCode?: string;
}

export const PhoneInput = ({
  value = "",
  onChange,
  onCountryChange,
  defaultCountry,
  className,
  inputClassName,
  id,
  autoComplete = "tel",
  placeholder = "09121234567",
  disabled = false,
  lockCountryCode,
}: PhoneInputProps) => {
  const lockedCountry = useMemo(
    () =>
      lockCountryCode
        ? getCountryByCode(lockCountryCode) ?? getDefaultCountry()
        : null,
    [lockCountryCode]
  );
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(
    () => defaultCountry || getDefaultCountry()
  );
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Follow the defaultCountry prop without an effect (React's "adjust state on
  // prop change" pattern). A locked country always wins and is derived below.
  const [prevDefault, setPrevDefault] = useState(defaultCountry);
  if (defaultCountry && defaultCountry !== prevDefault) {
    setPrevDefault(defaultCountry);
    setSelectedCountry(defaultCountry);
  }

  const activeCountry = lockedCountry ?? selectedCountry;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCountrySelect = (country: CountryCode) => {
    if (lockedCountry) return;
    setSelectedCountry(country);
    setIsOpen(false);
    onCountryChange?.(country);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = toEnglishDigits(e.target.value).replace(/\D/g, "");
    onChange?.(inputValue);
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative flex">
        <div className="relative">
          <button
            type="button"
            onClick={() => !disabled && !lockedCountry && setIsOpen(!isOpen)}
            disabled={disabled || !!lockedCountry}
            className={cn(
              "flex h-11 items-center gap-2 rounded-l-theme border border-r-0 border-slate-200 bg-card",
              (disabled || lockedCountry) && "opacity-50 cursor-not-allowed",
              isOpen && "ring-2 ring-sky-500"
            )}
          >
            <span className="text-base">{activeCountry.flag}</span>
            <span className="text-xs">{activeCountry.dialCode}</span>
            {!lockedCountry && (
              <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
            )}
          </button>
          {isOpen && !lockedCountry && (
            <div
              ref={dropdownRef}
              className="absolute left-0 top-full z-50 mt-1 max-h-60 w-64 overflow-auto rounded-theme border border-theme bg-card"
            >
              {COUNTRY_CODES.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100  dark:hover:bg-slate-800",
                    activeCountry.code === country.code && "bg-sky-50 dark:bg-sky-950"
                  )}
                >
                  <span className="text-base">{country.flag}</span>
                  <span className="flex-1">{country.name}</span>
                  <span className="text-xs text-muted opacity-70">{country.dialCode}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Phone className="h-5 w-5 text-muted opacity-60" />
          </div>
          <input
            id={id}
            type="tel"
            dir="ltr"
            value={value}
            onChange={handlePhoneChange}
            autoComplete={autoComplete}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "flex h-11 w-full rounded-r-theme border border-theme bg-card",
              disabled && "opacity-50 cursor-not-allowed",
              inputClassName
            )}
          />
        </div>
      </div>
    </div>
  );
};
