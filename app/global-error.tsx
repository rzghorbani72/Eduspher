'use client'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;700;900&display=swap');
          *{box-sizing:border-box;margin:0;padding:0}
          body{
            font-family:'Vazirmatn',system-ui,sans-serif;
            -webkit-font-smoothing:antialiased;
            background:#ffffff;
            color:#121430;
            min-height:100vh;
            display:grid;
            place-items:center;
            text-align:center;
            padding:24px;
            overflow-x:hidden;
            position:relative;
          }
          .orb1{
            position:fixed;top:-14%;right:-8%;width:44vw;height:44vw;
            border-radius:50%;pointer-events:none;z-index:0;
            background:radial-gradient(circle at 40% 40%,rgba(124,108,255,.26),transparent 62%);
            filter:blur(22px);
          }
          .orb2{
            position:fixed;top:40%;left:-12%;width:40vw;height:40vw;
            border-radius:50%;pointer-events:none;z-index:0;
            background:radial-gradient(circle at 50% 50%,rgba(79,140,255,.2),transparent 64%);
            filter:blur(24px);
          }
          .content{position:relative;z-index:1;padding:60px 0}
          .icon-wrap{
            position:relative;width:150px;height:150px;
            margin:0 auto;display:grid;place-items:center;
          }
          .icon-glow{
            position:absolute;inset:0;border-radius:50%;
            background:linear-gradient(135deg,rgba(124,108,255,.16),rgba(79,140,255,.10));
            filter:blur(6px);
          }
          .num{
            margin-top:18px;font-weight:900;line-height:1;
            font-size:clamp(80px,16vw,140px);
            background:linear-gradient(135deg,#7c6cff 0%,#4f8cff 100%);
            -webkit-background-clip:text;background-clip:text;
            -webkit-text-fill-color:transparent;color:transparent;
          }
          h1{margin-top:10px;font-size:clamp(26px,3.6vw,38px);font-weight:900;letter-spacing:-.015em}
          p{margin:16px auto 0;max-width:440px;font-size:17px;color:#4c4f6e;line-height:1.85}
          .btns{margin-top:30px;display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap}
          .btn-primary{
            padding:15px 28px;border-radius:999px;border:none;cursor:pointer;
            color:#fff;font-weight:700;font-size:16px;font-family:inherit;
            background:linear-gradient(135deg,#7c6cff 0%,#4f8cff 100%);
            box-shadow:0 16px 34px -12px rgba(109,94,252,.7);
            transition:transform .15s;
          }
          .btn-primary:hover{transform:translateY(-2px)}
          .btn-ghost{
            padding:15px 26px;border-radius:999px;text-decoration:none;
            color:#121430;font-weight:700;font-size:16px;
            background:#fff;border:1px solid rgba(18,20,50,.09);
            transition:border-color .15s;
          }
          .btn-ghost:hover{border-color:#6d5efc}
        `}</style>
      </head>
      <body>
        <div className="orb1" />
        <div className="orb2" />
        <div className="content">
          <div className="icon-wrap">
            <div className="icon-glow" />
            <svg width="74" height="74" viewBox="0 0 24 24" fill="none" style={{ position: 'relative' }}>
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

          <div className="num">۵۰۰</div>

          <h1>مشکلی پیش آمد</h1>

          <p>
            نگران نباش — این از سمت ماست، نه تو. تیم فنی منتوما در حال بررسی
            است. لطفاً چند لحظه دیگر دوباره تلاش کن.
          </p>

          <div className="btns">
            <button className="btn-primary" onClick={reset}>
              تلاش دوباره
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a className="btn-ghost" href="/contact">
              تماس با پشتیبانی
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
