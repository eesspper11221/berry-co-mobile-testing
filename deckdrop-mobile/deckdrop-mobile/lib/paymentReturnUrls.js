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