"use client";

import { useState, useRef, useEffect } from "react";
import { Phone, ChevronDown } from "lucide-react";
import { COUNTRY_CODES, getDefaultCountry, type CountryCode } from "@/lib/country-codes";
import { cn } from "@/lib/utils";

interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onCountryChange?: (country: CountryCode) => void;
  defaultCountry?: CountryCode;
  className?: string;
  id?: string;
  autoComplete?: string;
  placeholder?: string;
  disabled?: boolean;
}

export const PhoneInput = ({
  value = "",
  onChange,
  onCountryChange,
  defaultCountry,
  className,
  id,
  autoComplete = "tel",
  placeholder = "Enter phone number",
  disabled = false,
}: PhoneInputProps) => {
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(
    defaultCountry || getDefaultCountry()
  );
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    setSelectedCountry(country);
    setIsOpen(false);
    onCountryChange?.(country);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/\D/g, "");
    onChange?.(inputValue);
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative flex">
        <div className="relative">
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={cn(
              "flex h-11 items-center gap-2 rounded-l-lg border border-r-0 border-slate-200 bg-white px-3 text-sm text-slate-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100",
              disabled && "opacity-50 cursor-not-allowed",
              isOpen && "ring-2 ring-sky-500"
            )}
          >
            <span className="text-base">{selectedCountry.flag}</span>
            <span className="text-xs">{selectedCountry.dialCode}</span>
            <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
          </button>
          {isOpen && (
            <div
              ref={dropdownRef}
              className="absolute left-0 top-full z-50 mt-1 max-h-60 w-64 overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-950"
            >
              {COUNTRY_CODES.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
                    selectedCountry.code === country.code && "bg-sky-50 dark:bg-sky-950"
                  )}
                >
                  <span className="text-base">{country.flag}</span>
                  <span className="flex-1">{country.name}</span>
                  <span className="text-xs text-slate-500">{country.dialCode}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Phone className="h-5 w-5 text-slate-400" />
          </div>
          <input
            id={id}
            type="tel"
            value={value}
            onChange={handlePhoneChange}
            autoComplete={autoComplete}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "flex h-11 w-full rounded-r-lg border border-slate-200 bg-white pl-10 pr-4 text-base text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          />
        </div>
      </div>
    </div>
  );
};



