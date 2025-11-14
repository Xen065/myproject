package com.edumaster.data.models

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.Date

@Entity(tableName = "study_sessions")
data class StudySession(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val courseId: Long,
    val courseName: String,
    val scheduledDate: Date,
    val scheduledTime: String,      // Format: "HH:mm"
    val durationMinutes: Int = 30,
    val isCompleted: Boolean = false,
    val cardsReviewed: Int = 0,
    val cardsCorrect: Int = 0,
    val actualDurationMinutes: Int = 0,
    val createdAt: Date = Date(),
    val completedAt: Date? = null
)
