package com.edumaster.data.models

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.Date

@Entity(tableName = "cards")
data class Card(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val courseId: Long,
    val question: String,
    val answer: String,
    val hint: String = "",
    val category: String,

    // Spaced Repetition Fields (SM-2 Algorithm)
    val interval: Int = 1,           // Days until next review
    val easeFactor: Float = 2.5f,    // Ease factor (quality multiplier)
    val repetitions: Int = 0,        // Number of correct repetitions
    val nextReview: Date = Date(),   // Next review date
    val lastReviewed: Date? = null,  // Last review date

    // Statistics
    val timesReviewed: Int = 0,
    val timesCorrect: Int = 0,
    val timesIncorrect: Int = 0,

    val createdAt: Date = Date(),
    val updatedAt: Date = Date()
)
