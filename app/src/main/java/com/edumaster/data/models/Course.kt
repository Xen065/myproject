package com.edumaster.data.models

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.Date

@Entity(tableName = "courses")
data class Course(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val name: String,
    val description: String,
    val category: String,
    val icon: String,               // Emoji or icon identifier
    val price: Int = 0,             // Price in coins (0 = owned)
    val isOwned: Boolean = false,
    val isPurchased: Boolean = false,
    val rating: Float = 0f,
    val totalRatings: Int = 0,
    val totalCards: Int = 0,
    val cardsCompleted: Int = 0,
    val cardsDue: Int = 0,
    val createdAt: Date = Date(),
    val lastStudied: Date? = null
) {
    val progress: Int
        get() = if (totalCards > 0) (cardsCompleted * 100 / totalCards) else 0
}
