package com.example.couponcraft.model

import java.text.NumberFormat
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlin.math.min

data class ValidationRequest(
    val code: String,
    val orderValue: Double,
    val customerId: String = "",
    val customerEmail: String = ""
)

data class SavingsBreakdown(
    val type: CouponType,
    val value: Double,
    val rawDiscount: Double,
    val capped: Boolean
)

data class ValidationResult(
    val isValid: Boolean,
    val coupon: Coupon? = null,
    val code: String = "",
    val discountAmount: Double = 0.0,
    val finalOrderValue: Double = 0.0,
    val reason: String = "",
    val savingsBreakdown: SavingsBreakdown? = null
)

object CouponValidator {

    fun formatCurrency(amount: Double): String {
        val format = NumberFormat.getCurrencyInstance(Locale("en", "IN"))
        return format.format(amount)
    }

    fun formatDate(timestamp: Long?): String {
        if (timestamp == null) return "Never Expires"
        val sdf = SimpleDateFormat("MMM d, yyyy", Locale.getDefault())
        return sdf.format(Date(timestamp))
    }

    fun validateCouponCheckout(
        coupon: Coupon?,
        request: ValidationRequest
    ): ValidationResult {
        val code = request.code.trim().uppercase()
        val orderValue = request.orderValue
        val userIdentifier = (if (request.customerId.isNotBlank()) request.customerId else request.customerEmail)
            .trim().lowercase()

        if (coupon == null) {
            return ValidationResult(
                isValid = false,
                code = code,
                discountAmount = 0.0,
                finalOrderValue = orderValue,
                reason = "Coupon code \"$code\" does not exist."
            )
        }

        // 1. Status Check
        if (coupon.status != CouponStatus.ACTIVE) {
            return ValidationResult(
                isValid = false,
                coupon = coupon,
                code = coupon.code,
                discountAmount = 0.0,
                finalOrderValue = orderValue,
                reason = "Coupon \"${coupon.code}\" is currently inactive or disabled."
            )
        }

        // 2. Expiry Date Check
        if (coupon.expiryDate != null && System.currentTimeMillis() > coupon.expiryDate) {
            return ValidationResult(
                isValid = false,
                coupon = coupon,
                code = coupon.code,
                discountAmount = 0.0,
                finalOrderValue = orderValue,
                reason = "Coupon \"${coupon.code}\" expired on ${formatDate(coupon.expiryDate)}."
            )
        }

        // 3. Minimum Order Value Check
        if (coupon.minOrderValue > 0 && orderValue < coupon.minOrderValue) {
            val diff = coupon.minOrderValue - orderValue
            return ValidationResult(
                isValid = false,
                coupon = coupon,
                code = coupon.code,
                discountAmount = 0.0,
                finalOrderValue = orderValue,
                reason = "Cart total (${formatCurrency(orderValue)}) is below the minimum order value of ${formatCurrency(coupon.minOrderValue)}. Add ${formatCurrency(diff)} more to redeem."
            )
        }

        // 4. Maximum Order Value Check
        if (coupon.maxOrderValue != null && coupon.maxOrderValue > 0 && orderValue > coupon.maxOrderValue) {
            return ValidationResult(
                isValid = false,
                coupon = coupon,
                code = coupon.code,
                discountAmount = 0.0,
                finalOrderValue = orderValue,
                reason = "Cart total (${formatCurrency(orderValue)}) exceeds the maximum order limit of ${formatCurrency(coupon.maxOrderValue)} for this coupon."
            )
        }

        // 5. Overall Redemption Limit Check
        if (coupon.totalUsageLimit != null && coupon.totalUsageLimit > 0) {
            if (coupon.usageCount >= coupon.totalUsageLimit) {
                return ValidationResult(
                    isValid = false,
                    coupon = coupon,
                    code = coupon.code,
                    discountAmount = 0.0,
                    finalOrderValue = orderValue,
                    reason = "Coupon \"${coupon.code}\" has reached its maximum total redemption limit (${coupon.totalUsageLimit} uses)."
                )
            }
        }

        // 6. Per-Customer Redemption Limit Check
        if (userIdentifier.isNotBlank() && coupon.perUserLimit > 0) {
            val userCount = coupon.userRedemptions[userIdentifier] ?: 0
            if (userCount >= coupon.perUserLimit) {
                val times = if (coupon.perUserLimit == 1) "time" else "times"
                return ValidationResult(
                    isValid = false,
                    coupon = coupon,
                    code = coupon.code,
                    discountAmount = 0.0,
                    finalOrderValue = orderValue,
                    reason = "You have reached the maximum redemption limit (${coupon.perUserLimit} $times) for this coupon."
                )
            }
        }

        // 7. Calculate Discount
        var discountAmount: Double
        val rawDiscount: Double
        var capped = false

        if (coupon.type == CouponType.PERCENTAGE) {
            rawDiscount = Math.round(((orderValue * coupon.discountValue) / 100.0) * 100.0) / 100.0
            discountAmount = rawDiscount

            if (coupon.maxDiscountCap != null && coupon.maxDiscountCap > 0 && discountAmount > coupon.maxDiscountCap) {
                discountAmount = coupon.maxDiscountCap
                capped = true
            }
        } else {
            rawDiscount = coupon.discountValue
            discountAmount = min(coupon.discountValue, orderValue)
        }

        discountAmount = min(discountAmount, orderValue)
        val finalOrderValue = Math.max(0.0, Math.round((orderValue - discountAmount) * 100.0) / 100.0)

        return ValidationResult(
            isValid = true,
            coupon = coupon,
            code = coupon.code,
            discountAmount = discountAmount,
            finalOrderValue = finalOrderValue,
            reason = "Coupon applied successfully!",
            savingsBreakdown = SavingsBreakdown(
                type = coupon.type,
                value = coupon.discountValue,
                rawDiscount = rawDiscount,
                capped = capped
            )
        )
    }
}
