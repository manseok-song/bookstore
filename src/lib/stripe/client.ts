import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

// Stripe 클라이언트를 지연 초기화
function getStripeClient(): Stripe {
  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(stripeSecretKey, {
    apiVersion: '2025-11-17.clover',
    typescript: true,
  });
}

// 지연 초기화를 위한 프록시
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    const client = getStripeClient();
    const value = client[prop as keyof Stripe];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

export const PREMIUM_PRICE_ID = process.env.STRIPE_PREMIUM_PRICE_ID;

// 구독 상태 확인
export async function getSubscriptionStatus(customerId: string) {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    });

    return subscriptions.data.length > 0 ? 'PREMIUM' : 'FREE';
  } catch (error) {
    console.error('Failed to get subscription status:', error);
    return 'FREE';
  }
}

// 체크아웃 세션 생성
export async function createCheckoutSession({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
}: {
  customerId?: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session;
}

// 고객 포털 세션 생성
export async function createPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

export default stripe;
