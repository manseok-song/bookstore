import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Inter } from 'next/font/google';
import { locales, type Locale } from '@/i18n/config';
import { Providers } from '../providers';
import { LayoutWrapper } from '@/components/layout';
import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  // 유효한 로케일인지 확인
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // 로케일 설정
  setRequestLocale(locale);

  // 메시지 로드
  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <LayoutWrapper>{children}</LayoutWrapper>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
