package com.edumaster.ui.profile

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.GridLayoutManager
import com.edumaster.data.database.AppDatabase
import com.edumaster.data.repository.EduMasterRepository
import com.edumaster.databinding.FragmentProfileBinding
import java.text.SimpleDateFormat
import java.util.Locale

class ProfileFragment : Fragment() {

    private var _binding: FragmentProfileBinding? = null
    private val binding get() = _binding!!

    private lateinit var viewModel: ProfileViewModel
    private lateinit var achievementAdapter: AchievementAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentProfileBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // Initialize ViewModel
        val database = AppDatabase.getDatabase(requireContext())
        val repository = EduMasterRepository(
            database.cardDao(),
            database.courseDao(),
            database.studySessionDao(),
            database.userStatsDao(),
            database.achievementDao()
        )
        viewModel = ViewModelProvider(
            this,
            ProfileViewModelFactory(repository)
        )[ProfileViewModel::class.java]

        setupAchievementsRecyclerView()
        setupObservers()
    }

    private fun setupAchievementsRecyclerView() {
        achievementAdapter = AchievementAdapter()
        binding.achievementsRecyclerView.apply {
            layoutManager = GridLayoutManager(requireContext(), 1)
            adapter = achievementAdapter
        }
    }

    private fun setupObservers() {
        // Observe user stats
        viewModel.userStats.observe(viewLifecycleOwner) { stats ->
            stats?.let {
                // Update profile header
                binding.username.text = it.username
                binding.levelBadge.text = "Level ${it.level}"

                // Update XP progress
                val xpProgress = it.experienceProgress
                val xpRequired = it.experienceToNextLevel
                binding.xpProgress.text = "$xpProgress / $xpRequired XP"
                binding.levelProgressBar.progress = viewModel.getLevelProgressPercentage(it)

                // Update stats cards
                binding.cardsStudiedCount.text = formatNumber(it.totalCardsStudied)
                binding.studyTimeCount.text = viewModel.getFormattedStudyTime(it.totalStudyMinutes)
                binding.accuracyPercent.text = viewModel.getFormattedAccuracy(it.accuracy)
                binding.longestStreakCount.text = it.longestStreak.toString()

                // Update account info
                val dateFormat = SimpleDateFormat("MMMM yyyy", Locale.getDefault())
                binding.memberSince.text = dateFormat.format(it.createdAt)
                binding.totalCoins.text = formatNumber(it.coins)
            }
        }

        // Observe achievements
        viewModel.allAchievements.observe(viewLifecycleOwner) { achievements ->
            achievementAdapter.submitList(achievements)

            // Update achievement progress
            val unlocked = achievements.count { it.isUnlocked }
            val total = achievements.size
            val percentage = viewModel.getAchievementCompletionPercentage(achievements)
            binding.achievementProgress.text = "$unlocked/$total ($percentage%)"
        }
    }

    /**
     * Format large numbers with commas
     */
    private fun formatNumber(number: Int): String {
        return String.format(Locale.getDefault(), "%,d", number)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
