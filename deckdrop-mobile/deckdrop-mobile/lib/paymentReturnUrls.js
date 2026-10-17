export const createPaymentReturnUrls = (orderId, isNativeApp, siteUrl) => {
  const normalizedSiteUrl = siteUrl.replace(/\/+$/, '');
  if (!isNativeApp && !normalizedSiteUrl) {
    throw new Error('Set BERRYCO_SITE_URL to the storefront URL for browser payment redirects.');
  }

  const returnBaseUrl = isNativeApp
    ? 'berryco://payment-return'
    : `${normalizedSiteUrl}/payment-return`;
  const encodedOrderId = encodeURIComponent(orderId);

  return {
    successUrl: `${returnBaseUrl}?payment=success&order=${encodedOrderId}`,
    cancelUrl: `${returnBaseUrl}?payment=cancelled&order=${encodedOrderId}`,
  };
};

export const matchesPaymentReturnUrl = (value, isNativeApp, siteUrl, currentOrigin) => {
  try {
    const url = new URL(value);
    const paymentResult = url.searchParams.get('payment');
    const orderId = url.searchParams.get('order');
    if (!orderId || !['success', 'cancelled'].includes(paymentResult)) return false;

    if (isNativeApp && url.protocol === 'berryco:') {
      return url.hostname === 'payment-return' && url.pathname === '';
    }

    const expectedOrigin = isNativeApp ? new URL(siteUrl).origin : currentOrigin;
    const isPaymentPath = url.pathname === '/payment-return'
      || (isNativeApp && url.pathname === '/');
    return url.origin === expectedOrigin && isPaymentPath;
  } catch {
    return false;
  }
};