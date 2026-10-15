import {supabase} from '../supabase/client';

interface PayMongoCheckoutSession {
  checkoutUrl: string;
  checkoutSessionId: string;
}

export const createPayMongoCheckoutSession = async (
  orderId: string,
  paymentMethod: 'gcash' | 'card',
): Promise<PayMongoCheckoutSession> => {
  const {data: {session}, error: sessionError} = await supabase.auth.getSession();
  if (sessionError) throw new Error(sessionError.message);
  if (!session?.access_token) throw new Error('Sign in again before starting payment.');

  const isNativeOrigin = window.location.protocol === 'capacitor:'
    || (window.location.hostname === 'localhost' && !window.location.port);
  const apiBaseUrl = isNativeOrigin
    ? __BERRYCO_API_BASE_URL__
    : window.location.origin;
  const response = await fetch(`${apiBaseUrl.replace(/\/+$/, '')}/api/payments/paymongo/checkout-session`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({orderId, paymentMethod}),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof result.error === 'string' ? result.error : 'Unable to start payment.');
  }
  if (typeof result.checkoutUrl !== 'string' || typeof result.checkoutSessionId !== 'string') {
    throw new Error('The payment service returned an invalid checkout session.');
  }
  return {checkoutUrl: result.checkoutUrl, checkoutSessionId: result.checkoutSessionId};
};
