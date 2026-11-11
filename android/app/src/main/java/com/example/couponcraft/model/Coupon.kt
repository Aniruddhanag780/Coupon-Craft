package com.example.couponcraft.model

enum class CouponType {
    PERCENTAGE,
    FLAT
}

enum class CouponStatus {
    ACTIVE,
    INACTIVE
}

data class RedemptionRecord(
    val id: String,
    val couponId: String,
    val code: String,
    val customerId: String,
    val customerEmail: String? = null,
    val orderId: String? = null,
    val orderValue: Double,
    val discountApplied: Double,
    val redeemedAt: Long = System.currentTimeMillis()
)

data class Coupon(
    val id: String,
    val name: String,
    val code: String,
    val type: CouponType,
    val discountValue: Double,
    val minOrderValue: Double = 0.0,
    val maxOrderValue: Double? = null,
    val maxDiscountCap: Double? = null,
    val expiryDate: Long? = null, // epoch millis or null
    val totalUsageLimit: Int? = null,
    val perUserLimit: Int = 1,
    val usageCount: Int = 0,
    val userRedemptions: Map<String, Int> = emptyMap(),
    val status: CouponStatus = CouponStatus.ACTIVE,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis(),
    val description: String? = null,
    val source: String? = "CouponCraft Android"
) {
    val isExpired: Boolean
        get() = expiryDate != null && System.currentTimeMillis() > expiryDate

    val isUsageFull: Boolean
        get() = totalUsageLimit != null && usageCount >= totalUsageLimit

    val isActive: Boolean
        get() = status == CouponStatus.ACTIVE && !isExpired && !isUsageFull

    val formattedDiscount: String
        get() = when (type) {
            CouponType.PERCENTAGE -> "${discountValue.toIntIfWhole()}% OFF"
            CouponType.FLAT -> "₹${discountValue.toIntIfWhole()} OFF"
        }
}

fun Double.toIntIfWhole(): String {
    return if (this == this.toLong().toDouble()) {
        this.toLong().toString()
    } else {
        String.format(java.util.Locale.US, "%.2f", this)
    }
}
