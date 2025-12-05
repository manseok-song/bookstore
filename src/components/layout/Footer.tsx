import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { BookOpen } from 'lucide-react';

export function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6" />
              <span className="font-bold text-xl">PubStation</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Free public domain e-books for everyone.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h4 className="font-semibold">Navigation</h4>
            <nav className="flex flex-col space-y-2 text-sm text-muted-foreground">
              <Link href="/browse" className="hover:text-primary transition-colors">
                Browse Books
              </Link>
              <Link href="/search" className="hover:text-primary transition-colors">
                Search
              </Link>
              <Link href="/pricing" className="hover:text-primary transition-colors">
                Pricing
              </Link>
            </nav>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="font-semibold">Legal</h4>
            <nav className="flex flex-col space-y-2 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-primary transition-colors">
                {t('privacy')}
              </Link>
              <Link href="/terms" className="hover:text-primary transition-colors">
                {t('terms')}
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold">{t('contact')}</h4>
            <nav className="flex flex-col space-y-2 text-sm text-muted-foreground">
              <Link href="/about" className="hover:text-primary transition-colors">
                {t('about')}
              </Link>
              <a href="mailto:support@pubstation.com" className="hover:text-primary transition-colors">
                support@pubstation.com
              </a>
            </nav>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          {t('copyright')}
        </div>
      </div>
    </footer>
  );
}
