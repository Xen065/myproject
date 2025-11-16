package com.edumaster.ui.profile

import androidx.lifecycle.LiveData
import androidx.lifecycle.ViewModel
import com.edumaster.data.models.Achievement
import com.edumaster.data.models.UserStats
import com.edumaster.data.repository.EduMasterRepository

class ProfileViewModel(private val repository: EduMasterRepository) : ViewModel() {

    // User stats
    val userStats: LiveData<UserStats?> = repository.getUserStats()

    // Achievements
    val allAchievements: LiveData<List<Achievement>> = repository.getAllAchievements()
    val unlockedAchievements: LiveData<List<Achievement>> = repository.getUnlockedAchievements()

    /**
     * Get total study time in hours and minutes
     */
    fun getFormattedStudyTime(totalMinutes: Int): String {
        val hours = totalMinutes / 60
        val minutes = totalMinutes % 60
        return when {
            hours > 0 -> "${hours}h ${minutes}m"
            else -> "${minutes}m"
        }
    }

    /**
     * Get achievement completion percentage
     */
    fun getAchievementCompletionPercentage(achievements: List<Achievement>): Int {
        if (achievements.isEmpty()) return 0
        val unlocked = achievements.count { it.isUnlocked }
        return (unlocked * 100) / achievements.size
    }

    /**
     * Get level progress percentage
     */
    fun getLevelProgressPercentage(stats: UserStats?): Int {
        if (stats == null) return 0
        val progress = stats.experienceProgress
        val required = stats.experienceToNextLevel
        return if (required > 0) (progress * 100) / required else 0
    }

    /**
     * Format accuracy as percentage
     */
    fun getFormattedAccuracy(accuracy: Float): String {
        return "${accuracy.toInt()}%"
    }
}
