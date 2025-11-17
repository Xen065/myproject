package com.edumaster.utils

import android.content.Context
import android.content.SharedPreferences
import androidx.appcompat.app.AppCompatDelegate
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.mockito.Mock
import org.mockito.Mockito.*
import org.mockito.MockitoAnnotations

/**
 * Unit tests for ThemeHelper utility class
 */
class ThemeHelperTest {

    @Mock
    private lateinit var mockContext: Context

    @Mock
    private lateinit var mockSharedPreferences: Context

    @Mock
    private lateinit var mockEditor: SharedPreferences.Editor

    @Before
    fun setup() {
        MockitoAnnotations.openMocks(this)
    }

    @Test
    fun `getThemeModeName returns correct name for light theme`() {
        val name = ThemeHelper.getThemeModeName(ThemeHelper.THEME_LIGHT)
        assertEquals("Light", name)
    }

    @Test
    fun `getThemeModeName returns correct name for dark theme`() {
        val name = ThemeHelper.getThemeModeName(ThemeHelper.THEME_DARK)
        assertEquals("Dark", name)
    }

    @Test
    fun `getThemeModeName returns correct name for system theme`() {
        val name = ThemeHelper.getThemeModeName(ThemeHelper.THEME_SYSTEM)
        assertEquals("System Default", name)
    }

    @Test
    fun `getThemeModeName returns system default for invalid mode`() {
        val name = ThemeHelper.getThemeModeName(999)
        assertEquals("System Default", name)
    }

    @Test
    fun `theme constants have expected values`() {
        assertEquals(0, ThemeHelper.THEME_LIGHT)
        assertEquals(1, ThemeHelper.THEME_DARK)
        assertEquals(2, ThemeHelper.THEME_SYSTEM)
    }
}
