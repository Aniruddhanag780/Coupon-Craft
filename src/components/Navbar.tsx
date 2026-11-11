import React from 'react';
import { Plus } from 'lucide-react';

interface NavbarProps {
  onOpenCreateModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCreateModal }) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-3">
        {/* The Street Co Branding */}
        <div>
          <h1 className="font-bold text-xl sm:text-2xl tracking-tight text-stone-900 leading-tight">
            The Street Co
          </h1>
          <p className="text-xs text-stone-500 font-medium">
            Coupon Management
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Create Coupon Button */}
          <button
            type="button"
            onClick={onOpenCreateModal}
            aria-label="Create New Coupon"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-stone-900 text-[#FAF8F5] hover:bg-stone-800 active:scale-[0.98] shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-stone-300" />
            <span>Create Coupon</span>
          </button>
        </div>
      </div>
    </header>
  );
};

