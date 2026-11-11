package com.example.couponcraft.data

import com.example.couponcraft.model.Coupon
import com.example.couponcraft.model.CouponStatus
import com.example.couponcraft.model.CouponType
import java.util.Calendar

object SampleCoupons {
    fun getInitialCoupons(): List<Coupon> {
        val now = System.currentTimeMillis()
        val cal = Calendar.getInstance()
        cal.add(Calendar.DAY_OF_YEAR, 60)
        val futureExpiry = cal.timeInMillis

        cal.time = java.util.Date()
        cal.add(Calendar.DAY_OF_YEAR, 14)
        val shortExpiry = cal.timeInMillis

        return listOf(
            Coupon(
                id = "cp_welcome15",
                name = "New Customer Welcome",
                code = "WELCOME15",
                type = CouponType.PERCENTAGE,
                discountValue = 15.0,
                minOrderValue = 300.0,
                maxOrderValue = 3000.0,
                maxDiscountCap = 450.0,
                expiryDate = futureExpiry,
                totalUsageLimit = 500,
                perUserLimit = 1,
                usageCount = 42,
                userRedemptions = mapOf("user_sample@store.com" to 1),
                status = CouponStatus.ACTIVE,
                description = "Get 15% off on your first order. Minimum purchase of ₹300 required."
            ),
            Coupon(
                id = "cp_save250",
                name = "Weekend Flat Savings",
                code = "SAVE250",
                type = CouponType.FLAT,
                discountValue = 250.0,
                minOrderValue = 800.0,
                maxOrderValue = null,
                maxDiscountCap = null,
                expiryDate = shortExpiry,
                totalUsageLimit = 200,
                perUserLimit = 2,
                usageCount = 88,
                userRedemptions = mapOf("alex@shopper.io" to 1),
                status = CouponStatus.ACTIVE,
                description = "Flat ₹250 discount on any order exceeding ₹800. Limit 2 times per customer."
            ),
            Coupon(
                id = "cp_flash100",
                name = "Flash Sale Flat Discount",
                code = "FLASH100",
                type = CouponType.FLAT,
                discountValue = 100.0,
                minOrderValue = 250.0,
                maxOrderValue = 1500.0,
                maxDiscountCap = null,
                expiryDate = null,
                totalUsageLimit = 1000,
                perUserLimit = 3,
                usageCount = 154,
                userRedemptions = emptyMap(),
                status = CouponStatus.ACTIVE,
                description = "Evergreen ₹100 off small carts between ₹250 and ₹1500."
            ),
            Coupon(
                id = "cp_vip30",
                name = "VIP Member Tier Discount",
                code = "VIP30",
                type = CouponType.PERCENTAGE,
                discountValue = 30.0,
                minOrderValue = 1000.0,
                maxOrderValue = null,
                maxDiscountCap = 900.0,
                expiryDate = null,
                totalUsageLimit = null,
                perUserLimit = 5,
                usageCount = 67,
                userRedemptions = emptyMap(),
                status = CouponStatus.ACTIVE,
                description = "Exclusive 30% discount for loyalty club members up to ₹900 max discount."
            ),
            Coupon(
                id = "cp_clearance40",
                name = "Seasonal Clearance (Paused)",
                code = "CLEAR40",
                type = CouponType.PERCENTAGE,
                discountValue = 40.0,
                minOrderValue = 1200.0,
                maxOrderValue = 10000.0,
                maxDiscountCap = 1500.0,
                expiryDate = now - 86400000L * 5, // expired 5 days ago
                totalUsageLimit = 150,
                perUserLimit = 1,
                usageCount = 150,
                userRedemptions = emptyMap(),
                status = CouponStatus.INACTIVE,
                description = "Archived clearance campaign. Currently disabled."
            )
        )
    }
}
