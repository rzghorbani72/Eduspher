'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { isPaymentEnabled } from '@/lib/payment';

export default function BankRedirectPage() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id');
  const basketId = searchParams.get('basket_id');
  const amount = searchParams.get('amount');
  const callbackUrl = searchParams.get('callback_url');

  useEffect(() => {
    if (!isPaymentEnabled) return;

    const timer = setTimeout(() => {
      const isSuccess = Math.random() > 0.2;

      const resultUrl = new URL(callbackUrl || '/payment/callback');
      resultUrl.searchParams.set('payment_id', paymentId || '');
      resultUrl.searchParams.set('basket_id', basketId || '');
      resultUrl.searchParams.set('amount', amount || '');
      resultUrl.searchParams.set('status', isSuccess ? 'success' : 'failed');
      resultUrl.searchParams.set('transaction_id', `TXN${Date.now()}`);
      resultUrl.searchParams.set(
        'reference',
        `REF${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      );

      if (isSuccess) {
        resultUrl.searchParams.set('message', 'Payment successful');
      } else {
        resultUrl.searchParams.set('message', 'Payment failed');
        resultUrl.searchParams.set('error_code', 'PAYMENT_DECLINED');
      }

      window.location.href = resultUrl.toString();
    }, 2000);

    return () => clearTimeout(timer);
  }, [paymentId, basketId, amount, callbackUrl]);

  if (!isPaymentEnabled) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="max-w-sm space-y-3 text-center">
          <h1 className="text-xl font-bold">Payment Coming Soon</h1>
          <p className="text-muted-foreground text-sm">
            Payment processing is coming soon. Contact us to get early access.
          </p>
          <a
            href="mailto:support@mentoma.com"
            className="text-primary inline-block text-sm underline"
          >
            Contact Us
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="space-y-4 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-sky-600" />
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Redirecting to Bank...
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Please wait while we process your payment
        </p>
      </div>
    </div>
  );
}
