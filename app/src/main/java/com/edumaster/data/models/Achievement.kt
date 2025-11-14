package com.edumaster.data.models

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.Date

@Entity(tableName = "achievements")
data class Achievement(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val name: String,
    val description: String,
    val icon: String,           // Emoji or icon identifier
    val isUnlocked: Boolean = false,
    val unlockedAt: Date? = null,
    val category: String,       // e.g., "streak", "study", "completion"
    val requirement: Int,       // Required value to unlock
    val currentProgress: Int = 0
) {
    val progressPercentage: Int
        get() = if (requirement > 0) (currentProgress * 100 / requirement).coerceIn(0, 100) else 0
}
