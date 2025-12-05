import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight, BookOpen, Globe, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { localeNames, localeFlags, type Locale } from '@/i18n/config';

export default function HomePage() {
  const t = useTranslations('home');
  const tNav = useTranslations('nav');
  const tPricing = useTranslations('pricing');

  const languages = Object.entries(localeNames).map(([code, name]) => ({
    code: code as Locale,
    name,
    flag: localeFlags[code as Locale],
  }));

  const genres = [
    { id: 'fiction', name: t('genres.fiction'), icon: '📚' },
    { id: 'classic', name: t('genres.classic'), icon: '🏛️' },
    { id: 'mystery', name: t('genres.mystery'), icon: '🔍' },
    { id: 'romance', name: t('genres.romance'), icon: '💕' },
    { id: 'philosophy', name: t('genres.philosophy'), icon: '💭' },
    { id: 'history', name: t('genres.history'), icon: '📜' },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            {t('hero.title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/browse">
              <Button size="lg" className="w-full sm:w-auto">
                {t('hero.cta')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                {tNav('signUp')}
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">10,000+</div>
              <div className="text-sm text-muted-foreground">{t('stats.books')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">5</div>
              <div className="text-sm text-muted-foreground">{t('stats.languages')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground">{t('stats.free')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{t('features.free.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('features.free.description')}
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{t('features.languages.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('features.languages.description')}
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{t('features.reader.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('features.reader.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Browse by Language */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">{t('byLanguage')}</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {languages.map((lang) => (
              <Link key={lang.code} href={`/browse?language=${lang.code.toUpperCase()}`}>
                <Button variant="outline" className="h-auto py-4 px-6">
                  <span className="text-2xl mr-2">{lang.flag}</span>
                  <span>{lang.name}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by Genre */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">{t('byGenre')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {genres.map((genre) => (
              <Link key={genre.id} href={`/browse?genre=${genre.id.toUpperCase()}`}>
                <div className="bg-background rounded-lg p-6 text-center hover:shadow-md transition-shadow cursor-pointer">
                  <span className="text-3xl mb-2 block">{genre.icon}</span>
                  <span className="font-medium text-sm">{genre.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">{t('cta.title')}</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            {t('cta.description')}
          </p>
          <Link href="/auth/signup">
            <Button size="lg">
              {tPricing('free.cta')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
