package com.edumaster.data.database

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import androidx.sqlite.db.SupportSQLiteDatabase
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
        Achievement::class,
        RecurringPattern::class,
        StudyReminder::class
    ],
    version = 2,
    exportSchema = false
)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase() {

    abstract fun cardDao(): CardDao
    abstract fun courseDao(): CourseDao
    abstract fun studySessionDao(): StudySessionDao
    abstract fun userStatsDao(): UserStatsDao
    abstract fun achievementDao(): AchievementDao
    abstract fun recurringPatternDao(): RecurringPatternDao
    abstract fun studyReminderDao(): StudyReminderDao

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
                    .fallbackToDestructiveMigration()
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

            // Insert sample courses
            val courses = listOf(
                Course(
                    id = 1,
                    name = "English Vocabulary",
                    description = "Master 1000+ advanced English words with spaced repetition",
                    category = "Vocabulary",
                    icon = "📖",
                    isOwned = true,
                    totalCards = 500,
                    cardsCompleted = 156,
                    cardsDue = 12,
                    rating = 4.8f,
                    totalRatings = 234,
                    lastStudied = Date()
                ),
                Course(
                    id = 2,
                    name = "Current Affairs 2024",
                    description = "November 2024 current affairs MCQs for competitive exams",
                    category = "Current Affairs",
                    icon = "📰",
                    isOwned = true,
                    totalCards = 200,
                    cardsCompleted = 89,
                    cardsDue = 8,
                    rating = 4.9f,
                    totalRatings = 156,
                    lastStudied = Date(System.currentTimeMillis() - 86400000)
                ),
                Course(
                    id = 3,
                    name = "General Science MCQ",
                    description = "Essential science concepts and MCQs for exams",
                    category = "Science",
                    icon = "🔬",
                    isOwned = true,
                    totalCards = 150,
                    cardsCompleted = 67,
                    cardsDue = 5,
                    rating = 4.7f,
                    totalRatings = 89
                ),
                Course(
                    id = 4,
                    name = "Physics Fundamentals",
                    description = "Essential physics concepts and formulas for exams",
                    category = "Science",
                    icon = "🔬",
                    price = 450,
                    isOwned = false,
                    rating = 4.7f,
                    totalRatings = 89
                ),
                Course(
                    id = 5,
                    name = "World Geography",
                    description = "Countries, capitals, and geographical features",
                    category = "Geography",
                    icon = "🗺️",
                    price = 350,
                    isOwned = false,
                    rating = 4.6f,
                    totalRatings = 201
                )
            )
            courseDao.insertCourses(courses)

            // Insert sample cards
            val sampleCards = listOf(
                Card(
                    courseId = 1,
                    question = "What is the meaning of 'Ephemeral'?",
                    answer = "Lasting for a very short time; transitory",
                    hint = "Think of something temporary",
                    category = "Vocabulary"
                ),
                Card(
                    courseId = 1,
                    question = "Define 'Ubiquitous'",
                    answer = "Present, appearing, or found everywhere",
                    hint = "Something very common",
                    category = "Vocabulary"
                ),
                Card(
                    courseId = 2,
                    question = "What is the process by which plants make their own food using sunlight?",
                    answer = "Photosynthesis - The process where plants convert light energy into chemical energy, using CO₂ and water to produce glucose and oxygen.",
                    hint = "It involves chlorophyll and produces oxygen",
                    category = "Science"
                ),
                Card(
                    courseId = 3,
                    question = "What is Newton's First Law of Motion?",
                    answer = "An object at rest stays at rest and an object in motion stays in motion with the same speed and in the same direction unless acted upon by an unbalanced force.",
                    hint = "Also known as the law of inertia",
                    category = "Science"
                )
            )
            cardDao.insertCards(sampleCards)

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
