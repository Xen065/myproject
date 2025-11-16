package com.edumaster.data.models

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.Date

@Entity(tableName = "recurring_patterns")
data class RecurringPattern(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val studySessionTemplateId: Long,  // References the template session
    val frequency: RecurrenceFrequency,
    val daysOfWeek: List<Int> = emptyList(),  // 1=Sunday, 2=Monday, etc.
    val startDate: Date,
    val endDate: Date? = null,  // null means indefinite
    val isActive: Boolean = true,
    val createdAt: Date = Date()
)

enum class RecurrenceFrequency {
    DAILY,
    WEEKLY,
    BIWEEKLY,
    MONTHLY,
    CUSTOM
}
