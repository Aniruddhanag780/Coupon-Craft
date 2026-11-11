import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCouponCheckout } from './couponValidation';
import { Coupon } from '../types/coupon';

const baseCoupon: Coupon = {
  id: 'c1',
  name: 'Summer Splash 20%',
  code: 'SUMMER20',
  type: 'percentage',
  discountValue: 20,
  minOrderValue: 50,
  maxOrderValue: 500,
  maxDiscountCap: 50,
  expiryDate: '2029-12-31T23:59:59.000Z',
  totalUsageLimit: 100,
  perUserLimit: 1,
  usageCount: 10,
  userRedemptions: {
    'user-existing@example.com': 1,
  },
  status: 'active',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

test('Percentage coupon calculates correct discount for valid cart', () => {
  const result = validateCouponCheckout(baseCoupon, {
    code: 'SUMMER20',
    orderValue: 100,
    customerId: 'new-user@example.com',
  });

  assert.equal(result.isValid, true);
  assert.equal(result.discountAmount, 20); // 20% of 100 = 20
  assert.equal(result.finalOrderValue, 80);
});

test('Percentage coupon honors max discount cap', () => {
  const result = validateCouponCheckout(baseCoupon, {
    code: 'SUMMER20',
    orderValue: 400, // 20% of 400 is 80, but cap is 50
    customerId: 'new-user@example.com',
  });

  assert.equal(result.isValid, true);
  assert.equal(result.discountAmount, 50); // capped at 50
  assert.equal(result.finalOrderValue, 350);
  assert.equal(result.savingsBreakdown?.capped, true);
});

test('Flat coupon discounts exact amount', () => {
  const flatCoupon: Coupon = {
    ...baseCoupon,
    id: 'c2',
    name: 'Flat $15 Off',
    code: 'FLAT15',
    type: 'flat',
    discountValue: 15,
    minOrderValue: 40,
    maxOrderValue: null,
    maxDiscountCap: null,
  };

  const result = validateCouponCheckout(flatCoupon, {
    code: 'FLAT15',
    orderValue: 60,
  });

  assert.equal(result.isValid, true);
  assert.equal(result.discountAmount, 15);
  assert.equal(result.finalOrderValue, 45);
});

test('Rejects if cart is below min order value', () => {
  const result = validateCouponCheckout(baseCoupon, {
    code: 'SUMMER20',
    orderValue: 30, // min is 50
  });

  assert.equal(result.isValid, false);
  assert.match(result.reason || '', /below the minimum order value/);
});

test('Rejects if cart exceeds max order value', () => {
  const result = validateCouponCheckout(baseCoupon, {
    code: 'SUMMER20',
    orderValue: 600, // max is 500
  });

  assert.equal(result.isValid, false);
  assert.match(result.reason || '', /exceeds the maximum order value/);
});

test('Rejects if coupon is inactive', () => {
  const inactiveCoupon: Coupon = {
    ...baseCoupon,
    status: 'inactive',
  };

  const result = validateCouponCheckout(inactiveCoupon, {
    code: 'SUMMER20',
    orderValue: 100,
  });

  assert.equal(result.isValid, false);
  assert.match(result.reason || '', /inactive/);
});

test('Rejects if coupon has expired', () => {
  const expiredCoupon: Coupon = {
    ...baseCoupon,
    expiryDate: '2020-01-01T00:00:00.000Z',
  };

  const result = validateCouponCheckout(expiredCoupon, {
    code: 'SUMMER20',
    orderValue: 100,
  });

  assert.equal(result.isValid, false);
  assert.match(result.reason || '', /expired/);
});

test('Rejects if total usage limit reached', () => {
  const exhaustedCoupon: Coupon = {
    ...baseCoupon,
    totalUsageLimit: 10,
    usageCount: 10,
  };

  const result = validateCouponCheckout(exhaustedCoupon, {
    code: 'SUMMER20',
    orderValue: 100,
  });

  assert.equal(result.isValid, false);
  assert.match(result.reason || '', /maximum total redemption limit/);
});

test('Rejects if per-user limit reached for that customer', () => {
  const result = validateCouponCheckout(baseCoupon, {
    code: 'SUMMER20',
    orderValue: 100,
    customerEmail: 'user-existing@example.com', // has 1 redemption already, perUserLimit=1
  });

  assert.equal(result.isValid, false);
  assert.match(result.reason || '', /maximum redemption limit/);
});
