package com.edumaster.data.database

import androidx.lifecycle.LiveData
import androidx.room.*
import com.edumaster.data.models.StudySession
import java.util.Date

@Dao
interface StudySessionDao {
    @Query("SELECT * FROM study_sessions ORDER BY scheduledDate ASC, scheduledTime ASC")
    fun getAllSessions(): LiveData<List<StudySession>>

    @Query("SELECT * FROM study_sessions WHERE scheduledDate >= :date AND isCompleted = 0 ORDER BY scheduledDate ASC, scheduledTime ASC")
    fun getUpcomingSessions(date: Date): LiveData<List<StudySession>>

    @Query("SELECT * FROM study_sessions WHERE scheduledDate = :date ORDER BY scheduledTime ASC")
    fun getSessionsByDate(date: Date): LiveData<List<StudySession>>

    @Query("SELECT * FROM study_sessions WHERE id = :sessionId")
    suspend fun getSessionById(sessionId: Long): StudySession?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSession(session: StudySession): Long

    @Update
    suspend fun updateSession(session: StudySession)

    @Delete
    suspend fun deleteSession(session: StudySession)

    @Query("UPDATE study_sessions SET isCompleted = 1, completedAt = :completedAt, cardsReviewed = :cardsReviewed, cardsCorrect = :cardsCorrect, actualDurationMinutes = :duration WHERE id = :sessionId")
    suspend fun completeSession(sessionId: Long, completedAt: Date, cardsReviewed: Int, cardsCorrect: Int, duration: Int)
}
