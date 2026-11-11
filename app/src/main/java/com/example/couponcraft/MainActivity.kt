package com.example.couponcraft

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.couponcraft.ui.screens.CouponListScreen
import com.example.couponcraft.ui.theme.CouponCraftTheme
import com.example.couponcraft.viewmodel.CouponViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            CouponCraftTheme {
                val viewModel: CouponViewModel = viewModel()
                CouponListScreen(viewModel = viewModel)
            }
        }
    }
}
