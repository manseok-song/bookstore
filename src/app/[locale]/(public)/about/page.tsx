import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { BookOpen, Globe, Users, Heart } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about' });
  return {
    title: t('title'),
  };
}

export default function AboutPage() {
  const t = useTranslations('about');

  const features = [
    {
      icon: BookOpen,
      title: t('features.books.title'),
      description: t('features.books.description'),
    },
    {
      icon: Globe,
      title: t('features.languages.title'),
      description: t('features.languages.description'),
    },
    {
      icon: Users,
      title: t('features.community.title'),
      description: t('features.community.description'),
    },
    {
      icon: Heart,
      title: t('features.free.title'),
      description: t('features.free.description'),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-4">{t('title')}</h1>
      <p className="text-lg text-muted-foreground mb-12">{t('subtitle')}</p>

      {/* Mission */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">{t('mission.title')}</h2>
        <p className="text-muted-foreground">{t('mission.content')}</p>
      </section>

      {/* Features Grid */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">{t('whyChoose')}</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="flex gap-4 p-4 rounded-lg border bg-card">
              <feature.icon className="h-8 w-8 text-primary shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Public Domain */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">{t('publicDomain.title')}</h2>
        <p className="text-muted-foreground">{t('publicDomain.content')}</p>
      </section>

      {/* Contact */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">{t('contact.title')}</h2>
        <p className="text-muted-foreground">{t('contact.content')}</p>
        <p className="text-muted-foreground mt-2">
          Email: <a href="mailto:support@pubstation.com" className="text-primary hover:underline">support@pubstation.com</a>
        </p>
      </section>
    </div>
  );
}
