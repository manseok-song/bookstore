'use client';

import { useLocale } from 'next-intl';
import { usePathname as useNextPathname, useRouter as useNextRouter } from 'next/navigation';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { locales, localeNames, localeFlags, type Locale } from '@/i18n/config';

export function LanguageSelector() {
  const locale = useLocale() as Locale;
  const pathname = useNextPathname();
  const router = useNextRouter();

  const handleLocaleChange = (newLocale: Locale) => {
    // 현재 경로에서 로케일 부분을 새 로케일로 교체
    const segments = pathname.split('/');
    // segments[0]은 빈 문자열, segments[1]은 로케일
    if (locales.includes(segments[1] as Locale)) {
      segments[1] = newLocale;
    } else {
      // 로케일이 없으면 추가
      segments.splice(1, 0, newLocale);
    }
    const newPath = segments.join('/') || `/${newLocale}`;
    router.push(newPath);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="h-5 w-5" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className={`cursor-pointer ${loc === locale ? 'bg-accent' : ''}`}
          >
            <span className="mr-2">{localeFlags[loc]}</span>
            {localeNames[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
