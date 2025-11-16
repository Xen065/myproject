package com.edumaster.notifications

import android.content.Context
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import java.util.Calendar
import java.util.concurrent.TimeUnit

object StudyReminderScheduler {

    private const val WORK_NAME = "study_reminder_work"

    fun scheduleDailyReminder(context: Context, hourOfDay: Int = 19, minute: Int = 0) {
        // Calculate initial delay to next scheduled time
        val currentTime = Calendar.getInstance()
        val scheduledTime = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, hourOfDay)
            set(Calendar.MINUTE, minute)
            set(Calendar.SECOND, 0)
        }

        // If scheduled time has passed today, schedule for tomorrow
        if (scheduledTime.before(currentTime)) {
            scheduledTime.add(Calendar.DAY_OF_MONTH, 1)
        }

        val initialDelay = scheduledTime.timeInMillis - currentTime.timeInMillis

        // Create periodic work request (repeats every 24 hours)
        val workRequest = PeriodicWorkRequestBuilder<StudyReminderWorker>(
            24, TimeUnit.HOURS
        )
            .setInitialDelay(initialDelay, TimeUnit.MILLISECONDS)
            .build()

        // Schedule the work
        WorkManager.getInstance(context).enqueueUniquePeriodicWork(
            WORK_NAME,
            ExistingPeriodicWorkPolicy.REPLACE,
            workRequest
        )
    }

    fun cancelDailyReminder(context: Context) {
        WorkManager.getInstance(context).cancelUniqueWork(WORK_NAME)
    }
}
