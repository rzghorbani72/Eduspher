import Link from 'next/link';
import { notFound } from 'next/navigation';

import { sortAcademyCards, toAcademyCard } from '@/components/panel/landing/academy-card';
import { Container } from '@/components/panel/landing/landing-container';
import { LandingShell } from '@/components/panel/landing/landing-shell';
import { LANDING } from '@/components/panel/landing/landing.messages';
import { SectionHeading } from '@/components/panel/landing/section-heading';
import { getServerAdminPanelUrl } from '@/lib/admin-panel-url.server';
import { getAcademiesPublic } from '@/lib/api/server';
import { getAcademyContext } from '@/lib/store-context';

import { AcademyDirectory } from './academy-directory';

export const revalidate = 300;

/** Platform-only page: an academy's own site must not list its competitors. */
export default async function AcademiesPage() {
  const store = await getAcademyContext();
  if (store.slug) {
    notFound();
  }

  const adminLoginUrl = await getServerAdminPanelUrl('/login');
  const adminRegisterUrl = await getServerAdminPanelUrl('/register');
  const academies = await getAcademiesPublic({ limit: 100 }).catch(() => []);
  const cards = sortAcademyCards(
    academies.filter((academy) => Boolean(academy.slug)).map(toAcademyCard),
  );

  return (
    <LandingShell loginUrl={adminLoginUrl} registerUrl={adminRegisterUrl}>
      <section className="py-16 lg:py-24">
        <Container>
          <SectionHeading
            as="h1"
            title={LANDING.academies.title}
            subtitle={LANDING.academies.subtitle}
          />

          <AcademyDirectory cards={cards} />

          <div className="mt-16 flex justify-center">
            <Link href="/" className="text-lp-ink-2 hover:text-lp-ink text-[15px] font-semibold">
              {LANDING.academies.back}
            </Link>
          </div>
        </Container>
      </section>
    </LandingShell>
  );
}
