import React, { useState } from 'react';
import {
  Copy,
  Check,
  Edit2,
  Trash2,
  Calendar,
  Percent,
  IndianRupee,
  Clock,
} from 'lucide-react';
import { Coupon } from '../types/coupon';
import { formatCurrency } from '../utils/couponValidation';

interface CouponCardProps {
  coupon: Coupon;
  onEdit: (coupon: Coupon) => void;
  onDelete: (coupon: Coupon) => void;
  onToggleStatus: (id: string) => void;
}

export const CouponCard: React.FC<CouponCardProps> = ({
  coupon,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isExpired = coupon.expiryDate ? new Date() > new Date(coupon.expiryDate) : false;
  const isUsageFull = coupon.totalUsageLimit != null && coupon.usageCount >= coupon.totalUsageLimit;
  const isActive = coupon.status === 'active';

  // Format expiry display
  const expiryDisplay = coupon.expiryDate
    ? new Date(coupon.expiryDate).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'No Expiry (Always Active)';

  // Discount badge calculation
  const discountLabel =
    coupon.type === 'percentage'
      ? `${coupon.discountValue}% OFF`
      : `${formatCurrency(coupon.discountValue)} OFF`;

  return (
    <div
      className={`group relative bg-white/90 rounded-3xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md hover:border-stone-300 ${
        !isActive || isExpired
          ? 'border-stone-200/60 opacity-85 bg-stone-50/50'
          : 'border-stone-200/90'
      }`}
    >
      {/* Top Header Card Section */}
      <div className="p-5 sm:p-6 pb-4">
        {/* Row 1: Type badge, status toggle & actions */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-800 border border-stone-200">
              {coupon.type === 'percentage' ? (
                <Percent className="w-3 h-3 text-stone-600" />
              ) : (
                <IndianRupee className="w-3 h-3 text-stone-600" />
              )}
              <span>{coupon.type === 'percentage' ? 'Percentage' : 'Flat Discount'}</span>
            </span>

            {isExpired && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-100 text-rose-800 border border-rose-200">
                <Clock className="w-3 h-3" />
                Expired
              </span>
            )}
          </div>

          {/* Status Toggle Switch */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              aria-label={`Toggle status for ${coupon.name}`}
              onClick={() => onToggleStatus(coupon.id)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2 ${
                isActive ? 'bg-emerald-500' : 'bg-stone-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  isActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span
              className={`text-xs font-medium ${
                isActive ? 'text-emerald-700' : 'text-stone-400'
              }`}
            >
              {isActive ? 'Active' : 'Disabled'}
            </span>
          </div>
        </div>

        {/* Coupon Name & Value Header */}
        <div className="flex items-start justify-between gap-4 mt-2">
          <div>
            <h3 className="font-semibold text-lg text-stone-900 tracking-tight leading-snug">
              {coupon.name}
            </h3>
            {coupon.description && (
              <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                {coupon.description}
              </p>
            )}
          </div>

          <div className="text-right shrink-0">
            <div className="text-2xl font-black tracking-tight text-stone-900">
              {discountLabel}
            </div>
            {coupon.type === 'percentage' && coupon.maxDiscountCap && (
              <div className="text-[11px] text-stone-500 font-medium">
                Max cap: {formatCurrency(coupon.maxDiscountCap)}
              </div>
            )}
          </div>
        </div>

        {/* Code Bar with Copy Action */}
        <div className="mt-4 flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-stone-100/80 border border-stone-200/70">
          <div className="flex items-center gap-2 pl-2 overflow-hidden">
            <span className="font-mono font-bold tracking-widest text-stone-900 text-sm truncate">
              {coupon.code}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyCode}
            aria-label={`Copy code ${coupon.code}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-all shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-stone-500" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Constraints Grid */}
        <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
          {/* Min Order Value */}
          <div className="p-2.5 rounded-xl bg-stone-50/80 border border-stone-100">
            <span className="text-[10px] uppercase font-semibold text-stone-500 block">Min Order</span>
            <span className="font-semibold text-stone-800 mt-0.5 block">
              {coupon.minOrderValue > 0 ? formatCurrency(coupon.minOrderValue) : 'No minimum'}
            </span>
          </div>

          {/* Max Order Value */}
          <div className="p-2.5 rounded-xl bg-stone-50/80 border border-stone-100">
            <span className="text-[10px] uppercase font-semibold text-stone-500 block">Max Order</span>
            <span className="font-semibold text-stone-800 mt-0.5 block">
              {coupon.maxOrderValue ? formatCurrency(coupon.maxOrderValue) : 'No ceiling'}
            </span>
          </div>

          {/* Total Usage Limit */}
          <div className="p-2.5 rounded-xl bg-stone-50/80 border border-stone-100">
            <span className="text-[10px] uppercase font-semibold text-stone-500 block">Total Pool Limit</span>
            <span className="font-semibold text-stone-800 mt-0.5 block">
              {coupon.totalUsageLimit != null
                ? `${coupon.usageCount} / ${coupon.totalUsageLimit} redeemed`
                : `${coupon.usageCount} redeemed (Unlimited)`}
            </span>
          </div>

          {/* Per-User Limit */}
          <div className="p-2.5 rounded-xl bg-stone-50/80 border border-stone-100">
            <span className="text-[10px] uppercase font-semibold text-stone-500 block">Per-Customer Limit</span>
            <span className="font-semibold text-stone-800 mt-0.5 block">
              {coupon.perUserLimit} {coupon.perUserLimit === 1 ? 'time' : 'times'} max
            </span>
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="px-5 sm:px-6 py-3.5 bg-stone-50/70 border-t border-stone-200/70 flex items-center justify-between gap-3">
        {/* Status / Expiry indication */}
        <div className="flex items-center gap-1.5 text-xs text-stone-500 truncate">
          <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span className="truncate">
            {coupon.expiryDate ? (
              <>
                Expires <span className={`font-medium ${isExpired ? 'text-rose-600' : 'text-stone-700'}`}>{expiryDisplay}</span>
              </>
            ) : (
              <span className="text-stone-600 font-medium">Never Expires</span>
            )}
          </span>
        </div>

        {/* Edit & Delete Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(coupon)}
            aria-label={`Edit coupon ${coupon.name}`}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-white hover:shadow-xs border border-transparent hover:border-stone-200 transition-all cursor-pointer"
            title="Edit Coupon"
          >
            <Edit2 className="w-3.5 h-3.5 text-stone-500" />
            <span>Edit</span>
          </button>
          <button
            type="button"
            onClick={() => onDelete(coupon)}
            aria-label={`Delete coupon ${coupon.name}`}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-stone-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
            title="Delete Coupon"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
