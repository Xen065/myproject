package com.edumaster.notifications

import android.content.Context
import androidx.work.Worker
import androidx.work.WorkerParameters
import com.edumaster.data.database.AppDatabase
import com.edumaster.data.repository.EduMasterRepository
import kotlinx.coroutines.runBlocking
import java.util.Date

class StudyReminderWorker(
    context: Context,
    params: WorkerParameters
) : Worker(context, params) {

    override fun doWork(): Result {
        return try {
            val database = AppDatabase.getDatabase(applicationContext)
            val repository = EduMasterRepository(
                database.cardDao(),
                database.courseDao(),
                database.studySessionDao(),
                database.userStatsDao(),
                database.achievementDao()
            )

            // Get due cards count
            val dueCardsCount = runBlocking {
                repository.getDueCardsSync(Date()).size
            }

            // Show notification if there are cards due
            if (dueCardsCount > 0) {
                val title = "Time to study! 📚"
                val message = "You have $dueCardsCount flashcards waiting for review"
                NotificationHelper.showStudyReminder(applicationContext, title, message)
            }

            Result.success()
        } catch (e: Exception) {
            Result.failure()
        }
    }
}
