package com.edumaster.data.database

import androidx.lifecycle.LiveData
import androidx.room.*
import com.edumaster.data.models.StudyReminder
import java.util.Date

@Dao
interface StudyReminderDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(reminder: StudyReminder): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(reminders: List<StudyReminder>)

    @Update
    suspend fun update(reminder: StudyReminder)

    @Delete
    suspend fun delete(reminder: StudyReminder)

    @Query("SELECT * FROM study_reminders WHERE id = :reminderId")
    suspend fun getById(reminderId: Long): StudyReminder?

    @Query("SELECT * FROM study_reminders WHERE studySessionId = :sessionId AND isEnabled = 1")
    fun getRemindersForSession(sessionId: Long): LiveData<List<StudyReminder>>

    @Query("SELECT * FROM study_reminders WHERE isEnabled = 1 AND isSent = 0 AND reminderTime <= :currentTime")
    suspend fun getPendingReminders(currentTime: Date): List<StudyReminder>

    @Query("UPDATE study_reminders SET isSent = 1 WHERE id = :reminderId")
    suspend fun markAsSent(reminderId: Long)

    @Query("DELETE FROM study_reminders WHERE studySessionId = :sessionId")
    suspend fun deleteRemindersForSession(sessionId: Long)

    @Query("SELECT * FROM study_reminders WHERE isEnabled = 1 AND isSent = 0 ORDER BY reminderTime ASC")
    fun getAllPendingReminders(): LiveData<List<StudyReminder>>
}
