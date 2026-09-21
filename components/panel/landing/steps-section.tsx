import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

import { LANDING } from './landing.messages';
import {
  StepCreatedMock,
  StepCustomizeMock,
  StepFormMock,
  StepPublishMock,
  StepTemplateMock,
  StepUploadMock,
} from './mockups/step-mocks';
import { SectionLabel } from './section-label';

const M = LANDING.steps;
const MOCKS: readonly ReactNode[] = [
  <StepFormMock key="form" />,
  <StepCreatedMock key="created" />,
  <StepTemplateMock key="template" />,
  <StepCustomizeMock key="customize" />,
  <StepUploadMock key="upload" />,
  <StepPublishMock key="publish" />,
];

export function StepsSection() {
  return (
    <section id="steps" className="bg-lp-surface-2 border-lp-ink/8 border-y">
      <div className="mx-auto max-w-[1180px] px-5 py-16 md:px-7 md:py-24">
        <SectionLabel number={M.number} label={M.label} />
        <h2 className="mt-6 text-[27px] font-extrabold tracking-[-.015em] md:text-[40px]">
          {M.title}
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {M.items.map((item, index) => {
            const last = index === M.items.length - 1;
            return (
              <article
                key={item.number}
                className={cn(
                  'rounded-[18px] bg-white p-5',
                  last ? 'border-lp-mint border-[1.5px]' : 'border-lp-line border',
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      'text-[13px] font-extrabold',
                      last ? 'text-lp-green' : 'text-lp-blue',
                    )}
                  >
                    {item.number}
                  </span>
                  <p className="text-[14.5px] leading-[1.8] font-bold">{item.text}</p>
                </div>
                {MOCKS[index]}
              </article>
            );
          })}
        </div>
        <p className="text-lp-muted-2 mt-8 max-w-[760px] text-[14.5px] leading-loose">
          {M.footnote}
        </p>
      </div>
    </section>
  );
}
