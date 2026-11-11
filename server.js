import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const HOST = '0.0.0.0';

const DATA_FILE = path.join(__dirname, 'data', 'coupons.json');

// Helper to load coupons
function loadCoupons() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading coupons.json:', err);
  }
  return [
    {
      id: 'cp_welcome15',
      name: 'New Customer Welcome',
      code: 'WELCOME15',
      type: 'percentage',
      discountValue: 15,
      minOrderValue: 300,
      maxOrderValue: 3000,
      maxDiscountCap: 450,
      expiryDate: new Date(Date.now() + 60 * 86400000).toISOString(),
      totalUsageLimit: 500,
      perUserLimit: 1,
      usageCount: 42,
      userRedemptions: { 'user_sample@store.com': 1 },
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: 'Get 15% off on your first order. Minimum purchase of ₹300 required.'
    },
    {
      id: 'cp_save250',
      name: 'Weekend Flat Savings',
      code: 'SAVE250',
      type: 'flat',
      discountValue: 250,
      minOrderValue: 800,
      maxOrderValue: null,
      maxDiscountCap: null,
      expiryDate: new Date(Date.now() + 14 * 86400000).toISOString(),
      totalUsageLimit: 200,
      perUserLimit: 2,
      usageCount: 88,
      userRedemptions: { 'alex@shopper.io': 1 },
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: 'Flat ₹250 discount on any order exceeding ₹800. Limit 2 times per customer.'
    },
    {
      id: 'cp_flash100',
      name: 'Flash Sale Flat Discount',
      code: 'FLASH100',
      type: 'flat',
      discountValue: 100,
      minOrderValue: 250,
      maxOrderValue: 1500,
      maxDiscountCap: null,
      expiryDate: null,
      totalUsageLimit: 1000,
      perUserLimit: 3,
      usageCount: 154,
      userRedemptions: {},
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: 'Evergreen ₹100 off small carts between ₹250 and ₹1500.'
    },
    {
      id: 'cp_vip30',
      name: 'VIP Member Tier Discount',
      code: 'VIP30',
      type: 'percentage',
      discountValue: 30,
      minOrderValue: 1000,
      maxOrderValue: null,
      maxDiscountCap: 900,
      expiryDate: null,
      totalUsageLimit: null,
      perUserLimit: 5,
      usageCount: 67,
      userRedemptions: {},
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: 'Exclusive 30% discount for loyalty club members up to ₹900 max discount.'
    },
    {
      id: 'cp_clearance40',
      name: 'Seasonal Clearance (Paused)',
      code: 'CLEAR40',
      type: 'percentage',
      discountValue: 40,
      minOrderValue: 1200,
      maxOrderValue: 10000,
      maxDiscountCap: 1500,
      expiryDate: new Date(Date.now() - 5 * 86400000).toISOString(),
      totalUsageLimit: 150,
      perUserLimit: 1,
      usageCount: 150,
      userRedemptions: {},
      status: 'inactive',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: 'Archived clearance campaign. Currently disabled.'
    }
  ];
}

let coupons = loadCoupons();

function saveCoupons() {
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(coupons, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving coupons:', err);
  }
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(payload));
}

