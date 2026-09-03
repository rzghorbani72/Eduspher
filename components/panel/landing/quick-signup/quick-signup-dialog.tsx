"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { LANDING } from "../landing.messages";
import { useQuickSignup } from "./use-quick-signup";
import { IdentityStep } from "./identity-step";
import { PhoneStep } from "./phone-step";
import { OtpStep } from "./otp-step";
import { SuccessStep } from "./success-step";
import { StepDots } from "./step-dots";

const M = LANDING.quickSignup;

type Props = {
  onClose: () => void;
};

/**
 * The landing signup, start to finish, without leaving the page: academy name
 * and address, phone, code — and the account, the academy, the trial and a
 * published website all exist by the time the last step renders.
 *
 * Portal + own overlay, matching `checkout-dialog.tsx`; edusphere has no Radix
 * dialog and this is not the place to add one.
 */
export function QuickSignupDialog({ onClose }: Props) {
  const flow = useQuickSignup();
  const done = flow.step === "done";

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !flow.pending) onClose();
    };
    document.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [flow.pending, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !flow.pending) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={M.title}
        dir="rtl"
        className="relative w-full max-w-[460px] rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={flow.pending}
          aria-label={M.close}
          className="absolute end-4 top-4 rounded-full p-1.5 text-lp-muted transition-colors hover:bg-black/5 hover:text-lp-ink disabled:opacity-40"
        >
          <X className="h-4 w-4" />
        </button>

        {!done && (
          <header className="mb-6 text-center">
            <h2 className="text-xl font-extrabold text-lp-ink">{M.title}</h2>
            <p className="mt-1.5 text-sm text-lp-muted">{M.subtitle}</p>
            <StepDots step={flow.step} />
          </header>
        )}

        {flow.step === "identity" && <IdentityStep flow={flow} />}
        {flow.step === "phone" && <PhoneStep flow={flow} />}
        {flow.step === "otp" && <OtpStep flow={flow} />}
        {done && flow.result && <SuccessStep result={flow.result} />}

        {flow.error && !done && (
          <p
            role="alert"
            className="mt-4 rounded-lp bg-red-50 px-3 py-2 text-center text-[13px] text-red-600"
          >
            {flow.error}
          </p>
        )}
      </div>
    </div>,
    document.body,
  );
}
