'use client';

import { useState } from 'react';
import { AboutHeader } from '../platform-about/about-header';
import { AboutFooter } from '../platform-about/about-footer';

type Theme = 'light' | 'dark';

const sections = [
  {
    title: '۱. چه اطلاعاتی جمع‌آوری می‌کنیم',
    body: 'اطلاعات هویتی (نام، ایمیل، شماره موبایل، اطلاعات حساب)، سابقهٔ یادگیری (دوره‌ها، آزمون‌ها، نمرات، بازخورد، حضور، تکالیف)، سوابق مالی (اطلاعات کارت نزد ما ذخیره نمی‌شود؛ پرداخت در درگاه بانکی انجام می‌شود) و اطلاعات فنی (IP، مرورگر و گزارش‌های امنیتی).',
  },
  {
    title: '۲. چرا و بر چه مبنایی',
    body: 'داده‌ها برای ارائهٔ خدمت، پردازش پرداخت، پشتیبانی، امنیت و الزامات قانونی (از جمله مالیاتی) پردازش می‌شوند. پذیرش این سیاست هنگام ثبت‌نام، مبنای رضایت شماست.',
  },
  {
    title: '۳. مالکیت سابقهٔ یادگیری',
    body: 'سابقهٔ یادگیری متعلق به آکادمی و دانشجوست؛ منتوما تنها امانت‌دار آن است و از آن برای مقاصد خارج از ارائهٔ خدمت استفاده نمی‌کند.',
  },
  {
    title: '۴. اشتراک‌گذاری داده',
    body: 'داده‌ها فروخته نمی‌شوند. اشتراک‌گذاری تنها با آکادمی مربوط به شما، درگاه‌های پرداخت (برای تراکنش)، ارائه‌دهندگان زیرساخت (طبق قرارداد محرمانگی) و مراجع قانونی در حدود الزام قانونی انجام می‌شود.',
  },
  {
    title: '۵. نگهداری و حذف',
    body: 'داده‌ها تا زمان لازم برای ارائهٔ خدمت و رعایت الزامات قانونی (مثلاً نگهداری اسناد مالی) حفظ می‌شوند. پس از خاتمهٔ حساب، سابقهٔ یادگیری تا ۹۰ روز برای امکان خروجی‌گیری نگه داشته و سپس حذف می‌شود.',
  },
  {
    title: '۶. امنیت داده‌ها',
    body: 'از رمزنگاری، کنترل دسترسی نقش‌محور و ایزولاسیون چندمستأجری برای حفاظت داده استفاده می‌کنیم. هیچ سامانه‌ای صددرصد ایمن نیست؛ در صورت رخنهٔ امنیتیِ مؤثر، مطابق قانون اطلاع‌رسانی می‌کنیم.',
  },
  {
    title: '۷. حقوق شما و کوکی‌ها',
    body: 'دسترسی، اصلاح و درخواست حذف داده‌های شخصی (در حدودی که الزامات قانونی اجازه می‌دهد) از طریق پشتیبانی امکان‌پذیر است. از کوکی‌های ضروری برای ورود و امنیت استفاده می‌کنیم.',
  },
  {
    title: '۸. تماس با ما',
    body: 'اگر درباره‌ی حریم خصوصی سوالی دارید، از طریق ایمیل hello@mentoma.ir با ما در ارتباط باشید.',
  },
];

export function PlatformPrivacyPage({
  adminRegisterUrl,
  bindingUrl,
}: {
  adminRegisterUrl: string;
  bindingUrl: string;
}) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light';
    try {
      const saved = localStorage.getItem('landing-theme') as Theme | null;
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {}
    return 'light';
  });

  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try {
      localStorage.setItem('landing-theme', next);
    } catch {}
  };

  return (
    <div
      className={`landing-page${theme === 'dark' ? 'theme-dark' : ''}`}
      dir="rtl"
      style={{
        position: 'relative',
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--ink)',
        overflowX: 'clip',
        lineHeight: 1.6,
        fontFamily: "'Vazirmatn', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          overflow: 'hidden',
        }}
      >
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

      <AboutHeader theme={theme} toggleTheme={toggleTheme} adminRegisterUrl={adminRegisterUrl} />

      <main
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 820,
          margin: '0 auto',
          padding: '0 22px',
        }}
      >
        <section style={{ padding: '150px 0 8px', textAlign: 'center' }}>
          <span
            style={{
              display: 'inline-block',
              padding: '6px 14px',
              borderRadius: 999,
              background: 'var(--brand-soft)',
              color: 'var(--brand)',
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            حریم خصوصی
          </span>
          <h1
            style={{
              margin: '20px auto 0',
              fontSize: 'clamp(32px,4.6vw,52px)',
              fontWeight: 900,
              lineHeight: 1.18,
              letterSpacing: '-.015em',
            }}
          >
            سیاست حریم خصوصی
          </h1>
          <p style={{ margin: '14px 0 0', fontSize: 14, color: 'var(--ink-3)' }}>
            آخرین به‌روزرسانی: خرداد ۱۴۰۴
          </p>
          <p style={{ margin: '10px auto 0', maxWidth: 560, fontSize: 13, color: 'var(--ink-3)' }}>
            این صفحه خلاصه‌ای برای آشناییِ اولیه است. نسخهٔ کامل و حاکمِ سیاست حریم خصوصی هنگام ساخت
            آکادمی در{' '}
            <a href={bindingUrl} style={{ color: 'var(--brand)', fontWeight: 700 }}>
              پنل آکادمی
            </a>{' '}
            نمایش و پذیرفته می‌شود؛ در صورت مغایرت، همان نسخه ملاک است.
          </p>
        </section>

        <article
          style={{
            marginTop: 30,
            padding: 40,
            borderRadius: 'var(--r-xl)',
            border: '1px solid var(--bd)',
            background: 'var(--card)',
            boxShadow: 'var(--sh)',
            textAlign: 'right',
          }}
        >
          {sections.map((section, i) => (
            <div key={section.title} style={{ marginTop: i === 0 ? 0 : 30 }}>
              <h2 style={{ margin: 0, fontSize: 21, fontWeight: 800, letterSpacing: '-.01em' }}>
                {section.title}
              </h2>
              <p
                style={{
                  margin: '12px 0 0',
                  fontSize: 15.5,
                  color: 'var(--ink-2)',
                  lineHeight: 1.95,
                }}
              >
                {section.body}
              </p>
            </div>
          ))}
        </article>
      </main>

      <AboutFooter />
    </div>
  );
}
