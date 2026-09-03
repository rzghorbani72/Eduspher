"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  checkAcademySlug,
  getLegalDocuments,
  quickSignup,
  quickStartAcademy,
  sendPhoneOtp,
  verifyPhoneOtp,
} from "@/lib/api/client";
import { OtpType } from "@/lib/constants";
import {
  cleanPhoneNumber,
  getFullPhoneNumber,
  isValidPhoneNumber,
} from "@/lib/phone-utils";
import {
  getCountryByCode,
  getDefaultCountry,
  type CountryCode,
} from "@/lib/country-codes";
import { academySiteUrl, getAdminPanelUrl } from "@/lib/admin-panel-url";
import { isValidSlug, type SlugStatus } from "@/lib/slug";
import { LANDING } from "../landing.messages";

const M = LANDING.quickSignup;
const SLUG_DEBOUNCE_MS = 400;
const RESEND_SECONDS = 90;

export type QuickSignupStep = "identity" | "phone" | "otp" | "done";

export type QuickSignupResult = {
  siteUrl: string;
  panelUrl: string;
  siteReady: boolean;
};

/**
 * Drives the landing fast flow. Kept out of the dialog component so the steps
 * stay presentational and this stays testable on its own.
 *
 * Order matters and is not an accident: the phone is checked before the SMS is
 * sent, and the OTP is verified before the account is created, so the user
 * never burns a code only to be told the phone was unusable all along.
 */
export function useQuickSignup(onFinished?: () => void) {
  const [step, setStep] = useState<QuickSignupStep>("identity");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState<CountryCode>(
    () => getCountryByCode("IR") ?? getDefaultCountry(),
  );
  const [otp, setOtp] = useState("");
  const [accepted, setAccepted] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<QuickSignupResult | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const legal = useRef<{ terms: string | null; privacy: string | null }>({
    terms: null,
    privacy: null,
  });

  useEffect(() => {
    getLegalDocuments()
      .then((docs) => {
        legal.current = {
          terms: docs.find((d) => d.type === "TERMS")?.version ?? null,
          privacy: docs.find((d) => d.type === "PRIVACY")?.version ?? null,
        };
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  // Availability is answered while typing, but only the last keystroke wins:
  // a stale reply must never paint "taken" over a name the user has moved on from.
  useEffect(() => {
    if (!slug) {
      setSlugStatus("idle");
      return;
    }
    if (!isValidSlug(slug)) {
      setSlugStatus("invalid");
      return;
    }
    setSlugStatus("checking");
    let active = true;
    const timer = setTimeout(async () => {
      try {
        const { available } = await checkAcademySlug(slug);
        if (active) setSlugStatus(available ? "available" : "taken");
      } catch {
        if (active) setSlugStatus("idle");
      }
    }, SLUG_DEBOUNCE_MS);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [slug]);

  /** The API always wants E.164; the input holds the local number. */
  const fullPhone = phone
    ? getFullPhoneNumber(cleanPhoneNumber(phone, country), country)
    : "";

  const guard = useCallback(
    async (message: string | null, action: () => Promise<void>) => {
      if (message) {
        setError(message);
        return;
      }
      setError(null);
      setPending(true);
      try {
        await action();
      } catch (err) {
        setError(err instanceof Error ? err.message : M.genericError);
      } finally {
        setPending(false);
      }
    },
    [],
  );

  const submitIdentity = useCallback(() => {
    const problem = !name.trim()
      ? M.nameRequired
      : !slug
        ? M.slugRequired
        : slugStatus === "invalid"
          ? M.slugInvalid
          : slugStatus === "taken"
            ? M.slugTaken
            : null;
    return guard(problem, async () => {
      setStep("phone");
    });
  }, [guard, name, slug, slugStatus]);

  const submitPhone = useCallback(() => {
    const problem = !isValidPhoneNumber(phone, country)
      ? M.phoneInvalid
      : !accepted
        ? M.legalRequired
        : !legal.current.terms || !legal.current.privacy
          ? M.legalUnavailable
          : null;
    return guard(problem, async () => {
      await sendPhoneOtp(fullPhone, OtpType.REGISTER_PHONE_VERIFICATION);
      setResendIn(RESEND_SECONDS);
      setStep("otp");
    });
  }, [accepted, country, fullPhone, guard, phone]);

  const resendOtp = useCallback(() => {
    if (resendIn > 0) return Promise.resolve();
    return guard(null, async () => {
      await sendPhoneOtp(fullPhone, OtpType.REGISTER_PHONE_VERIFICATION);
      setResendIn(RESEND_SECONDS);
    });
  }, [fullPhone, guard, resendIn]);

  const submitOtp = useCallback(
    (code?: string) => {
      const value = (code ?? otp).trim();
      const { terms, privacy } = legal.current;
      const problem = !value
        ? M.otpRequired
        : !terms || !privacy
          ? M.legalUnavailable
          : null;
      return guard(problem, async () => {
        await verifyPhoneOtp(
          fullPhone,
          value,
          OtpType.REGISTER_PHONE_VERIFICATION,
        );
        await quickSignup({
          phone_number: fullPhone,
          display_name: name.trim(),
          accepted_terms_version: terms as string,
          accepted_privacy_version: privacy as string,
        });
        const started = await quickStartAcademy({
          name: name.trim(),
          private_domain: slug,
        });
        const createdSlug = started.data?.slug ?? slug;
        setResult({
          siteUrl: academySiteUrl(createdSlug),
          panelUrl: getAdminPanelUrl("/dashboard"),
          siteReady: started.site_ready !== false,
        });
        setStep("done");
        onFinished?.();
      });
    },
    [fullPhone, guard, name, onFinished, otp, slug],
  );

  const back = useCallback(() => {
    setError(null);
    setStep((current) => (current === "otp" ? "phone" : "identity"));
  }, []);

  return {
    step,
    name,
    setName,
    slug,
    setSlug,
    slugStatus,
    phone,
    setPhone,
    fullPhone,
    country,
    setCountry,
    otp,
    setOtp,
    accepted,
    setAccepted,
    error,
    pending,
    result,
    resendIn,
    submitIdentity,
    submitPhone,
    submitOtp,
    resendOtp,
    back,
  };
}
