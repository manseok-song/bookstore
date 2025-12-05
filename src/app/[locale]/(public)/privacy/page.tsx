import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'privacy' });
  return {
    title: t('title'),
  };
}

export default function PrivacyPage() {
  const t = useTranslations('privacy');

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>

      <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-4">{t('sections.collection.title')}</h2>
          <p className="text-muted-foreground">{t('sections.collection.content')}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">{t('sections.usage.title')}</h2>
          <p className="text-muted-foreground">{t('sections.usage.content')}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">{t('sections.cookies.title')}</h2>
          <p className="text-muted-foreground">{t('sections.cookies.content')}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">{t('sections.sharing.title')}</h2>
          <p className="text-muted-foreground">{t('sections.sharing.content')}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">{t('sections.security.title')}</h2>
          <p className="text-muted-foreground">{t('sections.security.content')}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">{t('sections.contact.title')}</h2>
          <p className="text-muted-foreground">{t('sections.contact.content')}</p>
        </section>

        <p className="text-sm text-muted-foreground mt-8">{t('lastUpdated')}: 2024-01-01</p>
      </div>
    </div>
  );
}
