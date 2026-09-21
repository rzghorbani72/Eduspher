import { LANDING } from './landing.messages';
import { AcademyMultiMock, AcademyRolesMock, AcademyTeachersMock } from './mockups/academy-mocks';
import { SectionLabel } from './section-label';

const M = LANDING.academy;

const CARDS = [
  { ...M.teachers, mock: <AcademyTeachersMock /> },
  { ...M.roles, mock: <AcademyRolesMock /> },
  { ...M.multi, mock: <AcademyMultiMock /> },
] as const;

export function AcademySection() {
  return (
    <section id="academy" className="mx-auto max-w-[1180px] px-5 py-16 md:px-7 md:py-24">
      <SectionLabel number={M.number} label={M.label} />
      <p className="text-lp-blue mt-6 text-[13.5px] font-bold">{M.kicker}</p>
      <div className="mt-3 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-end">
        <h2 className="text-[27px] font-extrabold tracking-[-.015em] md:text-[40px]">{M.title}</h2>
        <p className="text-lp-muted text-[16px] leading-loose">{M.subtitle}</p>
      </div>
      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {CARDS.map((card) => (
          <article key={card.title} className="border-lp-line rounded-[20px] border bg-white p-5">
            <h3 className="text-[17.5px] font-extrabold tracking-tight">{card.title}</h3>
            <p className="text-lp-muted mt-2.5 text-[14.5px] leading-[1.95]">{card.body}</p>
            <div className="bg-lp-surface-3 border-lp-line-soft mt-4 rounded-2xl border p-3.5">
              {card.mock}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
