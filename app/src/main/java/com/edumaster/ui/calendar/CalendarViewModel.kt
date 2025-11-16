package com.edumaster.ui.calendar

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import com.edumaster.data.database.AppDatabase
import com.edumaster.data.models.*
import com.edumaster.data.repository.EduMasterRepository
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class CalendarViewModel(application: Application) : AndroidViewModel(application) {

    private val repository: EduMasterRepository

    // Selected date for the calendar
    private val _selectedDate = MutableLiveData<Date>(Date())
    val selectedDate: LiveData<Date> = _selectedDate

    // Study sessions for the selected date
    private val _sessionsForSelectedDate = MutableLiveData<List<StudySession>>()
    val sessionsForSelectedDate: LiveData<List<StudySession>> = _sessionsForSelectedDate

    // All upcoming sessions
    val upcomingSessions: LiveData<List<StudySession>>

    // Active recurring patterns
    val activePatterns: LiveData<List<RecurringPattern>>

    // All owned courses for session creation
    val ownedCourses: LiveData<List<Course>>

    // Pending reminders
    val pendingReminders: LiveData<List<StudyReminder>>

    // Calendar events by date (for month view)
    private val _calendarEvents = MutableLiveData<Map<String, List<CalendarEvent>>>()
    val calendarEvents: LiveData<Map<String, List<CalendarEvent>>> = _calendarEvents

    init {
        val database = AppDatabase.getDatabase(application)
        repository = EduMasterRepository(
            database.cardDao(),
            database.courseDao(),
            database.studySessionDao(),
            database.userStatsDao(),
            database.achievementDao(),
            database.recurringPatternDao(),
            database.studyReminderDao()
        )

        upcomingSessions = repository.getUpcomingSessions()
        activePatterns = repository.getAllActivePatterns()
        ownedCourses = repository.getOwnedCourses()
        pendingReminders = repository.getAllPendingReminders()

        loadSessionsForSelectedDate()
    }

    fun selectDate(date: Date) {
        _selectedDate.value = date
        loadSessionsForSelectedDate()
    }

    private fun loadSessionsForSelectedDate() {
        viewModelScope.launch {
            _selectedDate.value?.let { date ->
                repository.getSessionsByDate(date).observeForever { sessions ->
                    _sessionsForSelectedDate.value = sessions
                }
            }
        }
    }

    fun loadCalendarEventsForMonth(year: Int, month: Int) {
        viewModelScope.launch {
            val calendar = Calendar.getInstance()
            calendar.set(year, month, 1, 0, 0, 0)
            calendar.set(Calendar.MILLISECOND, 0)

            val daysInMonth = calendar.getActualMaximum(Calendar.DAY_OF_MONTH)
            val eventMap = mutableMapOf<String, List<CalendarEvent>>()
            val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())

            for (day in 1..daysInMonth) {
                calendar.set(Calendar.DAY_OF_MONTH, day)
                val dateKey = dateFormat.format(calendar.time)
                val events = repository.getCalendarEventsForDate(calendar.time)
                if (events.isNotEmpty()) {
                    eventMap[dateKey] = events
                }
            }

            _calendarEvents.value = eventMap
        }
    }

    suspend fun createStudySession(
        courseId: Long,
        courseName: String,
        scheduledDate: Date,
        scheduledTime: String,
        durationMinutes: Int = 30,
        setReminder: Boolean = false,
        reminderMinutesBefore: Int = 15
    ): Long {
        val session = StudySession(
            courseId = courseId,
            courseName = courseName,
            scheduledDate = scheduledDate,
            scheduledTime = scheduledTime,
            durationMinutes = durationMinutes
        )

        val sessionId = repository.insertSession(session)

        if (setReminder) {
            createReminderForSession(sessionId, scheduledDate, scheduledTime, reminderMinutesBefore)
        }

        loadSessionsForSelectedDate()
        return sessionId
    }

    suspend fun createRecurringSession(
        courseId: Long,
        courseName: String,
        scheduledTime: String,
        durationMinutes: Int,
        frequency: RecurrenceFrequency,
        daysOfWeek: List<Int>,
        startDate: Date,
        endDate: Date?,
        setReminder: Boolean = false,
        reminderMinutesBefore: Int = 15
    ) {
        // Create template session
        val templateSession = StudySession(
            courseId = courseId,
            courseName = courseName,
            scheduledDate = startDate,
            scheduledTime = scheduledTime,
            durationMinutes = durationMinutes
        )
        val templateId = repository.insertSession(templateSession)

        // Create recurring pattern
        val pattern = RecurringPattern(
            studySessionTemplateId = templateId,
            frequency = frequency,
            daysOfWeek = daysOfWeek,
            startDate = startDate,
            endDate = endDate
        )
        repository.insertRecurringPattern(pattern)

        // Generate sessions for the next 30 days
        generateRecurringSessions(pattern, templateSession, 30, setReminder, reminderMinutesBefore)
    }

    private suspend fun generateRecurringSessions(
        pattern: RecurringPattern,
        templateSession: StudySession,
        daysToGenerate: Int,
        setReminder: Boolean,
        reminderMinutesBefore: Int
    ) {
        val calendar = Calendar.getInstance()
        calendar.time = pattern.startDate

        val endCalendar = Calendar.getInstance()
        endCalendar.time = pattern.endDate ?: Date(System.currentTimeMillis() + 365L * 24 * 60 * 60 * 1000)

        val generatedSessions = mutableListOf<StudySession>()
        var daysGenerated = 0

        while (calendar.before(endCalendar) && daysGenerated < daysToGenerate) {
            val dayOfWeek = calendar.get(Calendar.DAY_OF_WEEK)

            val shouldGenerate = when (pattern.frequency) {
                RecurrenceFrequency.DAILY -> true
                RecurrenceFrequency.WEEKLY -> pattern.daysOfWeek.contains(dayOfWeek)
                RecurrenceFrequency.BIWEEKLY -> {
                    val weeksDiff = ((calendar.timeInMillis - pattern.startDate.time) / (7 * 24 * 60 * 60 * 1000)).toInt()
                    weeksDiff % 2 == 0 && pattern.daysOfWeek.contains(dayOfWeek)
                }
                RecurrenceFrequency.MONTHLY -> calendar.get(Calendar.DAY_OF_MONTH) == 1
                RecurrenceFrequency.CUSTOM -> pattern.daysOfWeek.contains(dayOfWeek)
            }

            if (shouldGenerate) {
                val session = StudySession(
                    courseId = templateSession.courseId,
                    courseName = templateSession.courseName,
                    scheduledDate = calendar.time,
                    scheduledTime = templateSession.scheduledTime,
                    durationMinutes = templateSession.durationMinutes
                )
                val sessionId = repository.insertSession(session)

                if (setReminder) {
                    createReminderForSession(sessionId, calendar.time, templateSession.scheduledTime, reminderMinutesBefore)
                }

                daysGenerated++
            }

            calendar.add(Calendar.DAY_OF_MONTH, 1)
        }
    }

    private suspend fun createReminderForSession(
        sessionId: Long,
        scheduledDate: Date,
        scheduledTime: String,
        minutesBefore: Int
    ) {
        val timeParts = scheduledTime.split(":")
        val hour = timeParts[0].toInt()
        val minute = timeParts[1].toInt()

        val sessionCalendar = Calendar.getInstance()
        sessionCalendar.time = scheduledDate
        sessionCalendar.set(Calendar.HOUR_OF_DAY, hour)
        sessionCalendar.set(Calendar.MINUTE, minute)
        sessionCalendar.set(Calendar.SECOND, 0)

        val reminderCalendar = sessionCalendar.clone() as Calendar
        reminderCalendar.add(Calendar.MINUTE, -minutesBefore)

        val reminder = StudyReminder(
            studySessionId = sessionId,
            reminderTime = reminderCalendar.time,
            minutesBefore = minutesBefore
        )

        repository.insertReminder(reminder)
    }

    suspend fun updateSession(session: StudySession) {
        repository.updateSession(session)
        loadSessionsForSelectedDate()
    }

    suspend fun deleteSession(session: StudySession) {
        repository.deleteSession(session)
        loadSessionsForSelectedDate()
    }

    suspend fun completeSession(sessionId: Long, cardsReviewed: Int, cardsCorrect: Int, duration: Int) {
        repository.completeSession(sessionId, cardsReviewed, cardsCorrect, duration)
        loadSessionsForSelectedDate()
    }

    fun getSessionCountForDate(date: Date): Int {
        return _sessionsForSelectedDate.value?.filter { session ->
            isSameDay(session.scheduledDate, date)
        }?.size ?: 0
    }

    private fun isSameDay(date1: Date, date2: Date): Boolean {
        val cal1 = Calendar.getInstance().apply { time = date1 }
        val cal2 = Calendar.getInstance().apply { time = date2 }

        return cal1.get(Calendar.YEAR) == cal2.get(Calendar.YEAR) &&
               cal1.get(Calendar.DAY_OF_YEAR) == cal2.get(Calendar.DAY_OF_YEAR)
    }
}
