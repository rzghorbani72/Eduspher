import type { Metadata } from 'next';

import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

export const metadata: Metadata = {
  title: 'Reset password',
  description: 'Reset your password using email or phone verification.',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