// Generate the HTML frontend
function getHtml() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CouponCraft - Coupon Management</title>
  <meta name="description" content="CouponCraft - Coupon management and promotions platform. Create, edit, upload and synchronize vouchers." />
  <link rel="icon" type="image/png" href="/app_icon.png" />
  <link rel="apple-touch-icon" href="/app_icon.png" />
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    :root, html, body {
      color-scheme: light !important;
      background-color: #FAF8F5 !important;
      color: #1c1917 !important;
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    }
    input, textarea, select {
      color-scheme: light !important;
      color: #1c1917 !important;
      -webkit-text-fill-color: #1c1917 !important;
      background-color: #ffffff !important;
      caret-color: #1c1917 !important;
    }
    input::placeholder, textarea::placeholder {
      color: #78716c !important;
      -webkit-text-fill-color: #78716c !important;
      opacity: 1 !important;
    }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body class="bg-[#FAF8F5] text-stone-900 min-h-screen flex flex-col antialiased">
  <div id="app" class="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 flex flex-col">
    <!-- Navbar -->
    <header class="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-stone-200">
      <div class="flex items-center gap-3">
        <img src="/app_icon.png" alt="CouponCraft" class="w-11 h-11 rounded-2xl shadow-sm border border-stone-200/90 object-cover bg-white" />
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl font-extrabold tracking-tight text-stone-900">CouponCraft</h1>
            <span class="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Active</span>
          </div>
          <p class="text-xs text-stone-500 font-medium">The Street Co. Promotions & Rules Engine</p>
        </div>
      </div>
      <div class="flex items-center gap-2.5">
        <!-- Single Sync Button -->
        <button onclick="syncData()" id="syncBtn" class="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-300 rounded-xl shadow-xs hover:bg-stone-50 hover:border-stone-400 transition active:scale-95" title="Synchronize Coupons Database">
          <span class="text-sm">🔄</span>
          <span>Sync</span>
        </button>
        <!-- Create / Upload Coupon Button -->
        <button onclick="openCreateModal()" class="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-stone-900 rounded-xl shadow-sm hover:bg-stone-800 transition active:scale-95">
          <span>＋</span>
          <span>Create / Upload Coupon</span>
        </button>
      </div>
    </header>

    <!-- Search & Filter Controls -->
    <div class="my-6 space-y-2.5">
      <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <!-- Balanced Horizontal Search Bar (w-full sm:max-w-md) -->
        <div class="relative w-full sm:max-w-md">
          <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 text-sm">🔍</span>
          <input type="text" id="searchInput" oninput="renderCoupons()" 
                 placeholder="Search coupons (e.g. WELCOME15, SAVE250)..."
                 class="w-full pl-9 pr-3.5 py-2 bg-white border-2 border-stone-300 rounded-xl text-xs font-semibold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 shadow-xs transition" />
        </div>

        <div class="flex flex-wrap items-center gap-2 text-xs">
          <!-- Status filter -->
          <div class="inline-flex rounded-xl bg-stone-200/70 p-1 font-medium">
            <button onclick="setStatusFilter('all')" id="filterStatusAll" class="px-3 py-1 rounded-lg bg-white shadow-xs font-semibold text-stone-900">All</button>
            <button onclick="setStatusFilter('active')" id="filterStatusActive" class="px-3 py-1 rounded-lg text-stone-600 hover:text-stone-900">Active</button>
            <button onclick="setStatusFilter('inactive')" id="filterStatusInactive" class="px-3 py-1 rounded-lg text-stone-600 hover:text-stone-900">Disabled</button>
          </div>

          <!-- Type filter -->
          <div class="inline-flex rounded-xl bg-stone-200/70 p-1 font-medium">
            <button onclick="setTypeFilter('all')" id="filterTypeAll" class="px-3 py-1 rounded-lg bg-white shadow-xs font-semibold text-stone-900">All Types</button>
            <button onclick="setTypeFilter('percentage')" id="filterTypePercentage" class="px-3 py-1 rounded-lg text-stone-600 hover:text-stone-900">% Off</button>
            <button onclick="setTypeFilter('flat')" id="filterTypeFlat" class="px-3 py-1 rounded-lg text-stone-600 hover:text-stone-900">₹ Flat</button>
          </div>

          <!-- Sort Select -->
          <select id="sortSelect" onchange="renderCoupons()" class="px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-medium text-stone-700 shadow-xs focus:outline-none">
            <option value="newest">Sort: Newest</option>
            <option value="discount">Sort: Highest Discount</option>
            <option value="redemptions">Sort: Most Redeemed</option>
            <option value="expiry">Sort: Expiry Date</option>
          </select>
        </div>
      </div>

      <!-- Clickable Example Search Chips -->
      <div class="flex flex-wrap items-center gap-1.5 text-xs text-stone-500 pt-0.5">
        <span class="font-medium text-stone-400 text-[11px]">Example search:</span>
        <button onclick="setExampleSearch('WELCOME15')" class="px-2 py-0.5 bg-stone-200/80 hover:bg-stone-300 text-stone-700 font-mono rounded-md text-[11px] transition">WELCOME15</button>
        <button onclick="setExampleSearch('SAVE250')" class="px-2 py-0.5 bg-stone-200/80 hover:bg-stone-300 text-stone-700 font-mono rounded-md text-[11px] transition">SAVE250</button>
        <button onclick="setExampleSearch('FLASH100')" class="px-2 py-0.5 bg-stone-200/80 hover:bg-stone-300 text-stone-700 font-mono rounded-md text-[11px] transition">FLASH100</button>
        <button onclick="setExampleSearch('VIP30')" class="px-2 py-0.5 bg-stone-200/80 hover:bg-stone-300 text-stone-700 font-mono rounded-md text-[11px] transition">VIP30</button>
        <button onclick="setExampleSearch('Flat')" class="px-2 py-0.5 bg-stone-200/80 hover:bg-stone-300 text-stone-700 rounded-md text-[11px] transition">Flat Savings</button>
        <button onclick="setExampleSearch('')" class="text-stone-400 hover:text-stone-700 text-[11px] underline ml-1">clear</button>
      </div>
    </div>

    <!-- Coupons Grid / List -->
    <div id="couponsContainer" class="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1"></div>

    <!-- Android Codebase Banner -->
    <div class="mt-10 p-5 bg-stone-100 rounded-2xl border border-stone-300/80 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <h3 class="text-sm font-bold text-stone-900 flex items-center gap-2">
          🤖 Native Android Jetpack Compose Module Included
        </h3>
        <p class="text-xs text-stone-600 mt-1">
          Complete Kotlin codebase with Compose UI, Room/Repository, ViewModel, and adaptive vector icons is ready inside <code class="bg-white px-1.5 py-0.5 rounded border border-stone-300 font-mono text-[11px]">/app/src/main/</code>.
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="openAndroidModal()" class="px-3.5 py-2 bg-white border border-stone-300 hover:bg-stone-50 rounded-xl text-xs font-semibold text-stone-800 shadow-xs transition">
          View Android Files
        </button>
      </div>
    </div>
  </div>

  <!-- Create & Upload Modal (High Contrast, Fully Visible & Scrollable) -->
  <div id="couponModal" class="fixed inset-0 z-50 hidden overflow-y-auto bg-stone-900/70 backdrop-blur-xs">
    <div class="flex min-h-full items-start justify-center p-3 sm:p-6 text-center sm:items-center">
      <div class="relative w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white p-6 sm:p-8 text-left shadow-2xl transition-all border border-stone-200 my-4">
        
        <!-- Modal Header -->
        <div class="flex items-start justify-between pb-4 border-b border-stone-200 mb-4">
          <div>
            <h2 id="modalTitle" class="text-xl font-extrabold text-stone-900">Create or Upload Coupons</h2>
            <p class="text-xs text-stone-500 mt-0.5">Manage single promotional voucher or upload multiple coupons at once.</p>
          </div>
          <button onclick="closeCouponModal()" class="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center font-bold text-base transition">
            ✕
          </button>
        </div>

        <!-- Navigation Tabs: Form vs Upload -->
        <div class="flex border-b border-stone-200 mb-5">
          <button id="tabFormBtn" onclick="switchModalTab('form')" class="px-4 py-2.5 text-xs font-bold border-b-2 border-stone-900 text-stone-900 flex items-center gap-1.5">
            ✏️ Coupon Form
          </button>
          <button id="tabUploadBtn" onclick="switchModalTab('upload')" class="px-4 py-2.5 text-xs font-semibold border-b-2 border-transparent text-stone-500 hover:text-stone-800 flex items-center gap-1.5">
            📤 Batch / JSON Upload
          </button>
        </div>

        <!-- TAB 1: FORM -->
        <div id="tabFormContent">
          <form id="couponForm" onsubmit="handleSaveCoupon(event)" class="space-y-4">
            <input type="hidden" id="editId" />
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-stone-800 mb-1">Coupon Code *</label>
                <input type="text" id="fCode" required 
                       class="w-full px-3.5 py-2.5 bg-white border-2 border-stone-300 rounded-xl text-sm font-mono font-bold text-stone-900 uppercase tracking-wider focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900" 
                       placeholder="e.g. FESTIVE25" />
                <p class="text-[10px] text-stone-400 mt-0.5">Unique promotional code entered by shoppers.</p>
              </div>
              <div>
                <label class="block text-xs font-bold text-stone-800 mb-1">Campaign Name *</label>
                <input type="text" id="fName" required 
                       class="w-full px-3.5 py-2.5 bg-white border-2 border-stone-300 rounded-xl text-sm font-medium text-stone-900 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900" 
                       placeholder="e.g. Festive Holiday 25% Off" />
                <p class="text-[10px] text-stone-400 mt-0.5">Internal or descriptive display title.</p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-stone-800 mb-1">Discount Type</label>
                <select id="fType" class="w-full px-3.5 py-2.5 bg-white border-2 border-stone-300 rounded-xl text-sm font-medium text-stone-900 focus:border-stone-900 focus:outline-none">
                  <option value="percentage">Percentage Discount (%)</option>
                  <option value="flat">Flat Amount Discount (₹)</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-stone-800 mb-1">Discount Value *</label>
                <input type="number" step="0.01" id="fValue" required 
                       class="w-full px-3.5 py-2.5 bg-white border-2 border-stone-300 rounded-xl text-sm font-bold text-stone-900 focus:border-stone-900 focus:outline-none" 
                       placeholder="25" />
                <p class="text-[10px] text-stone-400 mt-0.5">Amount in % or ₹ depending on type.</p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block text-xs font-bold text-stone-800 mb-1">Min Order (₹)</label>
                <input type="number" id="fMinOrder" 
                       class="w-full px-3 py-2 bg-white border-2 border-stone-300 rounded-xl text-sm text-stone-900 focus:border-stone-900 focus:outline-none" 
                       placeholder="0" />
              </div>
              <div>
                <label class="block text-xs font-bold text-stone-800 mb-1">Max Order (₹)</label>
                <input type="number" id="fMaxOrder" 
                       class="w-full px-3 py-2 bg-white border-2 border-stone-300 rounded-xl text-sm text-stone-900 focus:border-stone-900 focus:outline-none" 
                       placeholder="No limit" />
              </div>
              <div>
                <label class="block text-xs font-bold text-stone-800 mb-1">Max Cap (₹)</label>
                <input type="number" id="fMaxCap" 
                       class="w-full px-3 py-2 bg-white border-2 border-stone-300 rounded-xl text-sm text-stone-900 focus:border-stone-900 focus:outline-none" 
                       placeholder="Optional" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block text-xs font-bold text-stone-800 mb-1">Expiry Date</label>
                <input type="date" id="fExpiry" 
                       class="w-full px-3 py-2 bg-white border-2 border-stone-300 rounded-xl text-sm text-stone-900 focus:border-stone-900 focus:outline-none" />
              </div>
              <div>
                <label class="block text-xs font-bold text-stone-800 mb-1">Total Usage Limit</label>
                <input type="number" id="fTotalLimit" 
                       class="w-full px-3 py-2 bg-white border-2 border-stone-300 rounded-xl text-sm text-stone-900 focus:border-stone-900 focus:outline-none" 
                       placeholder="Unlimited" />
              </div>
              <div>
                <label class="block text-xs font-bold text-stone-800 mb-1">Per User Limit</label>
                <input type="number" id="fPerUser" value="1" min="1" 
                       class="w-full px-3 py-2 bg-white border-2 border-stone-300 rounded-xl text-sm text-stone-900 focus:border-stone-900 focus:outline-none" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-stone-800 mb-1">Terms / Description</label>
              <textarea id="fDesc" rows="2" 
                        class="w-full px-3 py-2 bg-white border-2 border-stone-300 rounded-xl text-sm text-stone-900 focus:border-stone-900 focus:outline-none" 
                        placeholder="e.g. Valid on purchases across all categories for eligible customers."></textarea>
            </div>

            <div class="flex items-center gap-2.5 p-3 bg-stone-50 rounded-xl border border-stone-200">
              <input type="checkbox" id="fStatus" checked class="w-4 h-4 rounded text-stone-900 border-stone-300 focus:ring-stone-900" />
              <label for="fStatus" class="text-xs font-bold text-stone-800">Coupon is Active and available for redemption</label>
            </div>

            <div class="flex gap-3 pt-3">
              <button type="button" onclick="closeCouponModal()" class="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition">
                Cancel
              </button>
              <button type="submit" class="flex-1 py-3 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition shadow-sm">
                Save Coupon
              </button>
            </div>
          </form>
        </div>

        <!-- TAB 2: UPLOAD (BATCH JSON / CSV) -->
        <div id="tabUploadContent" class="hidden space-y-4">
          <div class="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900">
            <p class="font-bold mb-1">📥 Batch Coupon Upload</p>
            <p>Upload a JSON file or paste a JSON array of coupons to create multiple voucher campaigns simultaneously.</p>
          </div>

          <div>
            <label class="block text-xs font-bold text-stone-800 mb-1.5">Select JSON File</label>
            <input type="file" id="jsonFileInput" accept=".json,.txt" onchange="handleFileSelect(event)"
                   class="block w-full text-xs text-stone-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-stone-900 file:text-white hover:file:bg-stone-800 cursor-pointer" />
          </div>

          <div>
            <label class="block text-xs font-bold text-stone-800 mb-1.5">Or Paste JSON Content Below</label>
            <textarea id="jsonPasteInput" rows="7" 
                      class="w-full px-3 py-2 bg-white border-2 border-stone-300 rounded-xl text-xs font-mono text-stone-900 focus:border-stone-900 focus:outline-none"
                      placeholder='[
  {
    "code": "SUMMER25",
    "name": "Summer Special",
    "type": "percentage",
    "discountValue": 25,
    "minOrderValue": 500,
    "status": "active"
  }
]'></textarea>
          </div>

          <div class="flex gap-3 pt-2">
            <button type="button" onclick="closeCouponModal()" class="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition">
              Cancel
            </button>
            <button type="button" onclick="handleBatchUpload()" class="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition shadow-sm">
              Upload & Import Coupons
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>

  <!-- Android Source Viewer Modal -->
  <div id="androidModal" class="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 hidden">
    <div class="bg-[#FAF8F5] border border-stone-300 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative">
      <button onclick="closeAndroidModal()" class="absolute top-5 right-5 text-stone-400 hover:text-stone-700 text-xl font-bold">✕</button>
      <div class="flex items-center gap-2.5 mb-1">
        <span class="text-2xl">🤖</span>
        <h2 class="text-lg font-bold text-stone-900">Android Project Overview</h2>
      </div>
      <p class="text-xs text-stone-500 mb-4">The Android Jetpack Compose codebase was compiled and validated.</p>
      
      <div class="space-y-2 text-xs bg-white p-4 rounded-2xl border border-stone-200">
        <div class="flex justify-between py-1 border-b border-stone-100">
          <span class="font-medium text-stone-600">Application ID:</span>
          <span class="font-mono font-bold text-stone-900">com.aistudio.couponcraft.app</span>
        </div>
        <div class="flex justify-between py-1 border-b border-stone-100">
          <span class="font-medium text-stone-600">Target SDK:</span>
          <span class="font-mono font-bold text-stone-900">35 (Android 15)</span>
        </div>
        <div class="flex justify-between py-1 border-b border-stone-100">
          <span class="font-medium text-stone-600">UI Framework:</span>
          <span class="font-bold text-stone-900">Jetpack Compose Material 3</span>
        </div>
        <div class="flex justify-between py-1">
          <span class="font-medium text-stone-600">Architecture:</span>
          <span class="font-bold text-stone-900">MVVM (ViewModel + StateFlow + Repository)</span>
        </div>
      </div>

      <div class="mt-4 text-xs text-stone-600">
        <p class="font-bold text-stone-900 mb-1.5">Key Android Files:</p>
        <ul class="list-disc list-inside space-y-1 font-mono text-[11px] text-stone-700">
          <li>/app/src/main/java/com/example/couponcraft/MainActivity.kt</li>
          <li>/app/src/main/java/com/example/couponcraft/ui/screens/CouponListScreen.kt</li>
          <li>/app/src/main/java/com/example/couponcraft/viewmodel/CouponViewModel.kt</li>
          <li>/app/src/main/java/com/example/couponcraft/data/CouponRepository.kt</li>
        </ul>
      </div>

      <button onclick="closeAndroidModal()" class="w-full mt-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition">
        Close
      </button>
    </div>
  </div>

  <!-- Toast Message -->
  <div id="toast" class="fixed bottom-5 right-5 bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 transform translate-y-20 opacity-0 transition-all duration-300 z-50">
    <span id="toastMsg">Action completed</span>
  </div>

  <script>
    let allCoupons = [];
    let currentStatusFilter = 'all';
    let currentTypeFilter = 'all';

    function showToast(msg, isError = false) {
      const toast = document.getElementById('toast');
      const toastMsg = document.getElementById('toastMsg');
      toastMsg.innerText = msg;
      toast.className = 'fixed bottom-5 right-5 ' + (isError ? 'bg-rose-700' : 'bg-stone-900') + ' text-white px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 transform translate-y-0 opacity-100 transition-all duration-300 z-50';
      setTimeout(() => {
        toast.className = 'fixed bottom-5 right-5 bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 transform translate-y-20 opacity-0 transition-all duration-300 z-50';
      }, 3200);
    }

    async function fetchCoupons() {
      try {
        const res = await fetch('/api/coupons');
        const data = await res.json();
        if (data.success) {
          allCoupons = data.coupons || [];
          renderCoupons();
        }
      } catch (err) {
        showToast('Error loading coupons', true);
      }
    }

    function setExampleSearch(term) {
      const input = document.getElementById('searchInput');
      input.value = term;
      renderCoupons();
    }

    function setStatusFilter(status) {
      currentStatusFilter = status;
      ['all', 'active', 'inactive'].forEach(s => {
        const btn = document.getElementById('filterStatus' + s.charAt(0).toUpperCase() + s.slice(1));
        if (s === status) {
          btn.className = 'px-3 py-1 rounded-lg bg-white shadow-xs font-semibold text-stone-900';
        } else {
          btn.className = 'px-3 py-1 rounded-lg text-stone-600 hover:text-stone-900';
        }
      });
      renderCoupons();
    }

    function setTypeFilter(type) {
      currentTypeFilter = type;
      ['all', 'percentage', 'flat'].forEach(t => {
        const btn = document.getElementById('filterType' + t.charAt(0).toUpperCase() + t.slice(1));
        if (t === type) {
          btn.className = 'px-3 py-1 rounded-lg bg-white shadow-xs font-semibold text-stone-900';
        } else {
          btn.className = 'px-3 py-1 rounded-lg text-stone-600 hover:text-stone-900';
        }
      });
      renderCoupons();
    }

    function renderCoupons() {
      const query = document.getElementById('searchInput').value.trim().toLowerCase();
      const sort = document.getElementById('sortSelect').value;

      let filtered = allCoupons.filter(c => {
        if (currentStatusFilter !== 'all' && c.status !== currentStatusFilter) return false;
        if (currentTypeFilter !== 'all' && c.type !== currentTypeFilter) return false;
        if (query) {
          const matchCode = c.code.toLowerCase().includes(query);
          const matchName = c.name.toLowerCase().includes(query);
          const matchDesc = (c.description || '').toLowerCase().includes(query);
          if (!matchCode && !matchName && !matchDesc) return false;
        }
        return true;
      });

      filtered.sort((a, b) => {
        if (sort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
        if (sort === 'discount') return b.discountValue - a.discountValue;
        if (sort === 'redemptions') return (b.usageCount || 0) - (a.usageCount || 0);
        if (sort === 'expiry') {
          const expA = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity;
          const expB = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity;
          return expA - expB;
        }
        return 0;
      });

      const container = document.getElementById('couponsContainer');
      if (filtered.length === 0) {
        container.innerHTML = \`
          <div class="col-span-full bg-white p-12 text-center rounded-3xl border border-stone-200 shadow-xs">
            <span class="text-4xl block mb-2">🏷️</span>
            <p class="font-bold text-stone-900 text-sm">No matching coupons found</p>
            <p class="text-xs text-stone-500 mt-1">Try tweaking your search or filter keywords, or tap Create / Upload Coupon.</p>
          </div>
        \`;
        return;
      }

      container.innerHTML = filtered.map(c => {
        const isActive = c.status === 'active';
        const isExpired = c.expiryDate && new Date(c.expiryDate).getTime() < Date.now();
        const discountBadge = c.type === 'percentage' ? \`\${c.discountValue}% OFF\` : \`₹\${c.discountValue} FLAT\`;
        const expiryFormatted = c.expiryDate ? new Date(c.expiryDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never Expires';
        const usageLimitText = c.totalUsageLimit ? \`\${c.usageCount || 0} / \${c.totalUsageLimit} used\` : \`\${c.usageCount || 0} redeemed\`;
        const percentUsed = c.totalUsageLimit ? Math.min(100, Math.round(((c.usageCount || 0) / c.totalUsageLimit) * 100)) : 0;

        return \`
          <div class="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs hover:border-stone-400/80 transition flex flex-col justify-between">
            <div>
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-2">
                  <span class="font-mono font-bold text-base bg-stone-100 text-stone-900 px-3 py-1 rounded-xl border border-stone-200 tracking-wider">
                    \${c.code}
                  </span>
                  <button onclick="copyCode('\${c.code}')" class="text-stone-400 hover:text-stone-800 text-xs px-2 py-1 rounded-lg hover:bg-stone-100 transition" title="Copy Code">
                    📋
                  </button>
                </div>

                <div class="flex items-center gap-2">
                  <span class="text-[11px] font-bold px-2.5 py-1 rounded-lg border \${c.type === 'percentage' ? 'bg-amber-50 text-amber-900 border-amber-300' : 'bg-emerald-50 text-emerald-900 border-emerald-300'}">
                    Type: \${c.type === 'percentage' ? 'Percentage (' + c.discountValue + '%)' : 'Flat (₹' + c.discountValue + ')'}
                  </span>
                  <button onclick="toggleStatus('\${c.id}')" class="w-8 h-5 flex items-center rounded-full p-0.5 transition \${isActive ? 'bg-stone-900 justify-end' : 'bg-stone-300 justify-start'}" title="Toggle Active/Disabled">
                    <div class="w-4 h-4 rounded-full bg-white shadow-xs"></div>
                  </button>
                </div>
              </div>

              <div class="inline-block mt-2 px-2 py-0.5 rounded-md text-[11px] font-medium bg-stone-100 text-stone-700 border border-stone-200">
                Discount Type: <b class="capitalize text-stone-900 font-bold">\${c.type}</b> (\${c.type === 'percentage' ? c.discountValue + '% discount' : '₹' + c.discountValue + ' flat off'})
              </div>

              <h3 class="font-bold text-stone-900 text-sm mt-2">\${c.name}</h3>
              <p class="text-xs text-stone-500 mt-1 line-clamp-2">\${c.description || 'No description provided.'}</p>
            </div>

            <div class="mt-4 pt-4 border-t border-stone-100 space-y-2 text-xs">
              <div class="flex justify-between text-stone-600">
                <span>Min Order: <b>₹\${c.minOrderValue || 0}</b></span>
                <span>\${c.maxDiscountCap ? \`Max Cap: <b>₹\${c.maxDiscountCap}</b>\` : 'No cap'}</span>
              </div>
              <div class="flex justify-between text-stone-600">
                <span>Expires: <b class="\${isExpired ? 'text-rose-600 font-bold' : ''}">\${expiryFormatted}</b></span>
                <span>Per User: <b>\${c.perUserLimit || 1}x</b></span>
              </div>

              <!-- Usage Bar -->
              <div>
                <div class="flex justify-between text-[11px] text-stone-400 mb-1">
                  <span>Usage Rate</span>
                  <span>\${usageLimitText}</span>
                </div>
                <div class="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                  <div class="bg-stone-800 h-full rounded-full" style="width: \${percentUsed}%"></div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex justify-end gap-2 pt-2">
                <button onclick="openEditModal('\${c.id}')" class="px-2.5 py-1 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition">
                  Edit
                </button>
                <button onclick="deleteCoupon('\${c.id}')" class="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition">
                  Delete
                </button>
              </div>
            </div>
          </div>
        \`;
      }).join('');
    }

    function copyCode(code) {
      navigator.clipboard.writeText(code);
      showToast(\`Copied "\${code}" to clipboard!\`);
    }

    async function toggleStatus(id) {
      try {
        const res = await fetch(\`/api/coupons/\${id}/status\`, { method: 'PATCH' });
        const data = await res.json();
        if (data.success) {
          showToast(\`Coupon is now \${data.coupon.status === 'active' ? 'Active' : 'Disabled'}\`);
          await fetchCoupons();
        }
      } catch (err) {
        showToast('Failed to toggle status', true);
      }
    }

    async function deleteCoupon(id) {
      if (!confirm('Are you sure you want to delete this coupon?')) return;
      try {
        const res = await fetch(\`/api/coupons/\${id}\`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          showToast('Coupon deleted');
          await fetchCoupons();
        }
      } catch (err) {
        showToast('Failed to delete coupon', true);
      }
    }

    async function syncData() {
      const btn = document.getElementById('syncBtn');
      btn.innerHTML = '<span class="text-sm">🔄</span><span>Syncing...</span>';
      try {
        const res = await fetch('/api/coupons/sync', { method: 'POST' });
        const data = await res.json();
        showToast(data.message || 'Synchronized with database');
        await fetchCoupons();
      } catch (err) {
        showToast('Sync error', true);
      } finally {
        btn.innerHTML = '<span class="text-sm">🔄</span><span>Sync</span>';
      }
    }

    // Modal Tabs
    function switchModalTab(tab) {
      const tabFormBtn = document.getElementById('tabFormBtn');
      const tabUploadBtn = document.getElementById('tabUploadBtn');
      const tabFormContent = document.getElementById('tabFormContent');
      const tabUploadContent = document.getElementById('tabUploadContent');

      if (tab === 'form') {
        tabFormBtn.className = 'px-4 py-2.5 text-xs font-bold border-b-2 border-stone-900 text-stone-900 flex items-center gap-1.5';
        tabUploadBtn.className = 'px-4 py-2.5 text-xs font-semibold border-b-2 border-transparent text-stone-500 hover:text-stone-800 flex items-center gap-1.5';
        tabFormContent.classList.remove('hidden');
        tabUploadContent.classList.add('hidden');
      } else {
        tabUploadBtn.className = 'px-4 py-2.5 text-xs font-bold border-b-2 border-stone-900 text-stone-900 flex items-center gap-1.5';
        tabFormBtn.className = 'px-4 py-2.5 text-xs font-semibold border-b-2 border-transparent text-stone-500 hover:text-stone-800 flex items-center gap-1.5';
        tabUploadContent.classList.remove('hidden');
        tabFormContent.classList.add('hidden');
      }
    }

    // Create / Edit Modal Logic
    function openCreateModal() {
      document.getElementById('modalTitle').innerText = 'Create or Upload Coupons';
      document.getElementById('editId').value = '';
      document.getElementById('couponForm').reset();
      document.getElementById('fStatus').checked = true;
      switchModalTab('form');
      document.getElementById('couponModal').classList.remove('hidden');
    }

    function openEditModal(id) {
      const coupon = allCoupons.find(c => c.id === id);
      if (!coupon) return;

      document.getElementById('modalTitle').innerText = 'Edit Coupon';
      document.getElementById('editId').value = coupon.id;
      document.getElementById('fCode').value = coupon.code;
      document.getElementById('fName').value = coupon.name;
      document.getElementById('fType').value = coupon.type;
      document.getElementById('fValue').value = coupon.discountValue;
      document.getElementById('fMinOrder').value = coupon.minOrderValue || '';
      document.getElementById('fMaxOrder').value = coupon.maxOrderValue || '';
      document.getElementById('fMaxCap').value = coupon.maxDiscountCap || '';
      document.getElementById('fExpiry').value = coupon.expiryDate ? coupon.expiryDate.split('T')[0] : '';
      document.getElementById('fTotalLimit').value = coupon.totalUsageLimit || '';
      document.getElementById('fPerUser').value = coupon.perUserLimit || 1;
      document.getElementById('fDesc').value = coupon.description || '';
      document.getElementById('fStatus').checked = coupon.status === 'active';

      switchModalTab('form');
      document.getElementById('couponModal').classList.remove('hidden');
    }

    function closeCouponModal() {
      document.getElementById('couponModal').classList.add('hidden');
    }

    async function handleSaveCoupon(e) {
      e.preventDefault();
      const id = document.getElementById('editId').value;
      const payload = {
        code: document.getElementById('fCode').value.trim().toUpperCase(),
        name: document.getElementById('fName').value.trim(),
        type: document.getElementById('fType').value,
        discountValue: parseFloat(document.getElementById('fValue').value),
        minOrderValue: parseFloat(document.getElementById('fMinOrder').value) || 0,
        maxOrderValue: document.getElementById('fMaxOrder').value ? parseFloat(document.getElementById('fMaxOrder').value) : null,
        maxDiscountCap: document.getElementById('fMaxCap').value ? parseFloat(document.getElementById('fMaxCap').value) : null,
        expiryDate: document.getElementById('fExpiry').value ? new Date(document.getElementById('fExpiry').value).toISOString() : null,
        totalUsageLimit: document.getElementById('fTotalLimit').value ? parseInt(document.getElementById('fTotalLimit').value) : null,
        perUserLimit: parseInt(document.getElementById('fPerUser').value) || 1,
        description: document.getElementById('fDesc').value.trim(),
        status: document.getElementById('fStatus').checked ? 'active' : 'inactive'
      };

      try {
        const url = id ? \`/api/coupons/\${id}\` : '/api/coupons';
        const method = id ? 'PUT' : 'POST';
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          showToast(id ? 'Coupon updated!' : 'Coupon created!');
          closeCouponModal();
          await fetchCoupons();
        } else {
          showToast(data.error || 'Failed to save coupon', true);
        }
      } catch (err) {
        showToast('Error saving coupon', true);
      }
    }

    function handleFileSelect(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(evt) {
        document.getElementById('jsonPasteInput').value = evt.target.result;
      };
      reader.readAsText(file);
    }

    async function handleBatchUpload() {
      const text = document.getElementById('jsonPasteInput').value.trim();
      if (!text) {
        showToast('Please paste JSON or choose a file first', true);
        return;
      }

      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (err) {
        showToast('Invalid JSON syntax: ' + err.message, true);
        return;
      }

      const list = Array.isArray(parsed) ? parsed : [parsed];
      try {
        const res = await fetch('/api/coupons/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coupons: list })
        });
        const data = await res.json();
        if (data.success) {
          showToast(\`Successfully imported \${data.count} coupons!\`);
          closeCouponModal();
          await fetchCoupons();
        } else {
          showToast(data.error || 'Upload failed', true);
        }
      } catch (err) {
        showToast('Batch upload error', true);
      }
    }

    function openAndroidModal() {
      document.getElementById('androidModal').classList.remove('hidden');
    }

    function closeAndroidModal() {
      document.getElementById('androidModal').classList.add('hidden');
    }

    // Initial fetch
    fetchCoupons();
  </script>
</body>
</html>`;
}

// Request dispatcher
const server = http.createServer(async (req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;
  const method = req.method.toUpperCase();

  // CORS Preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  // Serve App Icon
  if ((method === 'GET' || method === 'HEAD') && (pathname === '/app_icon.png' || pathname === '/icon.png' || pathname === '/favicon.ico' || pathname === '/favicon.png')) {
    const iconFile = path.join(__dirname, 'public_app_icon.png');
    if (fs.existsSync(iconFile)) {
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*'
      });
      if (method === 'HEAD') return res.end();
      return fs.createReadStream(iconFile).pipe(res);
    }
  }

  // 1. GET /api/coupons
  if (method === 'GET' && pathname === '/api/coupons') {
    return sendJson(res, 200, { success: true, coupons });
  }

  // 2. POST /api/coupons/bulk (Batch upload)
  if (method === 'POST' && pathname === '/api/coupons/bulk') {
    const body = await parseBody(req);
    const newItems = Array.isArray(body.coupons) ? body.coupons : [];
    if (newItems.length === 0) {
      return sendJson(res, 400, { success: false, error: 'No coupons provided in array.' });
    }

    let addedCount = 0;
    for (const item of newItems) {
      const code = (item.code || '').trim().toUpperCase();
      if (!code) continue;

      const existingIdx = coupons.findIndex(c => c.code === code);
      const couponObj = {
        id: item.id || ('cp_' + Math.random().toString(36).substring(2, 10)),
        name: item.name || code,
        code,
        type: item.type === 'flat' ? 'flat' : 'percentage',
        discountValue: parseFloat(item.discountValue) || 10,
        minOrderValue: parseFloat(item.minOrderValue) || 0,
        maxOrderValue: item.maxOrderValue ? parseFloat(item.maxOrderValue) : null,
        maxDiscountCap: item.maxDiscountCap ? parseFloat(item.maxDiscountCap) : null,
        expiryDate: item.expiryDate || null,
        totalUsageLimit: item.totalUsageLimit ? parseInt(item.totalUsageLimit) : null,
        perUserLimit: item.perUserLimit ? parseInt(item.perUserLimit) : 1,
        usageCount: item.usageCount || 0,
        userRedemptions: item.userRedemptions || {},
        status: item.status === 'inactive' ? 'inactive' : 'active',
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: item.description || ''
      };

      if (existingIdx >= 0) {
        coupons[existingIdx] = couponObj;
      } else {
        coupons.unshift(couponObj);
      }
      addedCount++;
    }

    saveCoupons();
    return sendJson(res, 200, { success: true, count: addedCount, coupons });
  }

  // 3. POST /api/coupons (Single Create)
  if (method === 'POST' && pathname === '/api/coupons') {
    const body = await parseBody(req);
    const code = (body.code || '').trim().toUpperCase();
    if (!code) {
      return sendJson(res, 400, { success: false, error: 'Coupon code is required.' });
    }
    if (coupons.some(c => c.code === code)) {
      return sendJson(res, 400, { success: false, error: `Coupon code "${code}" already exists.` });
    }

    const newCoupon = {
      id: 'cp_' + Math.random().toString(36).substring(2, 10),
      name: body.name || code,
      code,
      type: body.type || 'percentage',
      discountValue: parseFloat(body.discountValue) || 10,
      minOrderValue: parseFloat(body.minOrderValue) || 0,
      maxOrderValue: body.maxOrderValue ? parseFloat(body.maxOrderValue) : null,
      maxDiscountCap: body.maxDiscountCap ? parseFloat(body.maxDiscountCap) : null,
      expiryDate: body.expiryDate || null,
      totalUsageLimit: body.totalUsageLimit ? parseInt(body.totalUsageLimit) : null,
      perUserLimit: body.perUserLimit ? parseInt(body.perUserLimit) : 1,
      usageCount: 0,
      userRedemptions: {},
      status: body.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: body.description || ''
    };

    coupons.unshift(newCoupon);
    saveCoupons();
    return sendJson(res, 201, { success: true, coupon: newCoupon });
  }

  // 4. PUT /api/coupons/:id
  if (method === 'PUT' && pathname.startsWith('/api/coupons/')) {
    const id = pathname.replace('/api/coupons/', '');
    const idx = coupons.findIndex(c => c.id === id);
    if (idx === -1) {
      return sendJson(res, 404, { success: false, error: 'Coupon not found.' });
    }

    const body = await parseBody(req);
    const code = (body.code || coupons[idx].code).trim().toUpperCase();

    if (coupons.some(c => c.id !== id && c.code === code)) {
      return sendJson(res, 400, { success: false, error: `Coupon code "${code}" already in use.` });
    }

    coupons[idx] = {
      ...coupons[idx],
      name: body.name || coupons[idx].name,
      code,
      type: body.type || coupons[idx].type,
      discountValue: body.discountValue !== undefined ? parseFloat(body.discountValue) : coupons[idx].discountValue,
      minOrderValue: body.minOrderValue !== undefined ? parseFloat(body.minOrderValue) : coupons[idx].minOrderValue,
      maxOrderValue: body.maxOrderValue !== undefined ? (body.maxOrderValue ? parseFloat(body.maxOrderValue) : null) : coupons[idx].maxOrderValue,
      maxDiscountCap: body.maxDiscountCap !== undefined ? (body.maxDiscountCap ? parseFloat(body.maxDiscountCap) : null) : coupons[idx].maxDiscountCap,
      expiryDate: body.expiryDate !== undefined ? body.expiryDate : coupons[idx].expiryDate,
      totalUsageLimit: body.totalUsageLimit !== undefined ? (body.totalUsageLimit ? parseInt(body.totalUsageLimit) : null) : coupons[idx].totalUsageLimit,
      perUserLimit: body.perUserLimit !== undefined ? parseInt(body.perUserLimit) : coupons[idx].perUserLimit,
      status: body.status || coupons[idx].status,
      description: body.description !== undefined ? body.description : coupons[idx].description,
      updatedAt: new Date().toISOString()
    };

    saveCoupons();
    return sendJson(res, 200, { success: true, coupon: coupons[idx] });
  }

  // 5. PATCH /api/coupons/:id/status
  if (method === 'PATCH' && pathname.includes('/status')) {
    const id = pathname.replace('/api/coupons/', '').replace('/status', '');
    const idx = coupons.findIndex(c => c.id === id);
    if (idx === -1) {
      return sendJson(res, 404, { success: false, error: 'Coupon not found.' });
    }

    coupons[idx].status = coupons[idx].status === 'active' ? 'inactive' : 'active';
    coupons[idx].updatedAt = new Date().toISOString();
    saveCoupons();
    return sendJson(res, 200, { success: true, coupon: coupons[idx] });
  }

  // 6. DELETE /api/coupons/:id
  if (method === 'DELETE' && pathname.startsWith('/api/coupons/')) {
    const id = pathname.replace('/api/coupons/', '');
    const idx = coupons.findIndex(c => c.id === id);
    if (idx === -1) {
      return sendJson(res, 404, { success: false, error: 'Coupon not found.' });
    }

    const removed = coupons.splice(idx, 1)[0];
    saveCoupons();
    return sendJson(res, 200, { success: true, coupon: removed });
  }

  // 7. POST /api/coupons/sync
  if (method === 'POST' && pathname === '/api/coupons/sync') {
    coupons = loadCoupons();
    return sendJson(res, 200, {
      success: true,
      message: `Synchronized ${coupons.length} coupons with database.`,
      coupons
    });
  }

  // Serve Frontend HTML (GET & HEAD)
  if ((method === 'GET' || method === 'HEAD') && (pathname === '/' || pathname === '/index.html')) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    if (method === 'HEAD') return res.end();
    return res.end(getHtml());
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, HOST, () => {
  console.log(`CouponCraft server running at http://${HOST}:${PORT}`);
});
