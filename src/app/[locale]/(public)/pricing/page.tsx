'use client';

import { Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function PricingContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const t = useTranslations('pricing');

  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');

  const handleSubscribe = async () => {
    if (!session) {
      window.location.href = '/auth/signin';
      return;
    }

    try {
      const response = await fetch('/api/subscription/checkout', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.data?.url) {
        window.location.href = data.data.url;
      }
    } catch (error) {
      console.error('Failed to create checkout session:', error);
    }
  };

  const isPremium = session?.user?.subscriptionStatus === 'PREMIUM';

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Success/Cancel messages */}
      {success && (
        <div className="mb-8 p-4 bg-green-50 text-green-700 rounded-lg text-center">
          Subscription successful! Welcome to Premium.
        </div>
      )}
      {canceled && (
        <div className="mb-8 p-4 bg-yellow-50 text-yellow-700 rounded-lg text-center">
          Subscription canceled. You can try again anytime.
        </div>
      )}

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Start reading for free or unlock unlimited access with Premium
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{t('free.name')}</CardTitle>
            <CardDescription>
              <span className="text-4xl font-bold">{t('free.price')}</span>
              <span className="text-muted-foreground"> / {t('free.period')}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {['3 books per month', 'Basic reading features', '5 languages supported', 'Reading progress sync'].map((feature, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" disabled>
              {session ? 'Current Plan' : t('free.cta')}
            </Button>
          </CardFooter>
        </Card>

        {/* Premium Plan */}
        <Card className="border-primary relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="h-4 w-4" /> Most Popular
            </span>
          </div>
          <CardHeader>
            <CardTitle className="text-2xl">{t('premium.name')}</CardTitle>
            <CardDescription>
              <span className="text-4xl font-bold">{t('premium.price')}</span>
              <span className="text-muted-foreground"> / {t('premium.period')}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[
                'Unlimited books',
                'Offline reading',
                'Advanced reader settings',
                'Priority support',
                'No ads',
                'Early access to new features',
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            {isPremium ? (
              <Button className="w-full" disabled>
                Current Plan
              </Button>
            ) : (
              <Button className="w-full" onClick={handleSubscribe}>
                {t('premium.cta')}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* FAQ or additional info */}
      <div className="mt-16 text-center">
        <p className="text-sm text-muted-foreground">
          All plans include access to thousands of public domain classics.
          <br />
          Premium subscribers can cancel anytime.
        </p>
      </div>
    </div>
  );
}

function PricingPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <Skeleton className="h-10 w-64 mx-auto mb-4" />
        <Skeleton className="h-6 w-96 mx-auto" />
      </div>
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<PricingPageSkeleton />}>
      <PricingContent />
    </Suspense>
  );
}
