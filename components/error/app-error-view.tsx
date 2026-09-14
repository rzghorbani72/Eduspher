'use client';

type Props = {
  reset: () => void;
};

/**
 * Shared 500 view for `error.tsx` and `global-error.tsx`.
 * Visual language matches the platform landing (`lp-*` tokens), not academy themes.
 */
export function AppErrorView({ reset }: Props) {
  return (
    <div
      dir="rtl"
      data-theme="light"
      className="lp-root bg-lp-hero text-lp-ink relative flex min-h-[80vh] items-center justify-center overflow-hidden px-6 py-16 text-center font-[Vazirmatn,system-ui,sans-serif] antialiased"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -end-[8%] -top-[14%] h-[44vw] w-[44vw] rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(48,255,180,0.28),transparent_62%)] blur-[22px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -start-[12%] top-[40%] h-[40vw] w-[40vw] rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(27,152,224,0.18),transparent_64%)] blur-[24px]"
      />

      <div className="relative z-10">
        <div className="relative mx-auto grid h-28 w-28 place-items-center">
          <div aria-hidden className="bg-lp-mint/25 absolute inset-0 rounded-full blur-md" />
          {/* Plain img: global-error has no Next image pipeline guarantees */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mark.svg" alt="" width={56} height={56} className="relative" />
        </div>

        <div className="text-lp-blue mt-4 text-[clamp(72px,14vw,128px)] leading-none font-black">
          ۵۰۰
        </div>

        <h1 className="text-lp-ink mt-3 text-[clamp(22px,3vw,32px)] font-extrabold tracking-[-0.022em]">
          مشکلی پیش آمد
        </h1>

        <p className="text-lp-muted mx-auto mt-4 max-w-[440px] text-base leading-[1.85] lg:text-[17px]">
          نگران نباش — این از سمت ماست، نه تو. تیم فنی منتوما در حال بررسی است. لطفاً چند لحظه دیگر
          دوباره تلاش کن.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-lp bg-lp-mint text-lp-ink shadow-lp-mint flex h-14 items-center justify-center px-8 text-[16px] font-bold transition-transform hover:-translate-y-0.5"
          >
            تلاش دوباره
          </button>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- works in global-error when the router tree is down */}
          <a
            href="/contact"
            className="rounded-lp border-lp-line-2 text-lp-ink hover:border-lp-ink/25 flex h-14 items-center justify-center border bg-white px-8 text-[15px] font-semibold transition-colors"
          >
            تماس با پشتیبانی
          </a>
        </div>
      </div>
    </div>
  );
}
