package com.edumaster.data.database

import androidx.lifecycle.LiveData
import androidx.room.*
import com.edumaster.data.models.Card
import java.util.Date

@Dao
interface CardDao {
    @Query("SELECT * FROM cards WHERE courseId = :courseId ORDER BY nextReview ASC")
    fun getCardsByCourse(courseId: Long): LiveData<List<Card>>

    @Query("SELECT * FROM cards WHERE nextReview <= :date ORDER BY nextReview ASC")
    fun getDueCards(date: Date): LiveData<List<Card>>

    @Query("SELECT * FROM cards WHERE courseId = :courseId AND nextReview <= :date ORDER BY nextReview ASC")
    fun getDueCardsByCourse(courseId: Long, date: Date): LiveData<List<Card>>

    @Query("SELECT * FROM cards WHERE id = :cardId")
    suspend fun getCardById(cardId: Long): Card?

    @Query("SELECT COUNT(*) FROM cards WHERE courseId = :courseId")
    suspend fun getCardCountByCourse(courseId: Long): Int

    @Query("SELECT COUNT(*) FROM cards WHERE courseId = :courseId AND nextReview <= :date")
    suspend fun getDueCardCountByCourse(courseId: Long, date: Date): Int

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCard(card: Card): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCards(cards: List<Card>)

    @Update
    suspend fun updateCard(card: Card)

    @Delete
    suspend fun deleteCard(card: Card)

    @Query("DELETE FROM cards WHERE courseId = :courseId")
    suspend fun deleteCardsByCourse(courseId: Long)

    @Query("SELECT * FROM cards")
    fun getAllCards(): LiveData<List<Card>>

    @Query("SELECT COUNT(*) FROM cards")
    suspend fun getTotalCardCount(): Int
}
