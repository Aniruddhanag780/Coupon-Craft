# CouponCraft - Android Application

CouponCraft is a coupon management and promotions platform built with **Kotlin** and **Jetpack Compose**, adopting modern Android Material 3 design and Clean Architecture.

## Features

- **Coupon Engine**:
  - Support for both **Percentage (%)** and **Flat (₹)** discount campaigns.
  - Subtotal threshold rules: Minimum Order Value and Maximum Order Value.
  - Margin protection: Percentage Discount Max Cap (e.g. 20% off up to ₹500).
  - Expiry timestamp scheduling and status (Active vs Expired).
  - Customer redemption constraints: Total Pool Usage Limit and Per-Customer Limit.
- **Interactive Checkout Simulator**:
  - Live validation simulator to test cart values and customer IDs against coupon rules in real-time.
  - Direct "Redeem Voucher" simulation with usage counter increments.
- **Coupon Campaign Management**:
  - Instant toggle switch for enabling/disabling coupons.
  - One-tap copy-to-clipboard for coupon codes with animated feedback.
  - Full CRUD: Create, Edit, Delete with safety confirmations.
  - Search by code, name, and description.
  - Real-time filtering by Status (Active, Disabled) and Type (Percentage, Flat).
  - Sorting by Newest, Highest Discount, Most Redemptions, and Expiry.
- **Analytics & Summary Metrics**:
  - Real-time counters: Total Coupons, Active Campaigns, Total Redemptions, and Average Discount Rate.

## Architecture

- **UI Layer**: Jetpack Compose with Material Design 3 (`CouponCraftTheme`).
- **State Management**: `ViewModel` + `StateFlow` (`CouponViewModel`).
- **Data Layer**: Clean repository pattern (`CouponRepository`) backed by the high-speed `CouponValidator` engine.

## Building and Running in Android Studio

1. Open this repository in **Android Studio Ladybug (2024.2.1+)** or newer.
2. Ensure JDK 21 is selected in Gradle Settings (`Settings > Build, Execution, Deployment > Build Tools > Gradle`).
3. Sync Gradle and run on an Android 8.0+ (API 26+) device or emulator.
