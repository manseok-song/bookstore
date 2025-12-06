'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();

  // 리더 페이지에서는 Header/Footer 숨김
  const isReaderPage = pathname?.includes('/reader/');

  if (isReaderPage) {
    // 리더 페이지: 전체 화면 몰입형 레이아웃
    return <>{children}</>;
  }

  // 일반 페이지: Header + Content + Footer
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
