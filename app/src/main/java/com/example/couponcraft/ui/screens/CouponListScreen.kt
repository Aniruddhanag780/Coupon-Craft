package com.example.couponcraft.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.couponcraft.model.Coupon
import com.example.couponcraft.ui.components.CouponCard
import com.example.couponcraft.ui.components.CouponDialog
import com.example.couponcraft.ui.components.DeleteConfirmDialog
import com.example.couponcraft.ui.theme.BgWarm
import com.example.couponcraft.ui.theme.Emerald600
import com.example.couponcraft.ui.theme.Emerald700
import com.example.couponcraft.ui.theme.Stone100
import com.example.couponcraft.ui.theme.Stone200
import com.example.couponcraft.ui.theme.Stone300
import com.example.couponcraft.ui.theme.Stone400
import com.example.couponcraft.ui.theme.Stone500
import com.example.couponcraft.ui.theme.Stone700
import com.example.couponcraft.ui.theme.Stone900
import com.example.couponcraft.viewmodel.CouponViewModel
import com.example.couponcraft.viewmodel.FilterStatus
import com.example.couponcraft.viewmodel.FilterType
import com.example.couponcraft.viewmodel.SortOption
import kotlinx.coroutines.flow.collectLatest

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CouponListScreen(
    viewModel: CouponViewModel,
    modifier: Modifier = Modifier
) {
    val coupons by viewModel.filteredCoupons.collectAsState()
    val stats by viewModel.stats.collectAsState()
    val searchQuery by viewModel.searchQuery.collectAsState()
    val statusFilter by viewModel.statusFilter.collectAsState()
    val typeFilter by viewModel.typeFilter.collectAsState()
    val sortBy by viewModel.sortBy.collectAsState()

    val snackbarHostState = remember { SnackbarHostState() }

    var isCreateDialogOpen by remember { mutableStateOf(false) }
    var editingCoupon by remember { mutableStateOf<Coupon?>(null) }
    var deletingCoupon by remember { mutableStateOf<Coupon?>(null) }

    LaunchedEffect(Unit) {
        viewModel.toastMessage.collectLatest { message ->
            snackbarHostState.showSnackbar(message)
        }
    }

    Scaffold(
        modifier = modifier
            .fillMaxSize()
            .testTag("coupon_list_screen"),
        containerColor = BgWarm,
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "CouponCraft",
                            fontWeight = FontWeight.Bold,
                            fontSize = 20.sp,
                            color = Stone900
                        )
                        Text(
                            text = "The Street Co. Promotions",
                            fontSize = 11.sp,
                            color = Stone500
                        )
                    }
                },
                actions = {
                    IconButton(
                        onClick = { viewModel.syncDatabase() },
                        modifier = Modifier.testTag("sync_db_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Refresh,
                            contentDescription = "Sync Database",
                            tint = Stone700
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = BgWarm)
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { isCreateDialogOpen = true },
                containerColor = Stone900,
                contentColor = Color.White,
                shape = CircleShape,
                modifier = Modifier.testTag("create_coupon_fab")
            ) {
                Icon(imageVector = Icons.Default.Add, contentDescription = "Create Coupon")
            }
        }
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Search Bar with Rounded Corners & Example Text
            item {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { viewModel.setSearchQuery(it) },
                    placeholder = { Text("Search coupons (e.g. WELCOME15, SAVE25)...", fontSize = 13.sp) },
                    leadingIcon = {
                        Icon(imageVector = Icons.Default.Search, contentDescription = null, tint = Stone400)
                    },
                    trailingIcon = {
                        if (searchQuery.isNotEmpty()) {
                            IconButton(onClick = { viewModel.setSearchQuery("") }) {
                                Icon(imageVector = Icons.Default.Close, contentDescription = "Clear", tint = Stone500)
                            }
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("coupon_search_input"),
                    shape = CircleShape,
                    singleLine = true
                )
            }

            // Filter Chips (Status & Type)
            item {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    // Status filters
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        FilterChip(
                            label = "All Status (${stats.totalCoupons})",
                            isSelected = statusFilter == FilterStatus.ALL,
                            onClick = { viewModel.setStatusFilter(FilterStatus.ALL) },
                            testTag = "filter_status_all"
                        )
                        FilterChip(
                            label = "Active (${stats.activeCount})",
                            isSelected = statusFilter == FilterStatus.ACTIVE,
                            onClick = { viewModel.setStatusFilter(FilterStatus.ACTIVE) },
                            testTag = "filter_status_active"
                        )
                        FilterChip(
                            label = "Disabled (${stats.totalCoupons - stats.activeCount})",
                            isSelected = statusFilter == FilterStatus.INACTIVE,
                            onClick = { viewModel.setStatusFilter(FilterStatus.INACTIVE) },
                            testTag = "filter_status_inactive"
                        )
                    }

                    // Type filters & Sort
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        FilterChip(
                            label = "All Types",
                            isSelected = typeFilter == FilterType.ALL,
                            onClick = { viewModel.setTypeFilter(FilterType.ALL) },
                            testTag = "filter_type_all"
                        )
                        FilterChip(
                            label = "% Percentage",
                            isSelected = typeFilter == FilterType.PERCENTAGE,
                            onClick = { viewModel.setTypeFilter(FilterType.PERCENTAGE) },
                            testTag = "filter_type_percentage"
                        )
                        FilterChip(
                            label = "₹ Flat Discount",
                            isSelected = typeFilter == FilterType.FLAT,
                            onClick = { viewModel.setTypeFilter(FilterType.FLAT) },
                            testTag = "filter_type_flat"
                        )

                        Spacer(modifier = Modifier.width(6.dp))

                        // Sort chip
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .background(Stone100)
                                .clickable {
                                    val next = when (sortBy) {
                                        SortOption.NEWEST -> SortOption.DISCOUNT
                                        SortOption.DISCOUNT -> SortOption.REDEMPTIONS
                                        SortOption.REDEMPTIONS -> SortOption.EXPIRY
                                        SortOption.EXPIRY -> SortOption.NEWEST
                                    }
                                    viewModel.setSortBy(next)
                                }
                                .padding(horizontal = 10.dp, vertical = 6.dp)
                                .testTag("sort_button")
                        ) {
                            Text(
                                text = "Sort: ${sortBy.name}",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Stone700
                            )
                        }
                    }
                }
            }

            // Coupon Cards List
            if (coupons.isEmpty()) {
                item {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 24.dp)
                            .testTag("empty_state_card"),
                        shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(36.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(
                                imageVector = Icons.Default.LocalOffer,
                                contentDescription = null,
                                tint = Stone300,
                                modifier = Modifier.size(44.dp)
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(
                                text = "No matching coupons found",
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp,
                                color = Stone900
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "Try modifying your search or filters, or tap + to create a new coupon campaign.",
                                fontSize = 12.sp,
                                color = Stone500,
                                modifier = Modifier.padding(horizontal = 12.dp)
                            )
                        }
                    }
                }
            } else {
                items(coupons, key = { it.id }) { coupon ->
                    CouponCard(
                        coupon = coupon,
                        onEdit = { editingCoupon = it },
                        onDelete = { deletingCoupon = it },
                        onToggleStatus = { viewModel.toggleCouponStatus(it) }
                    )
                }
            }

            // Bottom space for FAB
            item {
                Spacer(modifier = Modifier.height(72.dp))
            }
        }
    }

    // Create Modal
    CouponDialog(
        isOpen = isCreateDialogOpen,
        onClose = { isCreateDialogOpen = false },
        editingCoupon = null,
        onSave = { name, code, type, disc, minO, maxO, cap, exp, totalL, perU, st, desc ->
            viewModel.createCoupon(name, code, type, disc, minO, maxO, cap, exp, totalL, perU, st, desc)
        }
    )

    // Edit Modal
    CouponDialog(
        isOpen = editingCoupon != null,
        onClose = { editingCoupon = null },
        editingCoupon = editingCoupon,
        onSave = { name, code, type, disc, minO, maxO, cap, exp, totalL, perU, st, desc ->
            val id = editingCoupon?.id ?: return@CouponDialog false
            viewModel.updateCoupon(id, name, code, type, disc, minO, maxO, cap, exp, totalL, perU, st, desc)
        }
    )

    // Delete Confirm Modal
    DeleteConfirmDialog(
        coupon = deletingCoupon,
        onDismiss = { deletingCoupon = null },
        onConfirm = {
            viewModel.deleteCoupon(it.id)
            deletingCoupon = null
        }
    )
}

@Composable
private fun FilterChip(
    label: String,
    isSelected: Boolean,
    onClick: () -> Unit,
    testTag: String
) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(12.dp))
            .background(if (isSelected) Stone900 else Color.White)
            .border(1.dp, if (isSelected) Stone900 else Stone200, RoundedCornerShape(12.dp))
            .clickable { onClick() }
            .padding(horizontal = 12.dp, vertical = 6.dp)
            .testTag(testTag)
    ) {
        Text(
            text = label,
            fontSize = 12.sp,
            fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Normal,
            color = if (isSelected) Color.White else Stone700
        )
    }
}
