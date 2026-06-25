'use client'

import Link from 'next/link'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div
      dir="rtl"
      className="relative flex min-h-[80vh] items-center justify-center overflow-hidden text-center"
    >
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          style={{
            position: 'absolute',
            top: '-14%',
            right: '-8%',
            width: '44vw',
            height: '44vw',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 40% 40%,rgba(124,108,255,.26),transparent 62%)',
            filter: 'blur(22px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '40%',
            left: '-12%',
            width: '40vw',
            height: '40vw',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 50% 50%,rgba(79,140,255,.2),transparent 64%)',
            filter: 'blur(24px)',
          }}
        />
      </div>

      <div className="px-6 py-16">
        <div className="relative mx-auto mb-4 grid h-36 w-36 place-items-center">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'linear-gradient(135deg,rgba(124,108,255,.16),rgba(79,140,255,.10))',
              filter: 'blur(6px)',
            }}
          />
          <svg
            width="74"
            height="74"
            viewBox="0 0 24 24"
            fill="none"
            className="relative"
          >
            <circle cx="6" cy="7" r="2.6" fill="#6d5efc" />
            <circle cx="18" cy="6" r="2.6" fill="#4f8cff" />
            <circle cx="12" cy="17" r="3" fill="#6d5efc" />
            <path
              d="M7.6 8.4 11 15M16.6 7.2 13 15M8 7.3l8-1"
              stroke="#6d5efc"
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity=".55"
            />
          </svg>
        </div>

        <div
          className="font-black leading-none"
          style={{
            fontSize: 'clamp(80px,16vw,140px)',
            background: 'linear-gradient(135deg,#7c6cff 0%,#4f8cff 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent',
          }}
        >
          ۵۰۰
        </div>

        <h1
          className="mt-2.5 font-black tracking-tight"
          style={{ fontSize: 'clamp(26px,3.6vw,38px)' }}
        >
          مشکلی پیش آمد
        </h1>

        <p
          className="mx-auto mt-4 max-w-[440px] leading-[1.85] opacity-70"
          style={{ fontSize: '17px' }}
        >
          نگران نباش — این از سمت ماست، نه تو. تیم فنی منتوما در حال بررسی
          است. لطفاً چند لحظه دیگر دوباره تلاش کن.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-full px-7 py-4 text-base font-bold text-white transition hover:-translate-y-0.5"
            style={{
              background: 'linear-gradient(135deg,#7c6cff 0%,#4f8cff 100%)',
              boxShadow: '0 16px 34px -12px rgba(109,94,252,.7)',
            }}
          >
            تلاش دوباره
          </button>
          <Link
            href="/contact"
            className="rounded-full border px-7 py-4 text-base font-bold transition"
            style={{ borderColor: 'rgba(18,20,50,.09)' }}
          >
            تماس با پشتیبانی
          </Link>
        </div>
      </div>
    </div>
  )
}
