import assert from 'node:assert/strict';
import test from 'node:test';
import {createPaymentReturnUrls} from './paymentReturnUrls.js';

test('native payment returns use the app scheme without requiring a storefront URL', () => {
  const returnUrls = createPaymentReturnUrls('order/123', true, '');

  assert.equal(returnUrls.successUrl, 'berryco://payment-return?payment=success&order=order%2F123');
  assert.equal(returnUrls.cancelUrl, 'berryco://payment-return?payment=cancelled&order=order%2F123');
});

test('browser payment returns use the configured HTTPS storefront URL', () => {
  const returnUrls = createPaymentReturnUrls('order-123', false, 'https://shop.example/');

  assert.equal(returnUrls.successUrl, 'https://shop.example/payment-return?payment=success&order=order-123');
  assert.equal(returnUrls.cancelUrl, 'https://shop.example/payment-return?payment=cancelled&order=order-123');
});

test('browser payment returns require a storefront URL', () => {
  assert.throws(() => createPaymentReturnUrls('order-123', false, ''), /BERRYCO_SITE_URL/);
});