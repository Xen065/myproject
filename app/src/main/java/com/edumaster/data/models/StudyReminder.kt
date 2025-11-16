package com.edumaster.data.models

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.Date

@Entity(tableName = "study_reminders")
data class StudyReminder(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val studySessionId: Long,
    val reminderTime: Date,  // When to send the notification
    val minutesBefore: Int,  // How many minutes before the session
    val isEnabled: Boolean = true,
    val isSent: Boolean = false,
    val createdAt: Date = Date()
)
