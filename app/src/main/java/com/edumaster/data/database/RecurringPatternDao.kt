package com.edumaster.data.database

import androidx.lifecycle.LiveData
import androidx.room.*
import com.edumaster.data.models.RecurringPattern
import java.util.Date

@Dao
interface RecurringPatternDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(pattern: RecurringPattern): Long

    @Update
    suspend fun update(pattern: RecurringPattern)

    @Delete
    suspend fun delete(pattern: RecurringPattern)

    @Query("SELECT * FROM recurring_patterns WHERE id = :patternId")
    suspend fun getById(patternId: Long): RecurringPattern?

    @Query("SELECT * FROM recurring_patterns WHERE isActive = 1")
    fun getAllActivePatterns(): LiveData<List<RecurringPattern>>

    @Query("SELECT * FROM recurring_patterns WHERE studySessionTemplateId = :sessionId")
    suspend fun getPatternForSession(sessionId: Long): RecurringPattern?

    @Query("UPDATE recurring_patterns SET isActive = 0 WHERE id = :patternId")
    suspend fun deactivatePattern(patternId: Long)

    @Query("DELETE FROM recurring_patterns WHERE studySessionTemplateId = :sessionId")
    suspend fun deletePatternForSession(sessionId: Long)
}
