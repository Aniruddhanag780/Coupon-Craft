package com.example.couponcraft.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.couponcraft.data.CouponRepository
import com.example.couponcraft.model.Coupon
import com.example.couponcraft.model.CouponStatus
import com.example.couponcraft.model.CouponType
import com.example.couponcraft.model.ValidationRequest
import com.example.couponcraft.model.ValidationResult
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

enum class SortOption {
    NEWEST,
    DISCOUNT,
    EXPIRY,
    REDEMPTIONS
}

enum class FilterStatus {
    ALL,
    ACTIVE,
    INACTIVE
}

enum class FilterType {
    ALL,
    PERCENTAGE,
    FLAT
}

data class CouponStats(
    val totalCoupons: Int = 0,
    val activeCount: Int = 0,
    val totalRedemptions: Int = 0,
    val averageDiscount: Double = 0.0
)

class CouponViewModel(
    private val repository: CouponRepository = CouponRepository()
) : ViewModel() {

    val allCoupons: StateFlow<List<Coupon>> = repository.coupons

    private val _searchQuery = MutableStateFlow("")
    val searchQuery = _searchQuery.asStateFlow()

    private val _statusFilter = MutableStateFlow(FilterStatus.ALL)
    val statusFilter = _statusFilter.asStateFlow()

    private val _typeFilter = MutableStateFlow(FilterType.ALL)
    val typeFilter = _typeFilter.asStateFlow()

    private val _sortBy = MutableStateFlow(SortOption.NEWEST)
    val sortBy = _sortBy.asStateFlow()

    private val _simulationResult = MutableStateFlow<ValidationResult?>(null)
    val simulationResult: StateFlow<ValidationResult?> = _simulationResult.asStateFlow()

    private val _toastMessage = MutableSharedFlow<String>()
    val toastMessage: SharedFlow<String> = _toastMessage.asSharedFlow()

    val filteredCoupons: StateFlow<List<Coupon>> = combine(
        allCoupons,
        _searchQuery,
        _statusFilter,
        _typeFilter,
        _sortBy
    ) { list, query, status, type, sort ->
        list
            .filter { coupon ->
                when (status) {
                    FilterStatus.ALL -> true
                    FilterStatus.ACTIVE -> coupon.status == CouponStatus.ACTIVE
                    FilterStatus.INACTIVE -> coupon.status == CouponStatus.INACTIVE
                }
            }
            .filter { coupon ->
                when (type) {
                    FilterType.ALL -> true
                    FilterType.PERCENTAGE -> coupon.type == CouponType.PERCENTAGE
                    FilterType.FLAT -> coupon.type == CouponType.FLAT
                }
            }
            .filter { coupon ->
                if (query.isBlank()) true
                else {
                    val q = query.trim().lowercase()
                    coupon.code.lowercase().contains(q) ||
                    coupon.name.lowercase().contains(q) ||
                    (coupon.description?.lowercase()?.contains(q) == true)
                }
            }
            .sortedWith { a, b ->
                when (sort) {
                    SortOption.NEWEST -> b.createdAt.compareTo(a.createdAt)
                    SortOption.DISCOUNT -> b.discountValue.compareTo(a.discountValue)
                    SortOption.REDEMPTIONS -> b.usageCount.compareTo(a.usageCount)
                    SortOption.EXPIRY -> {
                        val expA = a.expiryDate ?: Long.MAX_VALUE
                        val expB = b.expiryDate ?: Long.MAX_VALUE
                        expA.compareTo(expB)
                    }
                }
            }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val stats: StateFlow<CouponStats> = allCoupons.combine(_searchQuery) { list, _ ->
        val active = list.count { it.status == CouponStatus.ACTIVE }
        val redemptions = list.sumOf { it.usageCount }
        val avg = if (list.isNotEmpty()) list.map { it.discountValue }.average() else 0.0
        CouponStats(
            totalCoupons = list.size,
            activeCount = active,
            totalRedemptions = redemptions,
            averageDiscount = avg
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), CouponStats())

    fun setSearchQuery(query: String) {
        _searchQuery.value = query
    }

    fun setStatusFilter(filter: FilterStatus) {
        _statusFilter.value = filter
    }

    fun setTypeFilter(filter: FilterType) {
        _typeFilter.value = filter
    }

    fun setSortBy(sort: SortOption) {
        _sortBy.value = sort
    }

    fun createCoupon(
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
    ): Boolean {
        val result = repository.create(
            name = name,
            code = code,
            type = type,
            discountValue = discountValue,
            minOrderValue = minOrderValue,
            maxOrderValue = maxOrderValue,
            maxDiscountCap = maxDiscountCap,
            expiryDate = expiryDate,
            totalUsageLimit = totalUsageLimit,
            perUserLimit = perUserLimit,
            status = status,
            description = description
        )

        return result.fold(
            onSuccess = {
                emitToast("Coupon \"${it.code}\" created successfully.")
                true
            },
            onFailure = {
                emitToast(it.message ?: "Failed to create coupon")
                false
            }
        )
    }

    fun updateCoupon(
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
    ): Boolean {
        val result = repository.update(
            id = id,
            name = name,
            code = code,
            type = type,
            discountValue = discountValue,
            minOrderValue = minOrderValue,
            maxOrderValue = maxOrderValue,
            maxDiscountCap = maxDiscountCap,
            expiryDate = expiryDate,
            totalUsageLimit = totalUsageLimit,
            perUserLimit = perUserLimit,
            status = status,
            description = description
        )

        return result.fold(
            onSuccess = {
                emitToast("Coupon \"${it.code}\" updated.")
                true
            },
            onFailure = {
                emitToast(it.message ?: "Failed to update coupon")
                false
            }
        )
    }

    fun toggleCouponStatus(id: String) {
        val updated = repository.toggleStatus(id)
        if (updated != null) {
            val statusLabel = if (updated.status == CouponStatus.ACTIVE) "Active" else "Disabled"
            emitToast("Coupon \"${updated.code}\" is now $statusLabel.")
        }
    }

    fun deleteCoupon(id: String) {
        val coupon = repository.getById(id)
        val deleted = repository.delete(id)
        if (deleted && coupon != null) {
            emitToast("Coupon \"${coupon.code}\" deleted.")
        }
    }

    fun syncDatabase() {
        val count = repository.syncDatabase()
        emitToast("Synchronized $count coupons with database.")
    }

    fun simulateValidation(code: String, orderValue: Double, customerId: String, customerEmail: String) {
        val request = ValidationRequest(
            code = code,
            orderValue = orderValue,
            customerId = customerId,
            customerEmail = customerEmail
        )
        val result = repository.validateCheckout(request)
        _simulationResult.value = result
    }

    fun redeemInSimulator(code: String, orderValue: Double, customerId: String, customerEmail: String) {
        val request = ValidationRequest(
            code = code,
            orderValue = orderValue,
            customerId = customerId,
            customerEmail = customerEmail
        )
        val result = repository.recordRedemption(request)
        result.fold(
            onSuccess = {
                _simulationResult.value = it
                emitToast("Redeemed! Usage count updated for ${it.code}.")
            },
            onFailure = {
                _simulationResult.value = repository.validateCheckout(request)
                emitToast(it.message ?: "Redemption failed")
            }
        )
    }

    fun clearSimulation() {
        _simulationResult.value = null
    }

    fun resetToDefaults() {
        repository.resetToSampleCoupons()
        emitToast("Reset to sample coupons.")
    }

    private fun emitToast(msg: String) {
        viewModelScope.launch {
            _toastMessage.emit(msg)
        }
    }
}
