// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Session Replay (선택사항)
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Debug mode in development
    debug: process.env.NODE_ENV === 'development',

    // 에러 필터링
    beforeSend(event, hint) {
      // 개발 환경에서는 콘솔에만 출력
      if (process.env.NODE_ENV === 'development') {
        console.error('Sentry event:', event);
        return null; // 개발 환경에서는 전송 안 함
      }

      return event;
    },

    // 무시할 에러
    ignoreErrors: [
      // 브라우저 확장 프로그램 에러
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      // 네트워크 에러
      'Failed to fetch',
      'NetworkError',
      'Load failed',
      // 사용자 취소
      'AbortError',
    ],

    // 환경 설정
    environment: process.env.NODE_ENV,

    // 릴리즈 버전 (선택사항)
    // release: process.env.NEXT_PUBLIC_APP_VERSION,
  });
}
