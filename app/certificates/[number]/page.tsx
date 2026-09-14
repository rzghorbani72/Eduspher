import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Award, BadgeCheck, ShieldAlert } from 'lucide-react';

import { verifyCertificate, getAcademyBySlug } from '@/lib/api/server';
import { getAcademyLanguage } from '@/lib/i18n/server';
import { t } from '@/lib/i18n/server-translations';
import { getAcademyContext } from '@/lib/store-context';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ number: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { number } = await params;
  const certificate = await verifyCertificate(number);
  if (!certificate) return { title: number };
  return {
    title: `${certificate.course_title ?? ''} — ${certificate.student_name ?? ''}`.trim(),
    // A certificate belongs to one person; it is shared by link, not searched for.
    robots: { index: false, follow: false },
  };
}

/**
 * The certificate itself, printable straight from the browser. It is rendered
 * on the server and readable without a session so the link a student sends to
 * an employer opens for them too — and the same page states whether the
 * academy still stands behind it.
 */
export default async function CertificatePage({ params }: PageProps) {
  const { number } = await params;
  const [certificate, academyContext] = await Promise.all([
    verifyCertificate(number),
    getAcademyContext(),
  ]);
  if (!certificate) notFound();

  const academy = academyContext.slug
    ? await getAcademyBySlug(academyContext.slug).catch(() => null)
    : null;
  const language = getAcademyLanguage(academy?.language ?? null, academy?.country_code ?? null);
  const translate = (key: string) => t(key, language);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 print:py-0">
      <article className="bg-card relative overflow-hidden rounded-2xl border-2 border-(--theme-primary) p-8 text-center sm:p-12 print:border-black">
        <Award className="mx-auto size-12 text-(--theme-primary)" aria-hidden="true" />

        <p className="text-muted mt-6 text-sm">{certificate.academy_name ?? ''}</p>
        <h1 className="mt-1 text-2xl font-bold text-(--theme-foreground) sm:text-3xl">
          {translate('certificate.title')}
        </h1>

        <p className="text-muted mt-8 text-sm">{translate('certificate.awardedTo')}</p>
        <p className="mt-1 text-xl font-semibold text-(--theme-foreground) sm:text-2xl">
          {certificate.student_name ?? '—'}
        </p>

        <p className="text-muted mt-6 text-sm">{translate('certificate.forCompleting')}</p>
        <p className="mt-1 text-lg font-medium text-(--theme-primary-ink)">
          {certificate.course_title ?? '—'}
        </p>

        <dl className="border-theme mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t pt-6 text-sm">
          <div>
            <dt className="text-muted text-xs">{translate('certificate.number')}</dt>
            <dd className="font-medium">{certificate.certificate_number}</dd>
          </div>
          <div>
            <dt className="text-muted text-xs">{translate('certificate.issuedAt')}</dt>
            <dd className="font-medium">{formatDate(certificate.issued_at, language)}</dd>
          </div>
        </dl>

        <p
          className={`mt-6 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
            certificate.is_valid
              ? 'bg-emerald-500/10 text-emerald-600'
              : 'bg-red-500/10 text-red-600'
          }`}
        >
          {certificate.is_valid ? (
            <BadgeCheck className="size-4" aria-hidden="true" />
          ) : (
            <ShieldAlert className="size-4" aria-hidden="true" />
          )}
          {certificate.is_valid ? translate('certificate.valid') : translate('certificate.revoked')}
        </p>
      </article>

      <p className="text-muted mt-4 text-center text-xs print:hidden">
        {translate('certificate.printHint')}
      </p>
    </main>
  );
}
