export type CouponType = 'percentage' | 'flat';

export type CouponStatus = 'active' | 'inactive';

export interface RedemptionRecord {
  id: string;
  couponId: string;
  code: string;
  customerId: string;
  customerEmail?: string;
  orderId?: string;
  orderValue: number;
  discountApplied: number;
  redeemedAt: string;
}

export interface Coupon {
  id: string;
  _id?: string;
  name: string;
  code: string;
  type: CouponType;
  discountValue: number; // e.g. 15 for 15% or 200 for ₹200
  minOrderValue: number; // minimum cart subtotal required (default: 0)
  maxOrderValue: number | null; // maximum cart subtotal allowed (null if no limit)
  maxDiscountCap?: number | null; // optional cap for percentage discounts (e.g. max ₹500 off)
  expiryDate: string | null; // ISO string or null for no expiry
  totalUsageLimit: number | null; // total number of redemptions allowed across all users (null = unlimited)
  perUserLimit: number; // how many times 1 individual customer can redeem (default 1)
  usageCount: number; // redemptions so far
  userRedemptions?: Record<string, number>; // customerId -> count
  status: CouponStatus;
  createdAt: string;
  updatedAt: string;
  description?: string;
  source?: string;
}

export interface CouponFormData {
  name: string;
  code: string;
  type: CouponType;
  discountValue: number | '';
  minOrderValue: number | '';
  maxOrderValue: number | '' | null;
  maxDiscountCap?: number | '' | null;
  expiryDate: string; // date string or empty
  totalUsageLimit: number | '' | null;
  perUserLimit: number | '';
  status: CouponStatus;
  description?: string;
}

export interface ValidationRequest {
  code: string;
  orderValue: number;
  customerId?: string;
  customerEmail?: string;
}

export interface ValidationResult {
  isValid: boolean;
  coupon?: Coupon;
  reason?: string;
  code?: string;
  discountAmount: number;
  finalOrderValue: number;
  savingsBreakdown?: {
    type: CouponType;
    value: number;
    rawDiscount: number;
    capped: boolean;
  };
}

export interface MongoDbConfig {
  uri: string;
  dbName: string;
  collectionName: string;
  isConnected: boolean;
  lastConnectedAt?: string;
  error?: string | null;
  couponCount?: number;
}
