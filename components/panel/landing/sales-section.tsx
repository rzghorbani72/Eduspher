import { LANDING } from './landing.messages';
import { SalesMock } from './mockups/sales-mock';

const M = LANDING.sales;

export function SalesSection() {
  return (
    <section id="sales">
      <div className="mx-auto max-w-[1180px] px-5 py-16 md:px-7 md:py-24">
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:items-center">
          <div>
            <h2 className="text-[27px] font-extrabold tracking-[-.015em] md:text-[38px]">
              {M.title}
            </h2>
            <p className="text-lp-muted mt-4 text-[16px] leading-loose">{M.subtitle}</p>
            <p className="bg-lp-navy mt-6 rounded-2xl px-5 py-5 text-[17px] leading-[1.85] font-extrabold text-white">
              {M.promiseLead}
              <span className="text-lp-mint">{M.promiseStrong}</span>
              {M.promiseTail}
            </p>
          </div>
          <SalesMock />
        </div>
      </div>
    </section>
  );
}
