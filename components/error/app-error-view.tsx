"use client";

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
      className="lp-root relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-lp-hero px-6 py-16 text-center font-[Vazirmatn,system-ui,sans-serif] text-lp-ink antialiased"
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
          <div
            aria-hidden
            className="absolute inset-0 rounded-full bg-lp-mint/25 blur-md"
          />
          {/* Plain img: global-error has no Next image pipeline guarantees */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-mark.svg"
            alt=""
            width={56}
            height={56}
            className="relative"
          />
        </div>

        <div className="mt-4 text-[clamp(72px,14vw,128px)] font-black leading-none text-lp-blue">
          ۵۰۰
        </div>

        <h1 className="mt-3 text-[clamp(22px,3vw,32px)] font-extrabold tracking-[-0.022em] text-lp-ink">
          مشکلی پیش آمد
        </h1>

        <p className="mx-auto mt-4 max-w-[440px] text-base leading-[1.85] text-lp-muted lg:text-[17px]">
          نگران نباش — این از سمت ماست، نه تو. تیم فنی منتوما در حال بررسی است.
          لطفاً چند لحظه دیگر دوباره تلاش کن.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="flex h-14 items-center justify-center rounded-lp bg-lp-mint px-8 text-[16px] font-bold text-lp-ink shadow-lp-mint transition-transform hover:-translate-y-0.5"
          >
            تلاش دوباره
          </button>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- works in global-error when the router tree is down */}
          <a
            href="/contact"
            className="flex h-14 items-center justify-center rounded-lp border border-lp-line-2 bg-white px-8 text-[15px] font-semibold text-lp-ink transition-colors hover:border-lp-ink/25"
          >
            تماس با پشتیبانی
          </a>
        </div>
      </div>
    </div>
  );
}
