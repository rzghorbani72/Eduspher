'use client';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { isRTL as languageIsRtl, DEFAULT_LANGUAGE } from '@/lib/i18n/config';
import { useI18nOptional } from '@/lib/i18n/provider';

const TOAST_WIDTH = 420;

/** Same toast surface as AdminPanel, so both apps report the same way. */
export function ToastContainerWrapper() {
  const i18n = useI18nOptional();
  const rtl = i18n?.isRTL ?? languageIsRtl(DEFAULT_LANGUAGE);

  return (
    <ToastContainer
      position="bottom-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={rtl}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      style={{
        bottom: '24px',
        right: '24px',
        width: `min(${TOAST_WIDTH}px, calc(100vw - 32px))`,
        zIndex: 9999,
      }}
      toastStyle={{
        fontSize: '15px',
        lineHeight: '1.7',
        minHeight: '72px',
        padding: '14px 16px',
        borderRadius: '12px',
      }}
    />
  );
}
