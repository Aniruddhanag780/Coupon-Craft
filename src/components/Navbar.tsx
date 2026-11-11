import React from 'react';
import { Plus, RefreshCw } from 'lucide-react';

interface NavbarProps {
  onOpenCreateModal: () => void;
  onSync: () => void;
  isSyncing: boolean;
  lastSyncedAt?: Date | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCreateModal,
  onSync,
  isSyncing,
  lastSyncedAt,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-3">
        {/* CouponCraft Branding (No Icon) */}
        <div>
          <h1 className="font-bold text-xl sm:text-2xl tracking-tight text-stone-900 leading-tight">
            CouponCraft
          </h1>
          <p className="text-xs text-stone-500 font-medium">
            The Street Co. Coupon Management
          </p>
        </div>

        {/* Action Controls (Top Right Corner) */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Sync Button */}
          <button
            type="button"
            onClick={onSync}
            disabled={isSyncing}
            title={lastSyncedAt ? `Last synced: ${lastSyncedAt.toLocaleTimeString()}` : 'Sync all coupons with MongoDB'}
            aria-label="Sync all coupons with MongoDB"
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white hover:bg-stone-100 active:bg-stone-200 border border-stone-300/90 text-stone-700 shadow-xs active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-600 transition-transform ${
                isSyncing ? 'animate-spin text-emerald-600' : ''
              }`}
            />
            <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync DB'}</span>
          </button>

          {/* Create Coupon Button */}
          <button
            type="button"
            onClick={onOpenCreateModal}
            aria-label="Create New Coupon"
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-stone-900 text-[#FAF8F5] hover:bg-stone-800 active:scale-[0.98] shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-stone-300" />
            <span>Create</span>
          </button>
        </div>
      </div>
    </header>
  );
};

