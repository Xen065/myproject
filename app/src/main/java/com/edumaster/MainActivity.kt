package com.edumaster

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.NavHostFragment
import androidx.navigation.ui.setupWithNavController
import com.edumaster.data.database.AppDatabase
import com.edumaster.data.repository.EduMasterRepository
import com.edumaster.databinding.ActivityMainBinding
import com.edumaster.notifications.NotificationHelper
import com.edumaster.notifications.StudyReminderScheduler
import com.edumaster.ui.onboarding.OnboardingActivity
import com.edumaster.utils.ThemeHelper
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var repository: EduMasterRepository

    override fun onCreate(savedInstanceState: Bundle?) {
        // Apply saved theme preference
        ThemeHelper.applyTheme(ThemeHelper.getThemeMode(this))

        // Install splash screen
        installSplashScreen()

        super.onCreate(savedInstanceState)

        // Check if onboarding has been completed
        if (!isOnboardingCompleted()) {
            startActivity(Intent(this, OnboardingActivity::class.java))
            finish()
            return
        }

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Initialize database and repository
        val database = AppDatabase.getDatabase(applicationContext)
        repository = EduMasterRepository(
            database.cardDao(),
            database.courseDao(),
            database.studySessionDao(),
            database.userStatsDao(),
            database.achievementDao()
        )

        // Initialize notifications
        initializeNotifications()

        setupNavigation()
        observeUserStats()
        setupClickListeners()
    }

    private fun initializeNotifications() {
        // Create notification channel
        NotificationHelper.createNotificationChannel(this)

        // Schedule daily study reminder (default: 7 PM)
        val prefs = getSharedPreferences("app_prefs", MODE_PRIVATE)
        val isReminderEnabled = prefs.getBoolean("reminder_enabled", true)

        if (isReminderEnabled) {
            val reminderHour = prefs.getInt("reminder_hour", 19)
            val reminderMinute = prefs.getInt("reminder_minute", 0)
            StudyReminderScheduler.scheduleDailyReminder(this, reminderHour, reminderMinute)
        }
    }

    private fun setupNavigation() {
        val navHostFragment = supportFragmentManager
            .findFragmentById(R.id.nav_host_fragment) as NavHostFragment
        val navController = navHostFragment.navController

        binding.bottomNavigation.setupWithNavController(navController)
    }

    private fun observeUserStats() {
        repository.getUserStats().observe(this) { userStats ->
            userStats?.let {
                binding.tvStreakCount.text = it.currentStreak.toString()
                binding.tvTotalCards.text = it.totalCardsStudied.toString()
                binding.tvTodayGoal.text = "${it.accuracy.toInt()}%"
                binding.tvUserLevel.text = it.level.toString()
            }
        }
    }

    private fun setupClickListeners() {
        binding.btnNotifications.setOnClickListener {
            // TODO: Show notifications
        }

        binding.btnSettings.setOnClickListener {
            showThemeDialog()
        }
    }

    private fun showThemeDialog() {
        val themes = arrayOf("Light", "Dark", "System Default")
        val currentTheme = ThemeHelper.getThemeMode(this)

        androidx.appcompat.app.AlertDialog.Builder(this)
            .setTitle("Choose Theme")
            .setSingleChoiceItems(themes, currentTheme) { dialog, which ->
                ThemeHelper.saveThemeMode(this, which)
                dialog.dismiss()
                // Recreate activity to apply theme
                recreate()
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    fun getRepository(): EduMasterRepository = repository

    private fun isOnboardingCompleted(): Boolean {
        val prefs = getSharedPreferences("app_prefs", MODE_PRIVATE)
        return prefs.getBoolean("onboarding_completed", false)
    }
}
