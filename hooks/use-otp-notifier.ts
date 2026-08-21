"use client";

import { useCallback } from "react";

import { useLocaleDigits } from "@/hooks/use-locale-digits";
import { useTranslation } from "@/lib/i18n/hooks";
import { notifyOtpSent } from "@/lib/otp-notify";

/**
 * "Code sent" feedback for every auth screen: one toast, and the debug code
 * (dev only) rendered in the reader's own digits.
 */
export function useOtpNotifier() {
  const { t } = useTranslation();
  const localeDigits = useLocaleDigits();

  return useCallback(
    (otp: string | undefined, message: string, toastId?: string) => {
      notifyOtpSent(
        otp ? localeDigits(otp) : undefined,
        message,
        t("auth.otpCodeLabel"),
        toastId,
      );
    },
    [localeDigits, t],
  );
}
