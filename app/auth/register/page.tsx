import type { Metadata } from 'next';

import { RegisterForm } from '@/components/auth/register-form';
import { getAcademyContext } from '@/lib/store-context';
import { getAcademyBySlug } from '@/lib/api/server';

export const metadata: Metadata = {
  title: 'Create account',
  description: 'Join EduSpher and start your personalised learning journey.',
};

export default async function RegisterPage() {
  const storeContext = await getAcademyContext();
  const store = storeContext.slug ? await getAcademyBySlug(storeContext.slug) : null;
  const defaultCountryCode = store?.country_code || undefined;

  return (
    <RegisterForm
      defaultCountryCode={defaultCountryCode}
      primaryVerificationMethod={store?.primary_verification_method || 'phone'}
    />
  );
}
