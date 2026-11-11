package com.example.couponcraft.ui.components

import androidx.compose.animation.AnimatedVisibility
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.couponcraft.model.Coupon
import com.example.couponcraft.model.CouponStatus
import com.example.couponcraft.model.CouponType
import com.example.couponcraft.model.CouponValidator
import com.example.couponcraft.ui.theme.Emerald100
import com.example.couponcraft.ui.theme.Emerald600
import com.example.couponcraft.ui.theme.Emerald700
import com.example.couponcraft.ui.theme.Rose100
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
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun CouponCard(
    coupon: Coupon,
    onEdit: (Coupon) -> Unit,
    onDelete: (Coupon) -> Unit,
    onToggleStatus: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val clipboardManager = LocalClipboardManager.current
    val coroutineScope = rememberCoroutineScope()
    var copied by remember { mutableStateOf(false) }

    val isActive = coupon.status == CouponStatus.ACTIVE
    val isExpired = coupon.isExpired

    Card(
        modifier = modifier
            .fillMaxWidth()
            .testTag("coupon_card_${coupon.code}"),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (!isActive || isExpired) Color(0xFFFAF9F6) else Color.White
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp)
        ) {
            // Row 1: Badges & Status Switch
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // Type Badge
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .background(Stone100)
                            .border(1.dp, Stone200, RoundedCornerShape(12.dp))
                            .padding(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = if (coupon.type == CouponType.PERCENTAGE) "% Percentage" else "₹ Flat Discount",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Stone700
                        )
                    }

                    // Expired Badge
                    if (isExpired) {
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .background(Rose100)
                                .border(1.dp, Rose600.copy(alpha = 0.3f), RoundedCornerShape(12.dp))
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = "Expired",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = Rose600
                            )
                        }
                    }
                }

                // Status Switch
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Switch(
                        checked = isActive,
                        onCheckedChange = { onToggleStatus(coupon.id) },
                        modifier = Modifier.testTag("status_switch_${coupon.code}"),
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = Color.White,
                            checkedTrackColor = Emerald600,
                            uncheckedThumbColor = Color.White,
                            uncheckedTrackColor = Stone300
                        )
                    )
                    Text(
                        text = if (isActive) "Active" else "Disabled",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                        color = if (isActive) Emerald700 else Stone400
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Row 2: Campaign Name & Big Discount
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = coupon.name,
                        style = MaterialTheme.typography.titleLarge,
                        color = Stone900,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )
                    if (!coupon.description.isNullOrBlank()) {
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = coupon.description,
                            style = MaterialTheme.typography.bodyMedium,
                            color = Stone500,
                            maxLines = 2,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }

                Spacer(modifier = Modifier.width(12.dp))

                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        text = coupon.formattedDiscount,
                        fontSize = 24.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = Stone900
                    )
                    if (coupon.type == CouponType.PERCENTAGE && coupon.maxDiscountCap != null && coupon.maxDiscountCap > 0) {
                        Text(
                            text = "Max cap: ${CouponValidator.formatCurrency(coupon.maxDiscountCap)}",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium,
                            color = Stone500
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Row 3: Code Pill with Copy Action
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(Stone100)
                    .border(1.dp, Stone200, RoundedCornerShape(16.dp))
                    .padding(horizontal = 14.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = coupon.code,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    letterSpacing = 1.sp,
                    color = Stone900
                )

                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(10.dp))
                        .background(Color.White)
                        .border(1.dp, Stone200, RoundedCornerShape(10.dp))
                        .clickable {
                            clipboardManager.setText(AnnotatedString(coupon.code))
                            copied = true
                            coroutineScope.launch {
                                delay(2000)
                                copied = false
                            }
                        }
                        .padding(horizontal = 10.dp, vertical = 6.dp)
                        .testTag("copy_button_${coupon.code}"),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    if (copied) {
                        Icon(
                            imageVector = Icons.Default.Check,
                            contentDescription = "Copied",
                            tint = Emerald600,
                            modifier = Modifier.size(14.dp)
                        )
                        Text(text = "Copied", fontSize = 11.sp, color = Emerald700, fontWeight = FontWeight.SemiBold)
                    } else {
                        Icon(
                            imageVector = Icons.Default.ContentCopy,
                            contentDescription = "Copy code",
                            tint = Stone600,
                            modifier = Modifier.size(14.dp)
                        )
                        Text(text = "Copy", fontSize = 11.sp, color = Stone700, fontWeight = FontWeight.SemiBold)
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Constraints Grid: Min Order, Max Order, Usage, Per Customer
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                ConstraintPill(
                    label = "MIN ORDER",
                    value = if (coupon.minOrderValue > 0) CouponValidator.formatCurrency(coupon.minOrderValue) else "None",
                    modifier = Modifier.weight(1f)
                )
                ConstraintPill(
                    label = "MAX ORDER",
                    value = if (coupon.maxOrderValue != null && coupon.maxOrderValue > 0)
                        CouponValidator.formatCurrency(coupon.maxOrderValue) else "No ceiling",
                    modifier = Modifier.weight(1f)
                )
            }

            Spacer(modifier = Modifier.height(6.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                ConstraintPill(
                    label = "TOTAL POOL",
                    value = if (coupon.totalUsageLimit != null)
                        "${coupon.usageCount} / ${coupon.totalUsageLimit} uses"
                    else
                        "${coupon.usageCount} (Unlimited)",
                    modifier = Modifier.weight(1f)
                )
                ConstraintPill(
                    label = "PER CUSTOMER",
                    value = "${coupon.perUserLimit} ${if (coupon.perUserLimit == 1) "time" else "times"} max",
                    modifier = Modifier.weight(1f)
                )
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Footer: Expiry info + Edit & Delete buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Schedule,
                        contentDescription = null,
                        tint = Stone400,
                        modifier = Modifier.size(14.dp)
                    )
                    Text(
                        text = if (coupon.expiryDate != null)
                            "Expires ${CouponValidator.formatDate(coupon.expiryDate)}"
                        else
                            "Never Expires",
                        fontSize = 12.sp,
                        color = if (isExpired) Rose600 else Stone500,
                        fontWeight = if (isExpired) FontWeight.SemiBold else FontWeight.Normal
                    )
                }

                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    IconButton(
                        onClick = { onEdit(coupon) },
                        modifier = Modifier
                            .size(36.dp)
                            .testTag("edit_coupon_${coupon.code}")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Edit,
                            contentDescription = "Edit coupon ${coupon.name}",
                            tint = Stone600,
                            modifier = Modifier.size(18.dp)
                        )
                    }

                    IconButton(
                        onClick = { onDelete(coupon) },
                        modifier = Modifier
                            .size(36.dp)
                            .testTag("delete_coupon_${coupon.code}")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Delete,
                            contentDescription = "Delete coupon ${coupon.name}",
                            tint = Rose600,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun ConstraintPill(
    label: String,
    value: String,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(12.dp))
            .background(Color(0xFFF9F8F6))
            .border(1.dp, Stone100, RoundedCornerShape(12.dp))
            .padding(horizontal = 10.dp, vertical = 6.dp)
    ) {
        Column {
            Text(text = label, fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Stone400)
            Spacer(modifier = Modifier.height(2.dp))
            Text(text = value, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Stone800, maxLines = 1)
        }
    }
}
