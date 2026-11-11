package com.example.couponcraft.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val LightColorScheme = lightColorScheme(
    primary = Stone900,
    onPrimary = SurfaceWarm,
    primaryContainer = Stone100,
    onPrimaryContainer = Stone900,
    secondary = Emerald600,
    onSecondary = SurfaceWarm,
    secondaryContainer = Emerald100,
    onSecondaryContainer = Emerald700,
    background = BgWarm,
    onBackground = Stone900,
    surface = SurfaceWarm,
    onSurface = Stone900,
    surfaceVariant = Stone100,
    onSurfaceVariant = Stone700,
    outline = Stone300,
    error = Rose600,
    errorContainer = Rose100,
    onError = SurfaceWarm
)

private val DarkColorScheme = darkColorScheme(
    primary = SurfaceWarm,
    onPrimary = Stone900,
    primaryContainer = Stone800,
    onPrimaryContainer = SurfaceWarm,
    secondary = Emerald500,
    onSecondary = Stone900,
    secondaryContainer = Emerald700,
    onSecondaryContainer = Emerald100,
    background = Stone900,
    onBackground = SurfaceWarm,
    surface = Stone800,
    onSurface = SurfaceWarm,
    surfaceVariant = Stone700,
    onSurfaceVariant = Stone200,
    outline = Stone600,
    error = Rose500,
    errorContainer = Rose600,
    onError = SurfaceWarm
)

@Composable
fun CouponCraftTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as? Activity)?.window
            if (window != null) {
                window.statusBarColor = colorScheme.background.toArgb()
                WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
            }
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
