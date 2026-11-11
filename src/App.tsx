import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  Tag,
  ArrowUpDown,
  RefreshCw,
  LayoutGrid,
  List,
  CheckCircle2,
  AlertCircle,
  Percent,
  IndianRupee,
  Trash2,
} from 'lucide-react';
import { Coupon, CouponFormData } from './types/coupon';
import { Navbar } from './components/Navbar';
import { CouponCard } from './components/CouponCard';
import { CouponModal } from './components/CouponModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { formatCurrency } from './utils/couponValidation';

export default function App() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'percentage' | 'flat'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'discount' | 'expiry' | 'redemptions'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Fetch coupons from server
  const fetchCoupons = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('/api/coupons');
      if (!res.ok) {
        throw new Error('Failed to load coupons from server.');
      }
      const data = await res.json();
      if (data.success) {
        setCoupons(data.coupons || []);
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with backend.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  // Handle Save (Create or Edit)
  const handleSaveCoupon = async (data: CouponFormData) => {
    if (editingCoupon) {
      // Update
      const res = await fetch(`/api/coupons/${editingCoupon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to update coupon');
      }
      showToast(`Coupon "${data.code}" updated successfully.`);
    } else {
      // Create
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to create coupon');
      }
      showToast(`Coupon "${data.code}" created and saved.`);
    }

    await fetchCoupons();
  };

  // Handle Toggle Status
  const handleToggleStatus = async (id: string) => {
    try {
      const res = await fetch(`/api/coupons/${id}/status`, {
        method: 'PATCH',
      });
      const resData = await res.json();
      if (resData.success) {
        setCoupons(prev =>
          prev.map(c => (c.id === id ? { ...c, status: resData.coupon.status } : c))
        );
        showToast(
          `Coupon "${resData.coupon.code}" is now ${
            resData.coupon.status === 'active' ? 'Active' : 'Disabled'
          }.`
        );
      }
    } catch (err: any) {
      showToast(`Failed to update status: ${err.message}`, 'error');
    }
  };

  // Handle Delete
  const handleConfirmDelete = async () => {
    if (!deletingCoupon) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/coupons/${deletingCoupon.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Coupon "${deletingCoupon.code}" was deleted.`);
        setDeletingCoupon(null);
        await fetchCoupons();
      } else {
        throw new Error(data.error || 'Failed to delete');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered and sorted coupons
  const filteredCoupons = coupons
    .filter(c => {
      // Status filter
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      // Type filter
      if (typeFilter !== 'all' && c.type !== typeFilter) return false;
      // Search term
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesCode = c.code.toLowerCase().includes(query);
        const matchesName = c.name.toLowerCase().includes(query);
        const matchesDesc = c.description ? c.description.toLowerCase().includes(query) : false;
        if (!matchesCode && !matchesName && !matchesDesc) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'discount') {
        return b.discountValue - a.discountValue;
      }
      if (sortBy === 'redemptions') {
        return (b.usageCount || 0) - (a.usageCount || 0);
      }
      if (sortBy === 'expiry') {
        if (!a.expiryDate) return 1;
        if (!b.expiryDate) return -1;
        return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
      }
      return 0;
    });

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col selection:bg-stone-200">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-3 duration-200">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs sm:text-sm font-medium ${
              toast.type === 'success'
                ? 'bg-stone-900 text-white border-stone-800'
                : 'bg-rose-900 text-white border-rose-800'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Navbar */}
      <Navbar
        onOpenCreateModal={() => {
          setEditingCoupon(null);
          setIsCreateModalOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Controls Bar: Search, Filters, View Modes */}
        <div className="bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-stone-200/80 shadow-xs mb-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by code, coupon name, or description..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-50/70 border border-stone-200 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search query"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs font-semibold cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Filter Tabs & Sort */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Segmented Control */}
              <div className="flex items-center p-1 rounded-xl bg-stone-100 text-xs font-medium text-stone-600">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    statusFilter === 'all'
                      ? 'bg-white text-stone-900 font-semibold shadow-2xs'
                      : 'hover:text-stone-900'
                  }`}
                >
                  All ({coupons.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('active')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    statusFilter === 'active'
                      ? 'bg-white text-emerald-700 font-semibold shadow-2xs'
                      : 'hover:text-stone-900'
                  }`}
                >
                  Active ({coupons.filter(c => c.status === 'active').length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('inactive')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    statusFilter === 'inactive'
                      ? 'bg-white text-stone-900 font-semibold shadow-2xs'
                      : 'hover:text-stone-900'
                  }`}
                >
                  Disabled ({coupons.filter(c => c.status === 'inactive').length})
                </button>
              </div>

              {/* Type Filter */}
              <select
                aria-label="Filter by discount type"
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-900 cursor-pointer"
              >
                <option value="all">All Discount Types</option>
                <option value="percentage">Percentage (%) Coupons</option>
                <option value="flat">Flat Discount (₹) Coupons</option>
              </select>

              {/* Sort By */}
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium text-stone-700">
                <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
                <select
                  aria-label="Sort coupons"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="bg-transparent focus:outline-none text-xs font-medium text-stone-700 cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="discount">Highest Discount</option>
                  <option value="redemptions">Most Redeemed</option>
                  <option value="expiry">Expiring Soonest</option>
                </select>
              </div>

              {/* View Switcher */}
              <div className="hidden sm:flex items-center p-1 rounded-xl bg-stone-100 text-stone-600">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'grid' ? 'bg-white text-stone-900 shadow-2xs' : 'hover:text-stone-900'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  aria-label="Table view"
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'table' ? 'bg-white text-stone-900 shadow-2xs' : 'hover:text-stone-900'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Coupons List / Grid */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-stone-400">
            <RefreshCw className="w-8 h-8 animate-spin mb-3 text-stone-500" />
            <p className="text-sm font-medium">Loading coupon campaigns...</p>
          </div>
        ) : error ? (
          <div className="p-8 rounded-3xl bg-rose-50 border border-rose-200 text-center text-rose-900 max-w-lg mx-auto">
            <AlertCircle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
            <h3 className="font-bold text-base">Error Loading Coupons</h3>
            <p className="text-xs text-rose-700 mt-1 mb-4">{error}</p>
            <button
              type="button"
              onClick={fetchCoupons}
              className="px-4 py-2 rounded-xl bg-rose-900 text-white text-xs font-semibold cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="py-16 px-4 text-center bg-white/60 rounded-3xl border border-stone-200/80 max-w-xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-4">
              <Tag className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">No coupon campaigns found</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try clearing your search query or filters to find what you are looking for.'
                : 'Create your first percentage or flat discount coupon to power your promotions.'}
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              {(searchQuery || statusFilter !== 'all' || typeFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setTypeFilter('all');
                  }}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-100 cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setEditingCoupon(null);
                  setIsCreateModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-stone-900 text-[#FAF8F5] text-xs font-semibold hover:bg-stone-800 shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-stone-300" />
                <span>Create First Coupon</span>
              </button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCoupons.map(coupon => (
              <CouponCard
                key={coupon.id}
                coupon={coupon}
                onEdit={c => {
                  setEditingCoupon(c);
                  setIsCreateModalOpen(true);
                }}
                onDelete={c => setDeletingCoupon(c)}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        ) : (
          /* Compact Table View */
          <div className="bg-white/90 rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50/80 border-b border-stone-200/80 text-[11px] uppercase font-semibold text-stone-500 tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Coupon</th>
                    <th className="py-3.5 px-4">Type & Value</th>
                    <th className="py-3.5 px-4">Min / Max Order</th>
                    <th className="py-3.5 px-4">Redemption Limits</th>
                    <th className="py-3.5 px-4">Expiry Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredCoupons.map(coupon => {
                    const isExpired = coupon.expiryDate ? new Date() > new Date(coupon.expiryDate) : false;
                    return (
                      <tr key={coupon.id} className="hover:bg-stone-50/60 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-semibold text-stone-900">{coupon.name}</div>
                          <div className="font-mono text-xs font-bold text-stone-600 mt-0.5 tracking-wider">
                            {coupon.code}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-800 border border-stone-200">
                            {coupon.type === 'percentage'
                              ? `${coupon.discountValue}% OFF`
                              : `${formatCurrency(coupon.discountValue)} OFF`}
                          </span>
                          {coupon.type === 'percentage' && coupon.maxDiscountCap && (
                            <div className="text-[10px] text-stone-400 mt-0.5">
                              Cap: {formatCurrency(coupon.maxDiscountCap)}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            Min: {coupon.minOrderValue > 0 ? formatCurrency(coupon.minOrderValue) : '₹0'}
                          </div>
                          <div className="text-[11px] text-stone-400">
                            Max: {coupon.maxOrderValue ? formatCurrency(coupon.maxOrderValue) : 'None'}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium">
                            {coupon.totalUsageLimit != null
                              ? `${coupon.usageCount} / ${coupon.totalUsageLimit} uses`
                              : `${coupon.usageCount} uses (Unlimited)`}
                          </div>
                          <div className="text-[11px] text-stone-500">
                            Limit: {coupon.perUserLimit} per customer
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={isExpired ? 'text-rose-600 font-medium' : 'text-stone-600'}>
                            {coupon.expiryDate
                              ? new Date(coupon.expiryDate).toLocaleDateString()
                              : 'No expiry'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={coupon.status === 'active'}
                            aria-label={`Toggle ${coupon.name}`}
                            onClick={() => handleToggleStatus(coupon.id)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                              coupon.status === 'active' ? 'bg-emerald-500' : 'bg-stone-300'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                                coupon.status === 'active' ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCoupon(coupon);
                                setIsCreateModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-100 cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingCoupon(coupon)}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-stone-200/80 bg-white/50 py-6 mt-12 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-medium text-stone-700">
            <span className="w-2 h-2 rounded-full bg-stone-900" />
            <span>The Street Co &bull; Coupon Management</span>
          </div>
          <div className="text-stone-400 text-xs">
            Direct MongoDB Real-time Sync &bull; Mobile Phone Shortcut Ready
          </div>
        </div>
      </footer>

      {/* Create / Edit Modal */}
      <CouponModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingCoupon(null);
        }}
        onSave={handleSaveCoupon}
        editingCoupon={editingCoupon}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingCoupon)}
        onClose={() => setDeletingCoupon(null)}
        coupon={deletingCoupon}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
