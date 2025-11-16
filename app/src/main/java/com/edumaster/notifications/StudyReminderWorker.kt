package com.edumaster.notifications

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.edumaster.MainActivity
import com.edumaster.R
import com.edumaster.data.database.AppDatabase
import java.util.*

class StudyReminderWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        val database = AppDatabase.getDatabase(applicationContext)
        val reminderDao = database.studyReminderDao()
        val sessionDao = database.studySessionDao()

        // Get pending reminders
        val currentTime = Date()
        val pendingReminders = reminderDao.getPendingReminders(currentTime)

        for (reminder in pendingReminders) {
            // Get the associated study session
            val session = sessionDao.getSessionById(reminder.studySessionId)

            if (session != null && !session.isCompleted) {
                // Send notification
                sendNotification(session.courseName, session.scheduledTime, reminder.minutesBefore)

                // Mark reminder as sent
                reminderDao.markAsSent(reminder.id)
            }
        }

        return Result.success()
    }

    private fun sendNotification(courseName: String, time: String, minutesBefore: Int) {
        val notificationManager = applicationContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        // Create notification channel for Android O and above
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Study Reminders",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notifications for upcoming study sessions"
                enableVibration(true)
                enableLights(true)
            }
            notificationManager.createNotificationChannel(channel)
        }

        // Create intent to open app when notification is tapped
        val intent = Intent(applicationContext, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            putExtra("navigate_to", "calendar")
        }

        val pendingIntent = PendingIntent.getActivity(
            applicationContext,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Build notification
        val notification = NotificationCompat.Builder(applicationContext, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setContentTitle("Study Session Reminder")
            .setContentText("$courseName starts in $minutesBefore minutes at $time")
            .setStyle(NotificationCompat.BigTextStyle()
                .bigText("Your study session for $courseName is scheduled to start in $minutesBefore minutes at $time. Get ready!"))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .setVibrate(longArrayOf(0, 500, 250, 500))
            .build()

        notificationManager.notify(System.currentTimeMillis().toInt(), notification)
    }

    companion object {
        const val CHANNEL_ID = "study_reminders_channel"
        const val WORK_NAME = "study_reminder_work"
    }
}
