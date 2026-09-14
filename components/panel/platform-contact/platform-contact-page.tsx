import { Container } from '../landing/landing-container';
import { CircledWord } from '../landing/circled-word';
import { LandingShell } from '../landing/landing-shell';
import { SectionHeading } from '../landing/section-heading';
import { ContactChannels } from './contact-channels';
import { ContactForm } from './contact-form';
import { CONTACT } from './contact.messages';

type Props = {
  adminLoginUrl: string;
  adminRegisterUrl: string;
  panelSupportUrl: string;
  studentSupportUrl: string;
};

export function PlatformContactPage({
  adminLoginUrl,
  adminRegisterUrl,
  panelSupportUrl,
  studentSupportUrl,
}: Props) {
  return (
    <LandingShell loginUrl={adminLoginUrl} registerUrl={adminRegisterUrl}>
      <section className="bg-lp-hero pt-36 pb-16 lg:pt-44 lg:pb-20">
        <Container>
          <SectionHeading
            as="h1"
            eyebrow={CONTACT.hero.eyebrow}
            title={
              <>
                {CONTACT.hero.titleLead}
                <CircledWord>{CONTACT.hero.titleCircled}</CircledWord>
                {CONTACT.hero.titleAfter}
              </>
            }
            subtitle={CONTACT.hero.subtitle}
          />
        </Container>
      </section>

      <section className="bg-lp-surface py-14 lg:py-20">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start">
            <ContactForm />
            <ContactChannels
              panelSupportUrl={panelSupportUrl}
              studentSupportUrl={studentSupportUrl}
            />
          </div>
        </Container>
      </section>
    </LandingShell>
  );
}
