import React, { useState, useEffect } from 'react';
import {
  X,
  Percent,
  IndianRupee,
  Calendar,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Coupon, CouponFormData, CouponType, CouponStatus } from '../types/coupon';

interface CouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CouponFormData) => Promise<void>;
  editingCoupon: Coupon | null;
}

export const CouponModal: React.FC<CouponModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingCoupon,
}) => {
  const [formData, setFormData] = useState<CouponFormData>({
    name: '',
    code: '',
    type: 'percentage',
    discountValue: '',
    minOrderValue: '',
    maxOrderValue: '',
    maxDiscountCap: '',
    expiryDate: '',
    totalUsageLimit: '',
    perUserLimit: 1,
    status: 'active',
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingCoupon) {
      setFormData({
        name: editingCoupon.name,
        code: editingCoupon.code,
        type: editingCoupon.type,
        discountValue: editingCoupon.discountValue,
        minOrderValue: editingCoupon.minOrderValue > 0 ? editingCoupon.minOrderValue : '',
        maxOrderValue: editingCoupon.maxOrderValue != null ? editingCoupon.maxOrderValue : '',
        maxDiscountCap: editingCoupon.maxDiscountCap != null ? editingCoupon.maxDiscountCap : '',
        expiryDate: editingCoupon.expiryDate ? editingCoupon.expiryDate.slice(0, 16) : '',
        totalUsageLimit: editingCoupon.totalUsageLimit != null ? editingCoupon.totalUsageLimit : '',
        perUserLimit: editingCoupon.perUserLimit || 1,
        status: editingCoupon.status,
        description: editingCoupon.description || '',
      });
    } else {
      // Default reset
      setFormData({
        name: '',
        code: '',
        type: 'percentage',
        discountValue: '',
        minOrderValue: '',
        maxOrderValue: '',
        maxDiscountCap: '',
        expiryDate: '',
        totalUsageLimit: '',
        perUserLimit: 1,
        status: 'active',
        description: '',
      });
    }
    setErrors({});
  }, [editingCoupon, isOpen]);

  if (!isOpen) return null;

  const handleGenerateCode = () => {
    const prefix = formData.type === 'percentage' ? 'SALE' : 'SAVE';
    const num = Math.floor(10 + Math.random() * 90);
    const randStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const suggested = `${prefix}${num}_${randStr}`;
    setFormData(prev => ({ ...prev, code: suggested }));
    if (errors.code) {
      setErrors(prev => ({ ...prev, code: '' }));
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.name.trim()) {
      errs.name = 'Please provide a coupon campaign name.';
    }

    if (!formData.code.trim()) {
      errs.code = 'Please enter a unique coupon code.';
    } else if (!/^[A-Za-z0-9_-]+$/.test(formData.code.trim())) {
      errs.code = 'Coupon code may only contain letters, numbers, hyphens, and underscores.';
    }

    if (formData.discountValue === '' || Number(formData.discountValue) <= 0) {
      errs.discountValue = 'Discount value must be greater than 0.';
    } else if (formData.type === 'percentage' && Number(formData.discountValue) > 100) {
      errs.discountValue = 'Percentage discount cannot exceed 100%.';
    }

    if (formData.minOrderValue !== '' && Number(formData.minOrderValue) < 0) {
      errs.minOrderValue = 'Minimum order value cannot be negative.';
    }

    if (
      formData.maxOrderValue !== '' &&
      formData.maxOrderValue != null &&
      formData.minOrderValue !== '' &&
      Number(formData.maxOrderValue) < Number(formData.minOrderValue)
    ) {
      errs.maxOrderValue = 'Max order value cannot be lower than minimum order value.';
    }

    if (formData.perUserLimit === '' || Number(formData.perUserLimit) < 1) {
      errs.perUserLimit = 'Per-customer redemption limit must be at least 1.';
    }

    if (formData.totalUsageLimit !== '' && formData.totalUsageLimit != null && Number(formData.totalUsageLimit) < 1) {
      errs.totalUsageLimit = 'Total usage limit must be at least 1, or leave empty for unlimited.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await onSave({
        ...formData,
        code: formData.code.trim().toUpperCase(),
      });
      onClose();
    } catch (err: any) {
      setErrors(prev => ({ ...prev, submit: err.message || 'Failed to save coupon' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="coupon-modal-title"
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-[#FAF8F5] rounded-3xl border border-stone-300/80 shadow-2xl overflow-hidden my-auto">
        {/* Header (sticky/pinned) */}
        <div className="px-6 py-4 border-b border-stone-200/80 bg-white/80 shrink-0 flex items-center justify-between">
          <div>
            <h2 id="coupon-modal-title" className="text-xl font-bold tracking-tight text-stone-900">
              {editingCoupon ? 'Edit Coupon Campaign' : 'Create New Coupon'}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Set discount rates, order constraints, and customer redemption limits.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 rounded-2xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form with isolated scroll container and pinned solid footer */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="overflow-y-auto flex-1 p-6 space-y-5 bg-[#FAF8F5]">
            {errors.submit && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errors.submit}</span>
              </div>
            )}

          {/* Coupon Type Selector (Percentage vs Flat) */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              Coupon Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'percentage' }))}
                className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                  formData.type === 'percentage'
                    ? 'border-stone-900 bg-stone-100 ring-2 ring-stone-900/10 text-stone-900 font-medium'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    formData.type === 'percentage' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  <Percent className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Percentage Discount</div>
                  <div className="text-[11px] text-stone-500">e.g. 15% or 25% off subtotal</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'flat' }))}
                className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                  formData.type === 'flat'
                    ? 'border-stone-900 bg-stone-100 ring-2 ring-stone-900/10 text-stone-900 font-medium'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    formData.type === 'flat' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  <IndianRupee className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Flat Discount</div>
                  <div className="text-[11px] text-stone-500">e.g. ₹100 or ₹250 fixed savings</div>
                </div>
              </button>
            </div>
          </div>

          {/* Row: Name and Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Coupon Name */}
            <div>
              <label htmlFor="coupon-name" className="block text-xs font-semibold text-stone-700 mb-1.5">
                Coupon Name *
              </label>
              <input
                id="coupon-name"
                type="text"
                placeholder="e.g. Spring Flash Sale"
                value={formData.name}
                onChange={e => {
                  setFormData(prev => ({ ...prev, name: e.target.value }));
                  if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-white border text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all ${
                  errors.name ? 'border-rose-400 bg-rose-50/20' : 'border-stone-200 hover:border-stone-300'
                }`}
              />
              {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
            </div>

            {/* Coupon Code */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="coupon-code" className="block text-xs font-semibold text-stone-700">
                  Coupon Code *
                </label>
                <button
                  type="button"
                  onClick={handleGenerateCode}
                  className="text-[11px] font-medium text-stone-600 hover:text-stone-900 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-stone-600" />
                  <span>Generate</span>
                </button>
              </div>
              <input
                id="coupon-code"
                type="text"
                placeholder="e.g. SPRING25"
                value={formData.code}
                onChange={e => {
                  setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }));
                  if (errors.code) setErrors(prev => ({ ...prev, code: '' }));
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-white border font-mono uppercase text-sm tracking-wider text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all ${
                  errors.code ? 'border-rose-400 bg-rose-50/20' : 'border-stone-200 hover:border-stone-300'
                }`}
              />
              {errors.code && <p className="text-xs text-rose-600 mt-1">{errors.code}</p>}
            </div>
          </div>

          {/* Row: Discount Value & Max Cap */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Discount Value */}
            <div>
              <label htmlFor="discount-value" className="block text-xs font-semibold text-stone-700 mb-1.5">
                {formData.type === 'percentage' ? 'Discount Percentage (%) *' : 'Flat Discount Amount (₹) *'}
              </label>
              <div className="relative">
                <input
                  id="discount-value"
                  type="number"
                  min="0.1"
                  step="any"
                  max={formData.type === 'percentage' ? '100' : undefined}
                  placeholder={formData.type === 'percentage' ? '20' : '200'}
                  value={formData.discountValue}
                  onChange={e => {
                    const val = e.target.value === '' ? '' : Number(e.target.value);
                    setFormData(prev => ({ ...prev, discountValue: val }));
                    if (errors.discountValue) setErrors(prev => ({ ...prev, discountValue: '' }));
                  }}
                  className={`w-full pl-3.5 pr-8 py-2.5 rounded-xl bg-white border text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all ${
                    errors.discountValue ? 'border-rose-400 bg-rose-50/20' : 'border-stone-200 hover:border-stone-300'
                  }`}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">
                  {formData.type === 'percentage' ? '%' : '₹'}
                </span>
              </div>
              {errors.discountValue && <p className="text-xs text-rose-600 mt-1">{errors.discountValue}</p>}
            </div>

            {/* Max Discount Cap (Only relevant for percentage) */}
            {formData.type === 'percentage' ? (
              <div>
                <label htmlFor="max-cap" className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Max Discount Cap (₹) <span className="font-normal text-stone-400">(Optional)</span>
                </label>
                <div className="relative">
                  <input
                    id="max-cap"
                    type="number"
                    min="0"
                    step="any"
                    placeholder="e.g. 500 (leave empty for no cap)"
                    value={formData.maxDiscountCap ?? ''}
                    onChange={e => {
                      const val = e.target.value === '' ? '' : Number(e.target.value);
                      setFormData(prev => ({ ...prev, maxDiscountCap: val }));
                    }}
                    className="w-full pl-3.5 pr-8 py-2.5 rounded-xl bg-white border border-stone-200 hover:border-stone-300 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">
                    ₹
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Protects store margins on large carts (e.g. max ₹800 off).
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-stone-400 mb-1.5">
                  Max Discount Cap
                </label>
                <div className="px-3.5 py-2.5 rounded-xl bg-stone-100 border border-stone-200 text-stone-400 text-xs italic">
                  Not applicable for flat discounts
                </div>
              </div>
            )}
          </div>

          {/* Row: Min and Max Order Value */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Min Order Value */}
            <div>
              <label htmlFor="min-order-val" className="block text-xs font-semibold text-stone-700 mb-1.5">
                Minimum Order Value (₹)
              </label>
              <div className="relative">
                <input
                  id="min-order-val"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0 (no minimum required)"
                  value={formData.minOrderValue}
                  onChange={e => {
                    const val = e.target.value === '' ? '' : Number(e.target.value);
                    setFormData(prev => ({ ...prev, minOrderValue: val }));
                    if (errors.minOrderValue) setErrors(prev => ({ ...prev, minOrderValue: '' }));
                  }}
                  className={`w-full pl-3.5 pr-8 py-2.5 rounded-xl bg-white border text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all ${
                    errors.minOrderValue ? 'border-rose-400' : 'border-stone-200 hover:border-stone-300'
                  }`}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">
                  ₹
                </span>
              </div>
              {errors.minOrderValue && <p className="text-xs text-rose-600 mt-1">{errors.minOrderValue}</p>}
            </div>

            {/* Max Order Value */}
            <div>
              <label htmlFor="max-order-val" className="block text-xs font-semibold text-stone-700 mb-1.5">
                Maximum Order Value (₹) <span className="font-normal text-stone-400">(Optional)</span>
              </label>
              <div className="relative">
                <input
                  id="max-order-val"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="Leave empty if no max ceiling"
                  value={formData.maxOrderValue ?? ''}
                  onChange={e => {
                    const val = e.target.value === '' ? '' : Number(e.target.value);
                    setFormData(prev => ({ ...prev, maxOrderValue: val }));
                    if (errors.maxOrderValue) setErrors(prev => ({ ...prev, maxOrderValue: '' }));
                  }}
                  className={`w-full pl-3.5 pr-8 py-2.5 rounded-xl bg-white border text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all ${
                    errors.maxOrderValue ? 'border-rose-400' : 'border-stone-200 hover:border-stone-300'
                  }`}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">
                  ₹
                </span>
              </div>
              {errors.maxOrderValue && <p className="text-xs text-rose-600 mt-1">{errors.maxOrderValue}</p>}
            </div>
          </div>

          {/* Expiry Date (if not leave as empty) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="expiry-date" className="block text-xs font-semibold text-stone-700">
                Expiry Date <span className="font-normal text-stone-400">(Leave empty for never expires)</span>
              </label>
              {formData.expiryDate && (
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, expiryDate: '' }))}
                  className="text-[11px] text-stone-500 hover:text-stone-800 underline"
                >
                  Clear Expiry Date
                </button>
              )}
            </div>
            <div className="relative">
              <input
                id="expiry-date"
                type="datetime-local"
                value={formData.expiryDate}
                onChange={e => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-200 hover:border-stone-300 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all"
              />
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              If left blank, this coupon will remain active indefinitely until manually disabled.
            </p>
          </div>

          {/* Row: Total Usage Limit & Per-User Limit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Total Usage Limit */}
            <div>
              <label htmlFor="total-limit" className="block text-xs font-semibold text-stone-700 mb-1.5">
                Total Redemptions Allowed <span className="font-normal text-stone-400">(All users)</span>
              </label>
              <input
                id="total-limit"
                type="number"
                min="1"
                placeholder="Leave empty for unlimited redemptions"
                value={formData.totalUsageLimit ?? ''}
                onChange={e => {
                  const val = e.target.value === '' ? '' : Number(e.target.value);
                  setFormData(prev => ({ ...prev, totalUsageLimit: val }));
                  if (errors.totalUsageLimit) setErrors(prev => ({ ...prev, totalUsageLimit: '' }));
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-white border text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all ${
                  errors.totalUsageLimit ? 'border-rose-400' : 'border-stone-200 hover:border-stone-300'
                }`}
              />
              {errors.totalUsageLimit && <p className="text-xs text-rose-600 mt-1">{errors.totalUsageLimit}</p>}
              <p className="text-[11px] text-stone-500 mt-1">
                How many times this coupon can be redeemed in total.
              </p>
            </div>

            {/* Per-User Usage Limit */}
            <div>
              <label htmlFor="per-user-limit" className="block text-xs font-semibold text-stone-700 mb-1.5">
                Per-Customer Limit * <span className="font-normal text-stone-400">(Per 1 person)</span>
              </label>
              <input
                id="per-user-limit"
                type="number"
                min="1"
                placeholder="1 (single use per customer)"
                value={formData.perUserLimit}
                onChange={e => {
                  const val = e.target.value === '' ? '' : Number(e.target.value);
                  setFormData(prev => ({ ...prev, perUserLimit: val }));
                  if (errors.perUserLimit) setErrors(prev => ({ ...prev, perUserLimit: '' }));
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-white border text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all ${
                  errors.perUserLimit ? 'border-rose-400' : 'border-stone-200 hover:border-stone-300'
                }`}
              />
              {errors.perUserLimit && <p className="text-xs text-rose-600 mt-1">{errors.perUserLimit}</p>}
              <p className="text-[11px] text-stone-500 mt-1">
                How many times a single customer can redeem this code.
              </p>
            </div>
          </div>

          {/* Status Toggle */}
          <div className="p-4 rounded-2xl bg-white/80 border border-stone-200/80 flex items-center justify-between">
            <div>
              <span className="font-semibold text-sm text-stone-900 block">Coupon Status</span>
              <span className="text-xs text-stone-500">
                {formData.status === 'active'
                  ? 'Coupon is currently active and can be redeemed in checkout.'
                  : 'Coupon is disabled. Customers will not be able to redeem it.'}
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={formData.status === 'active'}
              aria-label="Toggle coupon status"
              onClick={() =>
                setFormData(prev => ({
                  ...prev,
                  status: prev.status === 'active' ? 'inactive' : 'active',
                }))
              }
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-stone-900 ${
                formData.status === 'active' ? 'bg-emerald-500' : 'bg-stone-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  formData.status === 'active' ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Description (Optional) */}
          <div>
            <label htmlFor="coupon-description" className="block text-xs font-semibold text-stone-700 mb-1.5">
              Campaign Description / Terms <span className="font-normal text-stone-400">(Optional)</span>
            </label>
            <textarea
              id="coupon-description"
              rows={2}
              placeholder="e.g. Valid on apparel and accessories. Cannot be stacked with other vouchers."
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-stone-200 hover:border-stone-300 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all resize-none"
            />
            </div>
          </div>

          {/* Solid Pinned Footer Actions Bar (Nothing can scroll below or bleed behind it) */}
          <div className="px-6 py-4 bg-white border-t border-stone-200 shrink-0 flex items-center justify-end gap-3 z-10">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 text-sm font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-stone-900 text-[#FAF8F5] hover:bg-stone-800 text-sm font-semibold transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting
                ? 'Saving...'
                : editingCoupon
                ? 'Save Changes'
                : 'Save to Database'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
