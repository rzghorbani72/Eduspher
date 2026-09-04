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
const IR_COUNTRY: CountryCode =
  getCountryByCode("IR") ?? getDefaultCountry();

type LegalVersions = { terms: string | null; privacy: string | null };

async function loadLegalVersions(): Promise<LegalVersions> {
  try {
    const docs = await getLegalDocuments();
    return {
      terms: docs.find((d) => d.type === "TERMS")?.version ?? null,
      privacy: docs.find((d) => d.type === "PRIVACY")?.version ?? null,
    };
  } catch {
    return { terms: null, privacy: null };
  }
}

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
  const country = IR_COUNTRY;
  const [otp, setOtp] = useState("");
  const [accepted, setAccepted] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<QuickSignupResult | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const legal = useRef<LegalVersions>({
    terms: null,
    privacy: null,
  });

  useEffect(() => {
    let active = true;
    loadLegalVersions().then((versions) => {
      if (active) legal.current = versions;
    });
    return () => {
      active = false;
    };
  }, []);

  /** Prefetch may still be in flight — resolve (or re-fetch) before consent is sent. */
  const ensureLegalVersions = useCallback(async (): Promise<LegalVersions> => {
    if (legal.current.terms && legal.current.privacy) return legal.current;
    const versions = await loadLegalVersions();
    legal.current = versions;
    return versions;
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

  const nationalPhone = phone ? cleanPhoneNumber(phone, country) : "";
  const fullPhone = nationalPhone
    ? getFullPhoneNumber(nationalPhone, country)
    : "";
  const phoneValid = isValidPhoneNumber(nationalPhone, country);
  const canSubmitPhone = phoneValid && accepted;

  useEffect(() => {
    if (step !== "phone") return;
    setError(null);
  }, [phone, accepted, step]);

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
    const problem = !phoneValid
      ? M.phoneInvalid
      : !accepted
        ? M.legalRequired
        : null;
    return guard(problem, async () => {
      const { terms, privacy } = await ensureLegalVersions();
      if (!terms || !privacy) {
        throw new Error(M.legalUnavailable);
      }
      await sendPhoneOtp(fullPhone, OtpType.REGISTER_PHONE_VERIFICATION);
      setResendIn(RESEND_SECONDS);
      setStep("otp");
    });
  }, [
    accepted,
    ensureLegalVersions,
    fullPhone,
    guard,
    phoneValid,
  ]);

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
      const problem = !value ? M.otpRequired : null;
      return guard(problem, async () => {
        const { terms, privacy } = await ensureLegalVersions();
        if (!terms || !privacy) {
          throw new Error(M.legalUnavailable);
        }
        await verifyPhoneOtp(
          fullPhone,
          value,
          OtpType.REGISTER_PHONE_VERIFICATION,
        );
        await quickSignup({
          phone_number: fullPhone,
          display_name: name.trim(),
          accepted_terms_version: terms,
          accepted_privacy_version: privacy,
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
    [ensureLegalVersions, fullPhone, guard, name, onFinished, otp, slug],
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
    phoneValid,
    canSubmitPhone,
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
