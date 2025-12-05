import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'terms' });
  return {
    title: t('title'),
  };
}

export default function TermsPage() {
  const t = useTranslations('terms');

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>

      <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-4">{t('sections.acceptance.title')}</h2>
          <p className="text-muted-foreground">{t('sections.acceptance.content')}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">{t('sections.service.title')}</h2>
          <p className="text-muted-foreground">{t('sections.service.content')}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">{t('sections.account.title')}</h2>
          <p className="text-muted-foreground">{t('sections.account.content')}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">{t('sections.content.title')}</h2>
          <p className="text-muted-foreground">{t('sections.content.content')}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">{t('sections.intellectual.title')}</h2>
          <p className="text-muted-foreground">{t('sections.intellectual.content')}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">{t('sections.termination.title')}</h2>
          <p className="text-muted-foreground">{t('sections.termination.content')}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">{t('sections.liability.title')}</h2>
          <p className="text-muted-foreground">{t('sections.liability.content')}</p>
        </section>

        <p className="text-sm text-muted-foreground mt-8">{t('lastUpdated')}: 2024-01-01</p>
      </div>
    </div>
  );
}
