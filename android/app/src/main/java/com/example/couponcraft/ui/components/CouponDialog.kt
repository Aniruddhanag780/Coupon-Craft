package com.example.couponcraft.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.couponcraft.model.Coupon
import com.example.couponcraft.model.CouponStatus
import com.example.couponcraft.model.CouponType
import com.example.couponcraft.ui.theme.Emerald600
import com.example.couponcraft.ui.theme.Rose600
import com.example.couponcraft.ui.theme.Stone100
import com.example.couponcraft.ui.theme.Stone200
import com.example.couponcraft.ui.theme.Stone300
import com.example.couponcraft.ui.theme.Stone400
import com.example.couponcraft.ui.theme.Stone500
import com.example.couponcraft.ui.theme.Stone600
import com.example.couponcraft.ui.theme.Stone700
import com.example.couponcraft.ui.theme.Stone800
import com.example.couponcraft.ui.theme.Stone900
import java.util.UUID

@Composable
fun CouponDialog(
    isOpen: Boolean,
    onClose: () -> Unit,
    editingCoupon: Coupon? = null,
    onSave: (
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
    ) -> Boolean
) {
    if (!isOpen) return

    var name by remember(editingCoupon) { mutableStateOf(editingCoupon?.name ?: "") }
    var code by remember(editingCoupon) { mutableStateOf(editingCoupon?.code ?: "") }
    var type by remember(editingCoupon) { mutableStateOf(editingCoupon?.type ?: CouponType.PERCENTAGE) }
    var discountValueStr by remember(editingCoupon) {
        mutableStateOf(editingCoupon?.discountValue?.let { if (it % 1.0 == 0.0) it.toLong().toString() else it.toString() } ?: "")
    }
    var minOrderStr by remember(editingCoupon) {
        mutableStateOf(editingCoupon?.minOrderValue?.let { if (it > 0) it.toLong().toString() else "" } ?: "")
    }
    var maxOrderStr by remember(editingCoupon) {
        mutableStateOf(editingCoupon?.maxOrderValue?.let { if (it > 0) it.toLong().toString() else "" } ?: "")
    }
    var maxDiscountCapStr by remember(editingCoupon) {
        mutableStateOf(editingCoupon?.maxDiscountCap?.let { if (it > 0) it.toLong().toString() else "" } ?: "")
    }
    var totalUsageLimitStr by remember(editingCoupon) {
        mutableStateOf(editingCoupon?.totalUsageLimit?.toString() ?: "")
    }
    var perUserLimitStr by remember(editingCoupon) {
        mutableStateOf(editingCoupon?.perUserLimit?.toString() ?: "1")
    }
    var status by remember(editingCoupon) { mutableStateOf(editingCoupon?.status ?: CouponStatus.ACTIVE) }
    var description by remember(editingCoupon) { mutableStateOf(editingCoupon?.description ?: "") }

    var errorMessage by remember { mutableStateOf<String?>(null) }

    fun generateRandomCode() {
        val prefix = if (type == CouponType.PERCENTAGE) "SALE" else "SAVE"
        val rand = UUID.randomUUID().toString().substring(0, 4).uppercase()
        code = "${prefix}_$rand"
    }

    Dialog(
        onDismissRequest = onClose,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Card(
            modifier = Modifier
                .padding(16.dp)
                .fillMaxWidth(0.95f)
                .testTag("coupon_modal_dialog"),
            shape = RoundedCornerShape(28.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFFFAF8F5))
        ) {
            Column(modifier = Modifier.fillMaxWidth()) {
                // Header
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color.White)
                        .padding(horizontal = 20.dp, vertical = 16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = if (editingCoupon != null) "Edit Coupon Campaign" else "Create New Coupon",
                            style = MaterialTheme.typography.titleLarge,
                            color = Stone900
                        )
                        Text(
                            text = "Set discount values, constraints, and limits",
                            fontSize = 12.sp,
                            color = Stone500
                        )
                    }
                    IconButton(onClick = onClose, modifier = Modifier.testTag("close_coupon_dialog")) {
                        Icon(imageVector = Icons.Default.Close, contentDescription = "Close", tint = Stone700)
                    }
                }

                // Scrollable Body
                Column(
                    modifier = Modifier
                        .weight(1f, fill = false)
                        .verticalScroll(rememberScrollState())
                        .padding(20.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    if (errorMessage != null) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(12.dp))
                                .background(Color(0xFFFFEBEB))
                                .padding(12.dp)
                        ) {
                            Text(text = errorMessage!!, fontSize = 12.sp, color = Rose600, fontWeight = FontWeight.Medium)
                        }
                    }

                    // Type Selector: Percentage vs Flat
                    Text(text = "COUPON TYPE", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Stone700)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        TypeSelectorOption(
                            title = "Percentage",
                            subtitle = "e.g. 15% or 30% off",
                            isSelected = type == CouponType.PERCENTAGE,
                            onClick = { type = CouponType.PERCENTAGE },
                            modifier = Modifier.weight(1f)
                        )
                        TypeSelectorOption(
                            title = "Flat Discount",
                            subtitle = "e.g. ₹100 or ₹250 fixed",
                            isSelected = type == CouponType.FLAT,
                            onClick = { type = CouponType.FLAT },
                            modifier = Modifier.weight(1f)
                        )
                    }

                    // Campaign Name
                    OutlinedTextField(
                        value = name,
                        onValueChange = { name = it },
                        label = { Text("Coupon Campaign Name *") },
                        placeholder = { Text("e.g. Spring Flash Sale") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("input_coupon_name"),
                        shape = RoundedCornerShape(14.dp),
                        singleLine = true
                    )

                    // Code with Generator Button
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        OutlinedTextField(
                            value = code,
                            onValueChange = { code = it.uppercase() },
                            label = { Text("Coupon Code *") },
                            placeholder = { Text("e.g. SPRING25") },
                            modifier = Modifier
                                .weight(1f)
                                .testTag("input_coupon_code"),
                            shape = RoundedCornerShape(14.dp),
                            singleLine = true,
                            textStyle = androidx.compose.ui.text.TextStyle(
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold
                            )
                        )
                        Button(
                            onClick = { generateRandomCode() },
                            modifier = Modifier
                                .height(56.dp)
                                .testTag("generate_code_button"),
                            shape = RoundedCornerShape(14.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Stone100, contentColor = Stone900)
                        ) {
                            Icon(imageVector = Icons.Default.AutoAwesome, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(text = "Suggest", fontSize = 12.sp)
                        }
                    }

                    // Discount Value & Max Cap
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        OutlinedTextField(
                            value = discountValueStr,
                            onValueChange = { discountValueStr = it },
                            label = { Text(if (type == CouponType.PERCENTAGE) "Discount % *" else "Discount ₹ *") },
                            placeholder = { Text(if (type == CouponType.PERCENTAGE) "20" else "250") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier
                                .weight(1f)
                                .testTag("input_discount_value"),
                            shape = RoundedCornerShape(14.dp),
                            singleLine = true
                        )

                        if (type == CouponType.PERCENTAGE) {
                            OutlinedTextField(
                                value = maxDiscountCapStr,
                                onValueChange = { maxDiscountCapStr = it },
                                label = { Text("Max Cap (₹)") },
                                placeholder = { Text("e.g. 500") },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                modifier = Modifier
                                    .weight(1f)
                                    .testTag("input_max_cap"),
                                shape = RoundedCornerShape(14.dp),
                                singleLine = true
                            )
                        }
                    }

                    // Min & Max Order Values
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        OutlinedTextField(
                            value = minOrderStr,
                            onValueChange = { minOrderStr = it },
                            label = { Text("Min Order (₹)") },
                            placeholder = { Text("0") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier
                                .weight(1f)
                                .testTag("input_min_order"),
                            shape = RoundedCornerShape(14.dp),
                            singleLine = true
                        )

                        OutlinedTextField(
                            value = maxOrderStr,
                            onValueChange = { maxOrderStr = it },
                            label = { Text("Max Order (₹)") },
                            placeholder = { Text("Optional") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier
                                .weight(1f)
                                .testTag("input_max_order"),
                            shape = RoundedCornerShape(14.dp),
                            singleLine = true
                        )
                    }

                    // Total Pool Limit & Per-Customer Limit
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        OutlinedTextField(
                            value = totalUsageLimitStr,
                            onValueChange = { totalUsageLimitStr = it },
                            label = { Text("Pool Limit") },
                            placeholder = { Text("Unlimited") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier
                                .weight(1f)
                                .testTag("input_total_limit"),
                            shape = RoundedCornerShape(14.dp),
                            singleLine = true
                        )

                        OutlinedTextField(
                            value = perUserLimitStr,
                            onValueChange = { perUserLimitStr = it },
                            label = { Text("Per-User Limit *") },
                            placeholder = { Text("1") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier
                                .weight(1f)
                                .testTag("input_per_user_limit"),
                            shape = RoundedCornerShape(14.dp),
                            singleLine = true
                        )
                    }

                    // Status Switch
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(16.dp))
                            .background(Color.White)
                            .border(1.dp, Stone200, RoundedCornerShape(16.dp))
                            .padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(text = "Status: ${if (status == CouponStatus.ACTIVE) "Active" else "Disabled"}", fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
                            Text(text = "Control if customers can redeem this coupon", fontSize = 11.sp, color = Stone500)
                        }
                        Switch(
                            checked = status == CouponStatus.ACTIVE,
                            onCheckedChange = { status = if (it) CouponStatus.ACTIVE else CouponStatus.INACTIVE },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = Color.White,
                                checkedTrackColor = Emerald600,
                                uncheckedThumbColor = Color.White,
                                uncheckedTrackColor = Stone300
                            )
                        )
                    }

                    // Description
                    OutlinedTextField(
                        value = description,
                        onValueChange = { description = it },
                        label = { Text("Description / Terms (Optional)") },
                        placeholder = { Text("Terms of the promotion...") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("input_description"),
                        shape = RoundedCornerShape(14.dp),
                        maxLines = 3
                    )
                }

                // Sticky Footer with Save & Cancel
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color.White)
                        .padding(horizontal = 20.dp, vertical = 16.dp),
                    horizontalArrangement = Arrangement.End,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedButton(
                        onClick = onClose,
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier.testTag("cancel_button")
                    ) {
                        Text("Cancel")
                    }

                    Spacer(modifier = Modifier.width(10.dp))

                    Button(
                        onClick = {
                            if (name.isBlank()) {
                                errorMessage = "Please enter a coupon campaign name."
                                return@Button
                            }
                            if (code.isBlank()) {
                                errorMessage = "Please enter a coupon code."
                                return@Button
                            }
                            val discVal = discountValueStr.toDoubleOrNull()
                            if (discVal == null || discVal <= 0.0) {
                                errorMessage = "Discount value must be greater than 0."
                                return@Button
                            }
                            if (type == CouponType.PERCENTAGE && discVal > 100.0) {
                                errorMessage = "Percentage discount cannot exceed 100%."
                                return@Button
                            }

                            val minVal = minOrderStr.toDoubleOrNull() ?: 0.0
                            val maxVal = maxOrderStr.toDoubleOrNull()
                            if (maxVal != null && maxVal < minVal) {
                                errorMessage = "Max order value cannot be lower than min order value."
                                return@Button
                            }

                            val capVal = if (type == CouponType.PERCENTAGE) maxDiscountCapStr.toDoubleOrNull() else null
                            val totalLimit = totalUsageLimitStr.toIntOrNull()
                            val perUser = perUserLimitStr.toIntOrNull() ?: 1

                            val success = onSave(
                                name,
                                code,
                                type,
                                discVal,
                                minVal,
                                maxVal,
                                capVal,
                                editingCoupon?.expiryDate,
                                totalLimit,
                                perUser,
                                status,
                                description.ifBlank { null }
                            )

                            if (success) {
                                onClose()
                            }
                        },
                        shape = RoundedCornerShape(14.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Stone900),
                        modifier = Modifier.testTag("save_coupon_button")
                    ) {
                        Text(if (editingCoupon != null) "Save Changes" else "Save to Database")
                    }
                }
            }
        }
    }
}

@Composable
private fun TypeSelectorOption(
    title: String,
    subtitle: String,
    isSelected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(16.dp))
            .background(if (isSelected) Stone100 else Color.White)
            .border(
                width = if (isSelected) 2.dp else 1.dp,
                color = if (isSelected) Stone900 else Stone200,
                shape = RoundedCornerShape(16.dp)
            )
            .clickable { onClick() }
            .padding(14.dp)
    ) {
        Column {
            Text(text = title, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = Stone900)
            Spacer(modifier = Modifier.height(2.dp))
            Text(text = subtitle, fontSize = 11.sp, color = Stone500)
        }
    }
}
