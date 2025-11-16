package com.edumaster.data.database

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import androidx.sqlite.db.SupportSQLiteDatabase
import com.edumaster.data.content.ContentData
import com.edumaster.data.models.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.util.Date

@Database(
    entities = [
        Card::class,
        Course::class,
        StudySession::class,
        UserStats::class,
        Achievement::class
    ],
    version = 1,
    exportSchema = false
)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase() {

    abstract fun cardDao(): CardDao
    abstract fun courseDao(): CourseDao
    abstract fun studySessionDao(): StudySessionDao
    abstract fun userStatsDao(): UserStatsDao
    abstract fun achievementDao(): AchievementDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "edumaster_database"
                )
                    .addCallback(DatabaseCallback())
                    .build()
                INSTANCE = instance
                instance
            }
        }

        private class DatabaseCallback : RoomDatabase.Callback() {
            override fun onCreate(db: SupportSQLiteDatabase) {
                super.onCreate(db)
                INSTANCE?.let { database ->
                    CoroutineScope(Dispatchers.IO).launch {
                        populateDatabase(database)
                    }
                }
            }
        }

        private suspend fun populateDatabase(database: AppDatabase) {
            val courseDao = database.courseDao()
            val cardDao = database.cardDao()
            val userStatsDao = database.userStatsDao()
            val achievementDao = database.achievementDao()

            // Initialize user stats
            userStatsDao.insertUserStats(
                UserStats(
                    username = "John Doe",
                    level = 12,
                    experiencePoints = 650,
                    coins = 2450,
                    currentStreak = 7,
                    longestStreak = 47,
                    totalCardsStudied = 248,
                    totalStudyMinutes = 1350,
                    accuracy = 89f,
                    lastStudyDate = Date()
                )
            )

            // Insert all courses from ContentData
            val courses = ContentData.getAllCourses()
            courseDao.insertCourses(courses)

            // Insert all flashcards from ContentData
            val cards = ContentData.getAllCards()
            cardDao.insertCards(cards)

            // Insert achievements
            val achievements = listOf(
                Achievement(
                    id = 1,
                    name = "First Steps",
                    description = "Complete your first study session",
                    icon = "🏆",
                    isUnlocked = true,
                    unlockedAt = Date(),
                    category = "study",
                    requirement = 1,
                    currentProgress = 1
                ),
                Achievement(
                    id = 2,
                    name = "Week Warrior",
                    description = "Maintain a 7-day study streak",
                    icon = "🥇",
                    isUnlocked = true,
                    unlockedAt = Date(),
                    category = "streak",
                    requirement = 7,
                    currentProgress = 7
                ),
                Achievement(
                    id = 3,
                    name = "Bookworm",
                    description = "Study 100 cards",
                    icon = "📚",
                    isUnlocked = true,
                    unlockedAt = Date(),
                    category = "study",
                    requirement = 100,
                    currentProgress = 248
                ),
                Achievement(
                    id = 4,
                    name = "Fire Starter",
                    description = "Achieve a 14-day streak",
                    icon = "🔥",
                    isUnlocked = true,
                    unlockedAt = Date(),
                    category = "streak",
                    requirement = 14,
                    currentProgress = 47
                ),
                Achievement(
                    id = 5,
                    name = "Perfectionist",
                    description = "Achieve 95% accuracy in a session",
                    icon = "🎯",
                    isUnlocked = false,
                    category = "accuracy",
                    requirement = 95,
                    currentProgress = 89
                ),
                Achievement(
                    id = 6,
                    name = "Diamond Mind",
                    description = "Reach level 20",
                    icon = "💎",
                    isUnlocked = false,
                    category = "level",
                    requirement = 20,
                    currentProgress = 12
                ),
                Achievement(
                    id = 7,
                    name = "Rising Star",
                    description = "Complete 5 courses",
                    icon = "🌟",
                    isUnlocked = false,
                    category = "completion",
                    requirement = 5,
                    currentProgress = 0
                ),
                Achievement(
                    id = 8,
                    name = "Champion",
                    description = "Maintain a 30-day streak",
                    icon = "👑",
                    isUnlocked = false,
                    category = "streak",
                    requirement = 30,
                    currentProgress = 7
                )
            )
            achievementDao.insertAchievements(achievements)
        }
    }
}
