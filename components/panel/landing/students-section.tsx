import { CheckList } from './check-list';
import { LANDING } from './landing.messages';
import { StudentsTableMock } from './mockups/students-table-mock';
import { SectionLabel } from './section-label';

const M = LANDING.students;

export function StudentsSection() {
  return (
    <section id="students" className="bg-lp-surface-2 border-lp-ink/8 border-y">
      <div className="mx-auto max-w-[1180px] px-5 py-16 md:px-7 md:py-24">
        <SectionLabel number={M.number} label={M.label} />
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:items-center">
          <div>
            <h2 className="text-[27px] leading-[1.32] font-extrabold tracking-[-.015em] md:text-[38px]">
              {M.title}
            </h2>
            <p className="text-lp-muted mt-4 text-[16px] leading-loose">{M.subtitle}</p>
            <CheckList items={M.points} className="mt-7" />
          </div>
          <StudentsTableMock />
        </div>
      </div>
    </section>
  );
}
