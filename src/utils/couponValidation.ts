import { Coupon, ValidationRequest, ValidationResult } from '../types/coupon';

/**
 * Validates a coupon against cart constraints for checkout.
 * Designed to mirror MongoDB aggregation/index constraints for sub-millisecond execution.
 */
export function validateCouponCheckout(
  coupon: Coupon | null | undefined,
  request: ValidationRequest
): ValidationResult {
  const { code, orderValue, customerId, customerEmail } = request;
  const userIdentifier = (customerId || customerEmail || '').trim().toLowerCase();

  if (!coupon) {
    return {
      isValid: false,
      code: code.trim().toUpperCase(),
      discountAmount: 0,
      finalOrderValue: orderValue,
      reason: `Coupon code "${code}" does not exist.`,
    };
  }

  // 1. Status Check
  if (coupon.status !== 'active') {
    return {
      isValid: false,
      coupon,
      code: coupon.code,
      discountAmount: 0,
      finalOrderValue: orderValue,
      reason: `Coupon "${coupon.code}" is currently inactive or disabled.`,
    };
  }

  // 2. Expiry Date Check
  if (coupon.expiryDate) {
    const expiryTimestamp = new Date(coupon.expiryDate).getTime();
    const currentTimestamp = Date.now();
    if (currentTimestamp > expiryTimestamp) {
      return {
        isValid: false,
        coupon,
        code: coupon.code,
        discountAmount: 0,
        finalOrderValue: orderValue,
        reason: `Coupon "${coupon.code}" expired on ${new Date(coupon.expiryDate).toLocaleDateString()}.`,
      };
    }
  }

  // 3. Minimum Order Value Check
  if (coupon.minOrderValue > 0 && orderValue < coupon.minOrderValue) {
    const diff = coupon.minOrderValue - orderValue;
    return {
      isValid: false,
      coupon,
      code: coupon.code,
      discountAmount: 0,
      finalOrderValue: orderValue,
      reason: `Cart total (${formatCurrency(orderValue)}) is below the minimum order value of ${formatCurrency(coupon.minOrderValue)}. Add ${formatCurrency(diff)} more to redeem.`,
    };
  }

  // 4. Maximum Order Value Check (if specified)
  if (coupon.maxOrderValue != null && coupon.maxOrderValue > 0 && orderValue > coupon.maxOrderValue) {
    return {
      isValid: false,
      coupon,
      code: coupon.code,
      discountAmount: 0,
      finalOrderValue: orderValue,
      reason: `Cart total (${formatCurrency(orderValue)}) exceeds the maximum order value limit of ${formatCurrency(coupon.maxOrderValue)} for this coupon.`,
    };
  }

  // 5. Overall Redemption Limit Check
  if (coupon.totalUsageLimit != null && coupon.totalUsageLimit > 0) {
    if (coupon.usageCount >= coupon.totalUsageLimit) {
      return {
        isValid: false,
        coupon,
        code: coupon.code,
        discountAmount: 0,
        finalOrderValue: orderValue,
        reason: `Coupon "${coupon.code}" has reached its maximum total redemption limit (${coupon.totalUsageLimit} uses).`,
      };
    }
  }

  // 6. Per-Customer Redemption Limit Check
  if (userIdentifier && coupon.perUserLimit > 0 && coupon.userRedemptions) {
    const userCount = coupon.userRedemptions[userIdentifier] || 0;
    if (userCount >= coupon.perUserLimit) {
      return {
        isValid: false,
        coupon,
        code: coupon.code,
        discountAmount: 0,
        finalOrderValue: orderValue,
        reason: `You have reached the maximum redemption limit (${coupon.perUserLimit} ${coupon.perUserLimit === 1 ? 'time' : 'times'}) for this coupon.`,
      };
    }
  }

  // 7. Calculate Discount
  let discountAmount = 0;
  let rawDiscount = 0;
  let capped = false;

  if (coupon.type === 'percentage') {
    rawDiscount = Number(((orderValue * coupon.discountValue) / 100).toFixed(2));
    discountAmount = rawDiscount;

    if (coupon.maxDiscountCap != null && coupon.maxDiscountCap > 0 && discountAmount > coupon.maxDiscountCap) {
      discountAmount = coupon.maxDiscountCap;
      capped = true;
    }
  } else {
    // Flat discount
    rawDiscount = coupon.discountValue;
    discountAmount = Math.min(coupon.discountValue, orderValue);
  }

  // Ensure discount does not exceed orderValue
  discountAmount = Math.min(discountAmount, orderValue);
  const finalOrderValue = Math.max(0, Number((orderValue - discountAmount).toFixed(2)));

  return {
    isValid: true,
    coupon,
    code: coupon.code,
    discountAmount: Number(discountAmount.toFixed(2)),
    finalOrderValue,
    savingsBreakdown: {
      type: coupon.type,
      value: coupon.discountValue,
      rawDiscount,
      capped,
    },
  };
}

/**
 * Format currency nicely
 */
export function formatCurrency(amount: number): string {
  if (amount == null || isNaN(amount)) return '₹0';
  return `₹${amount.toLocaleString('en-IN')}`;
}
