package com.edumaster.data.models

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.Date

@Entity(tableName = "user_stats")
data class UserStats(
    @PrimaryKey
    val id: Long = 1, // Single row for user stats
    val username: String = "John Doe",
    val level: Int = 1,
    val experiencePoints: Int = 0,
    val coins: Int = 2450,
    val currentStreak: Int = 0,
    val longestStreak: Int = 0,
    val lastStudyDate: Date? = null,
    val totalCardsStudied: Int = 0,
    val totalStudyMinutes: Int = 0,
    val accuracy: Float = 0f,
    val createdAt: Date = Date(),
    val updatedAt: Date = Date()
) {
    val experienceToNextLevel: Int
        get() = level * 100

    val experienceProgress: Int
        get() = (experiencePoints % experienceToNextLevel)
}
