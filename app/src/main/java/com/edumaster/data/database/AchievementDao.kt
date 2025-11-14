package com.edumaster.data.database

import androidx.lifecycle.LiveData
import androidx.room.*
import com.edumaster.data.models.Achievement

@Dao
interface AchievementDao {
    @Query("SELECT * FROM achievements ORDER BY isUnlocked DESC, id ASC")
    fun getAllAchievements(): LiveData<List<Achievement>>

    @Query("SELECT * FROM achievements WHERE isUnlocked = 1 ORDER BY unlockedAt DESC")
    fun getUnlockedAchievements(): LiveData<List<Achievement>>

    @Query("SELECT * FROM achievements WHERE isUnlocked = 0 ORDER BY id ASC")
    fun getLockedAchievements(): LiveData<List<Achievement>>

    @Query("SELECT * FROM achievements WHERE id = :achievementId")
    suspend fun getAchievementById(achievementId: Long): Achievement?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAchievement(achievement: Achievement): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAchievements(achievements: List<Achievement>)

    @Update
    suspend fun updateAchievement(achievement: Achievement)

    @Query("UPDATE achievements SET currentProgress = :progress WHERE id = :achievementId")
    suspend fun updateProgress(achievementId: Long, progress: Int)

    @Query("UPDATE achievements SET isUnlocked = 1, unlockedAt = :unlockedAt WHERE id = :achievementId")
    suspend fun unlockAchievement(achievementId: Long, unlockedAt: java.util.Date)

    @Query("SELECT COUNT(*) FROM achievements WHERE isUnlocked = 1")
    suspend fun getUnlockedCount(): Int
}
