"use client";

import { OtpBoxInput } from "@/components/ui/otp-box-input";
import { formatPhoneDisplay, toPersianDigits } from "@/lib/utils";
import { LANDING } from "../landing.messages";
import { DialogButton } from "./dialog-button";
import type { useQuickSignup } from "./use-quick-signup";

const M = LANDING.quickSignup;

export function OtpStep({ flow }: { flow: ReturnType<typeof useQuickSignup> }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-start text-[13px] text-lp-muted">
          {M.otpSentBeforePhone}{" "}
          <strong dir="ltr" className="font-semibold text-[#181c20]">
            {formatPhoneDisplay(flow.fullPhone, "fa")}
          </strong>{" "}
          {M.otpSentAfterPhone}
        </p>
        <button
          type="button"
          onClick={flow.editPhone}
          disabled={flow.pending}
          className="shrink-0 text-[13px] text-primary hover:underline disabled:opacity-60"
        >
          {M.edit}
        </button>
      </div>

      <div dir="ltr" className="qs-otp flex justify-center">
        <OtpBoxInput
          value={flow.otp}
          onChange={flow.setOtp}
          disabled={flow.pending}
          onComplete={(code) => flow.submitOtp(code)}
        />
      </div>

      <DialogButton
        label={M.submit}
        pendingLabel={M.working}
        pending={flow.pending}
        onClick={() => flow.submitOtp()}
      />

      <button
        type="button"
        onClick={flow.resendOtp}
        disabled={flow.resendIn > 0 || flow.pending}
        className="w-full text-center text-[12px] text-lp-muted underline disabled:no-underline disabled:opacity-60"
      >
        {flow.resendIn > 0 ? (
          <>
            {M.otpResendIn.replace(
              "{seconds}",
              toPersianDigits(String(flow.resendIn), "fa"),
            )}
          </>
        ) : (
          M.otpResend
        )}
      </button>

      <DialogButton label={M.back} variant="ghost" onClick={flow.back} />
    </div>
  );
}
