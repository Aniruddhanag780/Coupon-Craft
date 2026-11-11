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
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Error
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
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
import com.example.couponcraft.model.CouponValidator
import com.example.couponcraft.model.ValidationResult
import com.example.couponcraft.ui.theme.Emerald100
import com.example.couponcraft.ui.theme.Emerald600
import com.example.couponcraft.ui.theme.Emerald700
import com.example.couponcraft.ui.theme.Rose100
import com.example.couponcraft.ui.theme.Rose600
import com.example.couponcraft.ui.theme.Stone100
import com.example.couponcraft.ui.theme.Stone200
import com.example.couponcraft.ui.theme.Stone500
import com.example.couponcraft.ui.theme.Stone700
import com.example.couponcraft.ui.theme.Stone900

@Composable
fun CheckoutSimulatorDialog(
    isOpen: Boolean,
    onClose: () -> Unit,
    simulationResult: ValidationResult?,
    onSimulate: (code: String, orderValue: Double, customerId: String, customerEmail: String) -> Unit,
    onRedeem: (code: String, orderValue: Double, customerId: String, customerEmail: String) -> Unit
) {
    if (!isOpen) return

    var cartValueStr by remember { mutableStateOf("1200") }
    var couponCode by remember { mutableStateOf("WELCOME15") }
    var customerEmail by remember { mutableStateOf("customer@streetco.com") }

    Dialog(
        onDismissRequest = onClose,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Card(
            modifier = Modifier
                .padding(16.dp)
                .fillMaxWidth(0.95f)
                .testTag("checkout_simulator_dialog"),
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
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(RoundedCornerShape(10.dp))
                                .background(Stone100),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.ShoppingCart,
                                contentDescription = null,
                                tint = Stone900,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        Column {
                            Text(
                                text = "Checkout Simulator",
                                style = MaterialTheme.typography.titleLarge,
                                color = Stone900
                            )
                            Text(
                                text = "Test rules & validate vouchers in real-time",
                                fontSize = 12.sp,
                                color = Stone500
                            )
                        }
                    }

                    IconButton(onClick = onClose, modifier = Modifier.testTag("close_simulator")) {
                        Icon(imageVector = Icons.Default.Close, contentDescription = "Close", tint = Stone700)
                    }
                }

                // Body
                Column(
                    modifier = Modifier
                        .weight(1f, fill = false)
                        .verticalScroll(rememberScrollState())
                        .padding(20.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    OutlinedTextField(
                        value = cartValueStr,
                        onValueChange = { cartValueStr = it },
                        label = { Text("Cart Subtotal (₹)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("input_simulator_cart_val"),
                        shape = RoundedCornerShape(14.dp),
                        singleLine = true
                    )

                    OutlinedTextField(
                        value = couponCode,
                        onValueChange = { couponCode = it.uppercase() },
                        label = { Text("Coupon Code") },
                        placeholder = { Text("e.g. WELCOME15") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("input_simulator_code"),
                        shape = RoundedCornerShape(14.dp),
                        singleLine = true,
                        textStyle = androidx.compose.ui.text.TextStyle(
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold
                        )
                    )

                    OutlinedTextField(
                        value = customerEmail,
                        onValueChange = { customerEmail = it },
                        label = { Text("Customer Email / Identifier") },
                        placeholder = { Text("alex@example.com") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("input_simulator_email"),
                        shape = RoundedCornerShape(14.dp),
                        singleLine = true
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Button(
                            onClick = {
                                val value = cartValueStr.toDoubleOrNull() ?: 0.0
                                onSimulate(couponCode, value, customerEmail, customerEmail)
                            },
                            shape = RoundedCornerShape(14.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Stone900),
                            modifier = Modifier
                                .weight(1f)
                                .testTag("validate_coupon_button")
                        ) {
                            Text("Validate Cart")
                        }

                        Button(
                            onClick = {
                                val value = cartValueStr.toDoubleOrNull() ?: 0.0
                                onRedeem(couponCode, value, customerEmail, customerEmail)
                            },
                            shape = RoundedCornerShape(14.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Emerald600),
                            modifier = Modifier
                                .weight(1f)
                                .testTag("redeem_coupon_button")
                        ) {
                            Text("Redeem Code")
                        }
                    }

                    // Simulation Feedback Card
                    if (simulationResult != null) {
                        Spacer(modifier = Modifier.height(6.dp))
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("simulation_result_card"),
                            shape = RoundedCornerShape(18.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = if (simulationResult.isValid) Emerald100 else Rose100
                            )
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Icon(
                                        imageVector = if (simulationResult.isValid) Icons.Default.CheckCircle else Icons.Default.Error,
                                        contentDescription = null,
                                        tint = if (simulationResult.isValid) Emerald700 else Rose600,
                                        modifier = Modifier.size(20.dp)
                                    )
                                    Text(
                                        text = if (simulationResult.isValid) "COUPON VALID" else "VALIDATION FAILED",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 13.sp,
                                        color = if (simulationResult.isValid) Emerald700 else Rose600
                                    )
                                }

                                Spacer(modifier = Modifier.height(8.dp))

                                Text(
                                    text = simulationResult.reason,
                                    fontSize = 13.sp,
                                    color = Stone900,
                                    fontWeight = FontWeight.Medium
                                )

                                if (simulationResult.isValid) {
                                    Spacer(modifier = Modifier.height(12.dp))
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Text(text = "Discount Applied:", fontSize = 12.sp, color = Stone700)
                                        Text(
                                            text = "-${CouponValidator.formatCurrency(simulationResult.discountAmount)}",
                                            fontSize = 13.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = Emerald700
                                        )
                                    }
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Text(text = "Final Checkout Total:", fontSize = 12.sp, color = Stone700)
                                        Text(
                                            text = CouponValidator.formatCurrency(simulationResult.finalOrderValue),
                                            fontSize = 15.sp,
                                            fontWeight = FontWeight.ExtraBold,
                                            color = Stone900
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
