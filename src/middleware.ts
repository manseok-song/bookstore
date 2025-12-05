import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '@/i18n/config';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

export const config = {
  // 모든 경로에 대해 로케일 리다이렉트 적용 (api, _next, 정적 파일 제외)
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
