package com.example.couponcraft.data

import com.example.couponcraft.model.Coupon
import com.example.couponcraft.model.CouponStatus
import com.example.couponcraft.model.CouponType
import com.example.couponcraft.model.CouponValidator
import com.example.couponcraft.model.ValidationRequest
import com.example.couponcraft.model.ValidationResult
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.UUID

class CouponRepository {

    private val _coupons = MutableStateFlow<List<Coupon>>(SampleCoupons.getInitialCoupons())
    val coupons: StateFlow<List<Coupon>> = _coupons.asStateFlow()

    fun getAll(): List<Coupon> = _coupons.value

    fun getById(id: String): Coupon? = _coupons.value.find { it.id == id }

    fun getByCode(code: String): Coupon? {
        val trimmed = code.trim().uppercase()
        return _coupons.value.find { it.code.equals(trimmed, ignoreCase = true) }
    }

    fun create(
        name: String,
        code: String,
        type: CouponType,
        discountValue: Double,
        minOrderValue: Double = 0.0,
        maxOrderValue: Double? = null,
        maxDiscountCap: Double? = null,
        expiryDate: Long? = null,
        totalUsageLimit: Int? = null,
        perUserLimit: Int = 1,
        status: CouponStatus = CouponStatus.ACTIVE,
        description: String? = null
    ): Result<Coupon> {
        val cleanCode = code.trim().uppercase()
        if (_coupons.value.any { it.code.equals(cleanCode, ignoreCase = true) }) {
            return Result.failure(IllegalArgumentException("Coupon code \"$cleanCode\" already exists!"))
        }

        val newCoupon = Coupon(
            id = "cp_" + UUID.randomUUID().toString().substring(0, 8),
            name = name.trim(),
            code = cleanCode,
            type = type,
            discountValue = discountValue,
            minOrderValue = minOrderValue,
            maxOrderValue = maxOrderValue,
            maxDiscountCap = maxDiscountCap,
            expiryDate = expiryDate,
            totalUsageLimit = totalUsageLimit,
            perUserLimit = perUserLimit,
            usageCount = 0,
            userRedemptions = emptyMap(),
            status = status,
            createdAt = System.currentTimeMillis(),
            updatedAt = System.currentTimeMillis(),
            description = description?.trim()
        )

        _coupons.value = listOf(newCoupon) + _coupons.value
        return Result.success(newCoupon)
    }

    fun update(
        id: String,
        name: String,
        code: String,
        type: CouponType,
        discountValue: Double,
        minOrderValue: Double,
        maxOrderValue: Double?,
        maxDiscountCap: Double?,
        expiryDate: Long?,
        totalUsageLimit: Int?,
        perUserLimit: Int,
        status: CouponStatus,
        description: String?
    ): Result<Coupon> {
        val current = getById(id) ?: return Result.failure(NoSuchElementException("Coupon not found"))
        val cleanCode = code.trim().uppercase()

        if (!current.code.equals(cleanCode, ignoreCase = true) &&
            _coupons.value.any { it.id != id && it.code.equals(cleanCode, ignoreCase = true) }
        ) {
            return Result.failure(IllegalArgumentException("Another coupon with code \"$cleanCode\" already exists!"))
        }

        val updated = current.copy(
            name = name.trim(),
            code = cleanCode,
            type = type,
            discountValue = discountValue,
            minOrderValue = minOrderValue,
            maxOrderValue = maxOrderValue,
            maxDiscountCap = maxDiscountCap,
            expiryDate = expiryDate,
            totalUsageLimit = totalUsageLimit,
            perUserLimit = perUserLimit,
            status = status,
            description = description?.trim(),
            updatedAt = System.currentTimeMillis()
        )

        _coupons.value = _coupons.value.map { if (it.id == id) updated else it }
        return Result.success(updated)
    }

    fun toggleStatus(id: String): Coupon? {
        val current = getById(id) ?: return null
        val nextStatus = if (current.status == CouponStatus.ACTIVE) CouponStatus.INACTIVE else CouponStatus.ACTIVE
        val updated = current.copy(
            status = nextStatus,
            updatedAt = System.currentTimeMillis()
        )
        _coupons.value = _coupons.value.map { if (it.id == id) updated else it }
        return updated
    }

    fun delete(id: String): Boolean {
        val initialSize = _coupons.value.size
        _coupons.value = _coupons.value.filterNot { it.id == id }
        return _coupons.value.size < initialSize
    }

    fun validateCheckout(request: ValidationRequest): ValidationResult {
        val coupon = getByCode(request.code)
        return CouponValidator.validateCouponCheckout(coupon, request)
    }

    fun recordRedemption(request: ValidationRequest): Result<ValidationResult> {
        val valResult = validateCheckout(request)
        if (!valResult.isValid || valResult.coupon == null) {
            return Result.failure(IllegalStateException(valResult.reason.ifBlank { "Invalid coupon" }))
        }

        val coupon = valResult.coupon
        val userIdentifier = (if (request.customerId.isNotBlank()) request.customerId else request.customerEmail)
            .trim().lowercase()

        val updatedRedemptions = coupon.userRedemptions.toMutableMap()
        if (userIdentifier.isNotBlank()) {
            val count = updatedRedemptions[userIdentifier] ?: 0
            updatedRedemptions[userIdentifier] = count + 1
        }

        val updatedCoupon = coupon.copy(
            usageCount = coupon.usageCount + 1,
            userRedemptions = updatedRedemptions,
            updatedAt = System.currentTimeMillis()
        )

        _coupons.value = _coupons.value.map { if (it.id == coupon.id) updatedCoupon else it }

        return Result.success(valResult.copy(coupon = updatedCoupon))
    }

    fun syncDatabase(): Int {
        // Simulates server/cloud database sync
        return _coupons.value.size
    }
}
