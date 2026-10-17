import assert from 'node:assert/strict';
import test from 'node:test';
import {createPaymentReturnUrls, matchesPaymentReturnUrl} from './paymentReturnUrls.js';

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

test('native app accepts its HTTPS storefront payment return', () => {
  assert.equal(
    matchesPaymentReturnUrl(
      'https://shop.example/payment-return?payment=success&order=order-123',
      true,
      'https://shop.example/',
      'https://localhost',
    ),
    true,
  );
});

test('native app accepts a valid payment callback on the storefront root', () => {
  assert.equal(
    matchesPaymentReturnUrl(
      'https://shop.example/?payment=success&order=order-123',
      true,
      'https://shop.example/',
      'https://localhost',
    ),
    true,
  );
});

test('native app rejects unrelated HTTPS URLs and paths', () => {
  assert.equal(matchesPaymentReturnUrl('https://shop.example/', true, 'https://shop.example', 'https://localhost'), false);
  assert.equal(matchesPaymentReturnUrl('https://other.example/payment-return?payment=success', true, 'https://shop.example', 'https://localhost'), false);
  assert.equal(matchesPaymentReturnUrl('https://shop.example/?payment=failed&order=order-123', true, 'https://shop.example', 'https://localhost'), false);
  assert.equal(matchesPaymentReturnUrl('https://shop.example/?payment=success', true, 'https://shop.example', 'https://localhost'), false);
});

test('browser payment returns remain limited to the current origin', () => {
  assert.equal(matchesPaymentReturnUrl('https://shop.example/payment-return?payment=success&order=order-123', false, '', 'https://shop.example'), true);
  assert.equal(matchesPaymentReturnUrl('https://other.example/payment-return?payment=success&order=order-123', false, '', 'https://shop.example'), false);
  assert.equal(matchesPaymentReturnUrl('https://shop.example/?payment=success&order=order-123', false, '', 'https://shop.example'), false);
});