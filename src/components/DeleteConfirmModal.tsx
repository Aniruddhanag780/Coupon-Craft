import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Coupon } from '../types/coupon';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupon: Coupon | null;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  coupon,
  onConfirm,
  isDeleting,
}) => {
  if (!isOpen || !coupon) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      <div className="relative w-full max-w-md bg-[#FAF8F5] rounded-3xl border border-stone-300/80 shadow-2xl p-6 overflow-hidden my-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h3 id="delete-dialog-title" className="text-lg font-bold text-stone-900">
              Delete Coupon?
            </h3>
            <p className="text-xs text-stone-500">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <p className="text-sm text-stone-700 leading-relaxed">
          Are you sure you want to permanently delete{' '}
          <strong className="text-stone-900 font-semibold">{coupon.name}</strong> (code:{' '}
          <span className="font-mono font-bold text-stone-900">{coupon.code}</span>)? Customers will no longer be able to redeem this coupon.
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-100 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-xl bg-rose-600 text-white hover:bg-rose-700 text-sm font-semibold transition-all shadow-xs disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete Coupon'}
          </button>
        </div>
      </div>
    </div>
  );
};
