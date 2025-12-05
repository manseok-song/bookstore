export const locales = ['en', 'ko', 'zh', 'ja', 'es'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  ko: '한국어',
  zh: '中文',
  ja: '日本語',
  es: 'Español',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  ko: '🇰🇷',
  zh: '🇨🇳',
  ja: '🇯🇵',
  es: '🇪🇸',
};
