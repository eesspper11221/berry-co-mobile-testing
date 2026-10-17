import assert from 'node:assert/strict';
import test from 'node:test';
import {formatShippingAddress} from './formatShippingAddress';

test('formats serialized shipping details as a readable address', () => {
  const address = JSON.stringify({
    fullName: 'Juan Dela Cruz',
    phone: '535353535',
    address: 'Yfgyu',
    city: 'Cuquhu',
    province: 'Jguhhhi',
    postalCode: '2322',
    country: 'PH',
  });

  assert.equal(formatShippingAddress(address), 'Yfgyu, Cuquhu, Jguhhhi, 2322, PH');
});

test('preserves an existing plain-text shipping address', () => {
  assert.equal(formatShippingAddress('Metro Manila, Philippines'), 'Metro Manila, Philippines');
});