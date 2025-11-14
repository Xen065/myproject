package com.edumaster.data.database

import androidx.lifecycle.LiveData
import androidx.room.*
import com.edumaster.data.models.UserStats
import java.util.Date

@Dao
interface UserStatsDao {
    @Query("SELECT * FROM user_stats WHERE id = 1")
    fun getUserStats(): LiveData<UserStats?>

    @Query("SELECT * FROM user_stats WHERE id = 1")
    suspend fun getUserStatsSync(): UserStats?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUserStats(userStats: UserStats)

    @Update
    suspend fun updateUserStats(userStats: UserStats)

    @Query("UPDATE user_stats SET currentStreak = :streak, longestStreak = :longestStreak, lastStudyDate = :date WHERE id = 1")
    suspend fun updateStreak(streak: Int, longestStreak: Int, date: Date)

    @Query("UPDATE user_stats SET coins = coins + :amount WHERE id = 1")
    suspend fun addCoins(amount: Int)

    @Query("UPDATE user_stats SET coins = coins - :amount WHERE id = 1 AND coins >= :amount")
    suspend fun spendCoins(amount: Int): Int

    @Query("UPDATE user_stats SET experiencePoints = experiencePoints + :xp WHERE id = 1")
    suspend fun addExperience(xp: Int)

    @Query("UPDATE user_stats SET level = :level, experiencePoints = :xp WHERE id = 1")
    suspend fun updateLevel(level: Int, xp: Int)

    @Query("UPDATE user_stats SET totalCardsStudied = totalCardsStudied + :count WHERE id = 1")
    suspend fun incrementCardsStudied(count: Int)

    @Query("UPDATE user_stats SET totalStudyMinutes = totalStudyMinutes + :minutes WHERE id = 1")
    suspend fun addStudyTime(minutes: Int)
}
