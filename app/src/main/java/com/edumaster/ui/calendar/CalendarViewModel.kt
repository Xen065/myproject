package com.edumaster.ui.calendar

import androidx.lifecycle.LiveData
import androidx.lifecycle.ViewModel
import com.edumaster.data.models.StudySession
import com.edumaster.data.models.UserStats
import com.edumaster.data.repository.EduMasterRepository
import java.util.Date

class CalendarViewModel(private val repository: EduMasterRepository) : ViewModel() {

    // User stats for streak information
    val userStats: LiveData<UserStats?> = repository.getUserStats()

    // All study sessions
    val allSessions: LiveData<List<StudySession>> = repository.getAllSessions()

    // Upcoming sessions
    val upcomingSessions: LiveData<List<StudySession>> = repository.getUpcomingSessions()

    /**
     * Get sessions for a specific date
     */
    fun getSessionsByDate(date: Date): LiveData<List<StudySession>> {
        return repository.getSessionsByDate(date)
    }

    /**
     * Get total study time in hours and minutes
     */
    fun getFormattedDuration(minutes: Int): String {
        val hours = minutes / 60
        val mins = minutes % 60
        return when {
            hours > 0 -> "${hours}h ${mins}m"
            else -> "${mins}m"
        }
    }

    /**
     * Get session accuracy percentage
     */
    fun getSessionAccuracy(session: StudySession): Int {
        return if (session.cardsReviewed > 0) {
            (session.cardsCorrect * 100) / session.cardsReviewed
        } else {
            0
        }
    }

    /**
     * Group sessions by date
     */
    fun groupSessionsByDate(sessions: List<StudySession>): Map<Date, List<StudySession>> {
        return sessions.groupBy {
            // Normalize to start of day
            val calendar = java.util.Calendar.getInstance()
            calendar.time = it.scheduledDate
            calendar.set(java.util.Calendar.HOUR_OF_DAY, 0)
            calendar.set(java.util.Calendar.MINUTE, 0)
            calendar.set(java.util.Calendar.SECOND, 0)
            calendar.set(java.util.Calendar.MILLISECOND, 0)
            calendar.time
        }
    }
}
