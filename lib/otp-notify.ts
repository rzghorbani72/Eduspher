import { toast } from "react-toastify";

/**
 * TODO: Remove the debug code display when the real SMS provider is integrated.
 * The backend only returns `otp` outside production.
 */
export function notifyOtpSent(
  otp: string | undefined,
  message: string,
  codeLabel: string,
  toastId?: string,
): void {
  if (otp) {
    toast.info(`${message}\n\n🔐 ${codeLabel}: ${otp}`, {
      toastId,
      autoClose: 8000,
      style: { whiteSpace: "pre-wrap" },
    });
    return;
  }
  toast.success(message, { toastId });
}
