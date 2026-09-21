import { cn } from '@/lib/utils';

import { LANDING } from './landing.messages';
import { PersonaAcademyMock, PersonaTeacherMock } from './mockups/persona-mocks';
import { SectionLabel } from './section-label';
import { StartFreeLink } from './quick-signup/start-free-link';

type Props = { registerUrl: string };

const M = LANDING.personas;

type CardProps = {
  title: string;
  body: string;
  features: readonly string[];
  tone: 'blue' | 'mint';
  registerUrl: string;
  mock: React.ReactNode;
};

function PersonaCard({ title, body, features, tone, registerUrl, mock }: CardProps) {
  return (
    <article className="border-lp-line shadow-lp-card flex flex-col rounded-[20px] border bg-white p-6 transition-transform hover:-translate-y-0.5">
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            'size-[9px] rounded-[3px]',
            tone === 'blue' ? 'bg-lp-blue-2' : 'bg-lp-mint',
          )}
        />
        <h3 className="text-[21px] font-extrabold tracking-tight">{title}</h3>
      </div>
      <p className="text-lp-muted mt-3 text-[15px] leading-[2.05]">{body}</p>
      {mock}
      <ul className="text-lp-ink-2 mt-5 flex flex-wrap gap-x-4 gap-y-2 text-[13.5px] font-semibold">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-1.5">
            <span className="text-lp-blue">✓</span>
            {feature}
          </li>
        ))}
      </ul>
      <StartFreeLink
        href={registerUrl}
        className="bg-lp-mint text-lp-on-mint mt-6 inline-block w-fit rounded-[13px] px-5 py-3 text-[14.5px] font-bold"
      >
        {M.cta}
      </StartFreeLink>
    </article>
  );
}

export function PersonasSection({ registerUrl }: Props) {
  return (
    <section id="personas" className="mx-auto max-w-[1180px] px-5 py-16 md:px-7 md:py-24">
      <SectionLabel number={M.number} label={M.label} />
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)] lg:items-end">
        <h2 className="text-[27px] leading-[1.32] font-extrabold tracking-[-.015em] md:text-[40px]">
          {M.title}
        </h2>
        <p className="text-lp-muted text-[16px] leading-loose">{M.subtitle}</p>
      </div>

      <div className="lp-rail border-lp-line mt-9 flex items-stretch overflow-x-auto rounded-2xl border bg-white">
        {M.ladder.map((step, index) => {
          const last = index === M.ladder.length - 1;
          return (
            <div key={step.stage} className="contents">
              {index > 0 ? <div className="bg-lp-ink/9 w-px" /> : null}
              <div className={cn('flex-1 px-5 py-4 whitespace-nowrap', last && 'bg-lp-mint-tint')}>
                <div
                  className={cn(
                    'text-[11px] font-bold',
                    last ? 'text-lp-green' : 'text-lp-faint-2',
                  )}
                >
                  {step.stage}
                </div>
                <div className={cn('mt-1 text-[14px] font-extrabold', last && 'text-lp-on-mint')}>
                  {step.text}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <PersonaCard
          title={M.teacher.title}
          body={M.teacher.body}
          features={M.teacher.features}
          tone="blue"
          registerUrl={registerUrl}
          mock={<PersonaTeacherMock />}
        />
        <PersonaCard
          title={M.academy.title}
          body={M.academy.body}
          features={M.academy.features}
          tone="mint"
          registerUrl={registerUrl}
          mock={<PersonaAcademyMock />}
        />
      </div>
    </section>
  );
}
