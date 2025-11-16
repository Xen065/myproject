package com.edumaster.notifications

import android.content.Context
import androidx.work.*
import java.util.concurrent.TimeUnit

object NotificationScheduler {

    fun scheduleReminderCheck(context: Context) {
        // Schedule periodic work to check for pending reminders every 15 minutes
        val constraints = Constraints.Builder()
            .setRequiresBatteryNotLow(false)
            .build()

        val reminderWork = PeriodicWorkRequestBuilder<StudyReminderWorker>(
            15, TimeUnit.MINUTES,
            5, TimeUnit.MINUTES  // Flex interval
        )
            .setConstraints(constraints)
            .build()

        WorkManager.getInstance(context).enqueueUniquePeriodicWork(
            StudyReminderWorker.WORK_NAME,
            ExistingPeriodicWorkPolicy.KEEP,
            reminderWork
        )
    }

    fun cancelAllReminders(context: Context) {
        WorkManager.getInstance(context).cancelUniqueWork(StudyReminderWorker.WORK_NAME)
    }
}
