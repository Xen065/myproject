package com.edumaster.data.database

import androidx.lifecycle.LiveData
import androidx.room.*
import com.edumaster.data.models.Course

@Dao
interface CourseDao {
    @Query("SELECT * FROM courses ORDER BY lastStudied DESC")
    fun getAllCourses(): LiveData<List<Course>>

    @Query("SELECT * FROM courses WHERE isOwned = 1 ORDER BY lastStudied DESC")
    fun getOwnedCourses(): LiveData<List<Course>>

    @Query("SELECT * FROM courses WHERE isOwned = 0 AND category = :category ORDER BY rating DESC")
    fun getAvailableCoursesByCategory(category: String): LiveData<List<Course>>

    @Query("SELECT * FROM courses WHERE isOwned = 0 ORDER BY rating DESC")
    fun getAvailableCourses(): LiveData<List<Course>>

    @Query("SELECT * FROM courses WHERE id = :courseId")
    suspend fun getCourseById(courseId: Long): Course?

    @Query("SELECT * FROM courses WHERE id = :courseId")
    fun getCourseByIdLive(courseId: Long): LiveData<Course?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCourse(course: Course): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCourses(courses: List<Course>)

    @Update
    suspend fun updateCourse(course: Course)

    @Delete
    suspend fun deleteCourse(course: Course)

    @Query("UPDATE courses SET isOwned = 1, isPurchased = 1 WHERE id = :courseId")
    suspend fun purchaseCourse(courseId: Long)

    @Query("UPDATE courses SET cardsDue = :dueCount, totalCards = :totalCount, cardsCompleted = :completedCount WHERE id = :courseId")
    suspend fun updateCourseStats(courseId: Long, dueCount: Int, totalCount: Int, completedCount: Int)
}
