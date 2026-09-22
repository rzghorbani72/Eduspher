import { CheckList } from './check-list';
import { FlowRail } from './flow-rail';
import { LANDING } from './landing.messages';
import { CourseMock } from './mockups/course-mock';

const M = LANDING.courses;

export function CoursesSection() {
  return (
    <section id="courses" className="mx-auto max-w-[1180px] px-5 py-16 md:px-7 md:py-24">
      <h2 className="mt-6 text-[27px] font-extrabold tracking-[-.015em] md:text-[38px]">
        {M.title}
      </h2>
      <FlowRail steps={[M.flowFirst, ...M.flow]} active={0} className="mt-7" />
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)] lg:items-start">
        <CourseMock />
        <CheckList items={M.points} size="lg" />
      </div>
    </section>
  );
}
