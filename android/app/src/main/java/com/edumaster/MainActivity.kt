package com.edumaster

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.NavHostFragment
import androidx.navigation.ui.setupWithNavController
import com.edumaster.data.database.AppDatabase
import com.edumaster.data.repository.EduMasterRepository
import com.edumaster.databinding.ActivityMainBinding
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var repository: EduMasterRepository

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

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

        setupNavigation()
        observeUserStats()
        setupClickListeners()
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
            // TODO: Show settings
        }
    }

    fun getRepository(): EduMasterRepository = repository
}
