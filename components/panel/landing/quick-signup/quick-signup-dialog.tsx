'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

import { LANDING } from '../landing.messages';
import { useQuickSignup } from './use-quick-signup';
import { IdentityStep } from './identity-step';
import { PhoneStep } from './phone-step';
import { OtpStep } from './otp-step';
import { SuccessStep } from './success-step';
import { StepDots } from './step-dots';

const M = LANDING.quickSignup;

type Props = {
  onClose: () => void;
  initialSlug?: string;
};

/**
 * The landing signup, start to finish, without leaving the page: academy name
 * and address, phone, code — and the account, the academy, the trial and a
 * published website all exist by the time the last step renders.
 *
 * Portal + own overlay, matching `checkout-dialog.tsx`; edusphere has no Radix
 * dialog and this is not the place to add one.
 */
export function QuickSignupDialog({ onClose, initialSlug }: Props) {
  const flow = useQuickSignup(undefined, initialSlug);
  const done = flow.step === 'done';
  const redirecting = flow.step === 'redirecting';

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !flow.pending && !redirecting) onClose();
    };
    document.addEventListener('keydown', onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [flow.pending, redirecting, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !flow.pending && !redirecting) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={M.title}
        dir="rtl"
        className="qs-dialog relative w-full max-w-[460px] rounded-2xl bg-white p-6 text-[#181c20] [color-scheme:light] shadow-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={flow.pending || redirecting}
          aria-label={M.close}
          className="text-lp-muted hover:text-lp-ink absolute end-4 top-4 rounded-full p-1.5 transition-colors hover:bg-black/5 disabled:opacity-40"
        >
          <X className="h-4 w-4" />
        </button>

        {!done && !redirecting && (
          <header className="mb-6 text-center">
            <h2 className="text-lp-ink text-xl font-extrabold">{M.title}</h2>
            <p className="text-lp-muted mt-1.5 text-sm">{M.subtitle}</p>
            <StepDots step={flow.step} />
          </header>
        )}

        {flow.step === 'identity' && <IdentityStep flow={flow} />}
        {flow.step === 'phone' && <PhoneStep flow={flow} />}
        {flow.step === 'otp' && <OtpStep flow={flow} />}
        {redirecting && (
          <p className="text-lp-ink py-8 text-center text-sm font-semibold">{M.redirecting}</p>
        )}
        {done && flow.result && <SuccessStep result={flow.result} />}

        {flow.error && !done && (
          <p
            role="alert"
            className="rounded-lp mt-4 bg-red-50 px-3 py-2 text-center text-[13px] text-red-600"
          >
            {flow.error}
          </p>
        )}
      </div>
    </div>,
    document.body,
  );
}
