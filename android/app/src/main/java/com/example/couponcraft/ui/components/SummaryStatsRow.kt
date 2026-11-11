package com.example.couponcraft.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.couponcraft.model.toIntIfWhole
import com.example.couponcraft.ui.theme.Emerald700
import com.example.couponcraft.ui.theme.Stone400
import com.example.couponcraft.ui.theme.Stone900
import com.example.couponcraft.viewmodel.CouponStats

@Composable
fun SummaryStatsRow(
    stats: CouponStats,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .testTag("summary_stats_row"),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        StatBox(
            title = "TOTAL",
            value = stats.totalCoupons.toString(),
            subtitle = "vouchers",
            modifier = Modifier.weight(1f)
        )
        StatBox(
            title = "ACTIVE",
            value = stats.activeCount.toString(),
            subtitle = "campaigns",
            valueColor = Emerald700,
            modifier = Modifier.weight(1f)
        )
        StatBox(
            title = "REDEEMED",
            value = stats.totalRedemptions.toString(),
            subtitle = "times",
            modifier = Modifier.weight(1f)
        )
        StatBox(
            title = "AVG DISCOUNT",
            value = stats.averageDiscount.toIntIfWhole(),
            subtitle = "value rate",
            modifier = Modifier.weight(1f)
        )
    }
}

@Composable
private fun StatBox(
    title: String,
    value: String,
    subtitle: String,
    valueColor: Color = Stone900,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(16.dp))
            .background(Color.White)
            .border(1.dp, Color(0xFFEFECE6), RoundedCornerShape(16.dp))
            .padding(vertical = 10.dp, horizontal = 8.dp)
    ) {
        Column {
            Text(text = title, fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Stone400)
            Spacer(modifier = Modifier.height(2.dp))
            Text(text = value, fontSize = 16.sp, fontWeight = FontWeight.ExtraBold, color = valueColor)
            Text(text = subtitle, fontSize = 10.sp, color = Stone400)
        }
    }
}
