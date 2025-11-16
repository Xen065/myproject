package com.edumaster.data.models

import java.util.Date

/**
 * Wrapper class for calendar display that combines study sessions with additional info
 */
data class CalendarEvent(
    val id: Long,
    val courseId: Long,
    val courseName: String,
    val courseIcon: String,
    val scheduledDate: Date,
    val scheduledTime: String,
    val durationMinutes: Int,
    val isCompleted: Boolean,
    val cardsReviewed: Int,
    val cardsCorrect: Int,
    val isRecurring: Boolean = false,
    val recurringPatternId: Long? = null
) {
    val accuracy: Float
        get() = if (cardsReviewed > 0) {
            (cardsCorrect.toFloat() / cardsReviewed) * 100
        } else 0f
}
