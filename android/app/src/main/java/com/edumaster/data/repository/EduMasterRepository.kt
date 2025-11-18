package com.edumaster.data.repository

import androidx.lifecycle.LiveData
import com.edumaster.data.database.*
import com.edumaster.data.models.*
import java.util.Date
import kotlin.math.roundToInt

class EduMasterRepository(
    private val cardDao: CardDao,
    private val courseDao: CourseDao,
    private val studySessionDao: StudySessionDao,
    private val userStatsDao: UserStatsDao,
    private val achievementDao: AchievementDao
) {

    // Card operations
    fun getCardsByCourse(courseId: Long): LiveData<List<Card>> = cardDao.getCardsByCourse(courseId)

    fun getDueCards(date: Date = Date()): LiveData<List<Card>> = cardDao.getDueCards(date)

    fun getDueCardsByCourse(courseId: Long, date: Date = Date()): LiveData<List<Card>> =
        cardDao.getDueCardsByCourse(courseId, date)

    fun getAllCards(): LiveData<List<Card>> = cardDao.getAllCards()

    suspend fun getCardById(cardId: Long): Card? = cardDao.getCardById(cardId)

    suspend fun insertCard(card: Card): Long = cardDao.insertCard(card)

    suspend fun updateCard(card: Card) = cardDao.updateCard(card)

    suspend fun deleteCard(card: Card) = cardDao.deleteCard(card)

    // Course operations
    fun getAllCourses(): LiveData<List<Course>> = courseDao.getAllCourses()

    fun getOwnedCourses(): LiveData<List<Course>> = courseDao.getOwnedCourses()

    fun getAvailableCourses(): LiveData<List<Course>> = courseDao.getAvailableCourses()

    fun getAvailableCoursesByCategory(category: String): LiveData<List<Course>> =
        courseDao.getAvailableCoursesByCategory(category)

    fun getCourseByIdLive(courseId: Long): LiveData<Course?> = courseDao.getCourseByIdLive(courseId)

    suspend fun getCourseById(courseId: Long): Course? = courseDao.getCourseById(courseId)

    suspend fun insertCourse(course: Course): Long = courseDao.insertCourse(course)

    suspend fun updateCourse(course: Course) = courseDao.updateCourse(course)

    suspend fun purchaseCourse(courseId: Long, price: Int): Boolean {
        val userStats = userStatsDao.getUserStatsSync()
        return if (userStats != null && userStats.coins >= price) {
            userStatsDao.spendCoins(price)
            courseDao.purchaseCourse(courseId)
            true
        } else {
            false
        }
    }

    // Study Session operations
    fun getAllSessions(): LiveData<List<StudySession>> = studySessionDao.getAllSessions()

    fun getUpcomingSessions(date: Date = Date()): LiveData<List<StudySession>> =
        studySessionDao.getUpcomingSessions(date)

    fun getSessionsByDate(date: Date): LiveData<List<StudySession>> =
        studySessionDao.getSessionsByDate(date)

    suspend fun insertSession(session: StudySession): Long = studySessionDao.insertSession(session)

    suspend fun updateSession(session: StudySession) = studySessionDao.updateSession(session)

    suspend fun deleteSession(session: StudySession) = studySessionDao.deleteSession(session)

    suspend fun completeSession(sessionId: Long, cardsReviewed: Int, cardsCorrect: Int, duration: Int) {
        studySessionDao.completeSession(sessionId, Date(), cardsReviewed, cardsCorrect, duration)
        userStatsDao.addStudyTime(duration)
        userStatsDao.incrementCardsStudied(cardsReviewed)
    }

    // User Stats operations
    fun getUserStats(): LiveData<UserStats?> = userStatsDao.getUserStats()

    suspend fun getUserStatsSync(): UserStats? = userStatsDao.getUserStatsSync()

    suspend fun updateUserStats(userStats: UserStats) = userStatsDao.updateUserStats(userStats)

    suspend fun updateStreak() {
        val stats = userStatsDao.getUserStatsSync() ?: return
        val today = Date()
        val lastStudy = stats.lastStudyDate

        if (lastStudy != null) {
            val daysDiff = ((today.time - lastStudy.time) / (1000 * 60 * 60 * 24)).toInt()

            when {
                daysDiff == 1 -> {
                    // Continued streak
                    val newStreak = stats.currentStreak + 1
                    val longestStreak = maxOf(newStreak, stats.longestStreak)
                    userStatsDao.updateStreak(newStreak, longestStreak, today)
                    checkStreakAchievements(newStreak)
                }
                daysDiff > 1 -> {
                    // Streak broken
                    userStatsDao.updateStreak(1, stats.longestStreak, today)
                }
                // daysDiff == 0 means already studied today, no change
            }
        } else {
            // First study ever
            userStatsDao.updateStreak(1, 1, today)
        }
    }

    suspend fun addCoins(amount: Int) = userStatsDao.addCoins(amount)

    suspend fun addExperience(xp: Int) {
        userStatsDao.addExperience(xp)
        val stats = userStatsDao.getUserStatsSync() ?: return

        // Check for level up
        val requiredXp = stats.experienceToNextLevel
        if (stats.experienceProgress >= requiredXp) {
            val newLevel = stats.level + 1
            val remainingXp = stats.experienceProgress - requiredXp
            userStatsDao.updateLevel(newLevel, remainingXp)
            checkLevelAchievements(newLevel)
        }
    }

    // Achievement operations
    fun getAllAchievements(): LiveData<List<Achievement>> = achievementDao.getAllAchievements()

    fun getUnlockedAchievements(): LiveData<List<Achievement>> = achievementDao.getUnlockedAchievements()

    suspend fun updateAchievementProgress(achievementId: Long, progress: Int) {
        achievementDao.updateProgress(achievementId, progress)
        val achievement = achievementDao.getAchievementById(achievementId)

        if (achievement != null && !achievement.isUnlocked && progress >= achievement.requirement) {
            achievementDao.unlockAchievement(achievementId, Date())
            // Award coins for unlocking achievement
            addCoins(50)
        }
    }

    private suspend fun checkStreakAchievements(streak: Int) {
        // Check streak-based achievements
        val achievements = listOf(
            2L to 7,   // Week Warrior
            4L to 14,  // Fire Starter
            8L to 30   // Champion
        )

        achievements.forEach { (id, requirement) ->
            if (streak >= requirement) {
                val achievement = achievementDao.getAchievementById(id)
                if (achievement != null && !achievement.isUnlocked) {
                    achievementDao.unlockAchievement(id, Date())
                    addCoins(100)
                }
            }
        }
    }

    private suspend fun checkLevelAchievements(level: Int) {
        // Check level-based achievements
        if (level >= 20) {
            val achievement = achievementDao.getAchievementById(6) // Diamond Mind
            if (achievement != null && !achievement.isUnlocked) {
                achievementDao.unlockAchievement(6, Date())
                addCoins(200)
            }
        }
    }

    // Spaced Repetition Algorithm (SM-2)
    suspend fun reviewCard(card: Card, quality: Int): Card {
        require(quality in 1..4) { "Quality must be between 1 and 4" }

        val updatedCard = when {
            quality < 3 -> {
                // Failed - reset interval
                card.copy(
                    interval = 1,
                    repetitions = 0,
                    easeFactor = maxOf(1.3f, card.easeFactor - 0.2f),
                    nextReview = Date(System.currentTimeMillis() + 86400000), // 1 day
                    lastReviewed = Date(),
                    timesReviewed = card.timesReviewed + 1,
                    timesIncorrect = card.timesIncorrect + 1,
                    updatedAt = Date()
                )
            }
            else -> {
                // Passed
                val newInterval = when (card.repetitions) {
                    0 -> 1
                    1 -> 6
                    else -> (card.interval * card.easeFactor).roundToInt()
                }

                val newEaseFactor = card.easeFactor + (0.1f - (4 - quality) * (0.08f + (4 - quality) * 0.02f))

                card.copy(
                    interval = newInterval,
                    repetitions = card.repetitions + 1,
                    easeFactor = maxOf(1.3f, newEaseFactor),
                    nextReview = Date(System.currentTimeMillis() + newInterval * 86400000L),
                    lastReviewed = Date(),
                    timesReviewed = card.timesReviewed + 1,
                    timesCorrect = card.timesCorrect + 1,
                    updatedAt = Date()
                )
            }
        }

        updateCard(updatedCard)

        // Update stats
        userStatsDao.incrementCardsStudied(1)
        addExperience(quality * 5) // 5-20 XP per card
        addCoins(quality * 2)      // 2-8 coins per card
        updateStreak()

        // Update accuracy
        val stats = userStatsDao.getUserStatsSync()
        if (stats != null) {
            val totalReviewed = stats.totalCardsStudied
            val accuracy = if (totalReviewed > 0) {
                (updatedCard.timesCorrect.toFloat() / updatedCard.timesReviewed * 100)
            } else {
                0f
            }

            userStatsDao.updateUserStats(stats.copy(
                accuracy = accuracy,
                updatedAt = Date()
            ))
        }

        return updatedCard
    }

    // Update course statistics
    suspend fun updateCourseStatistics(courseId: Long) {
        val totalCards = cardDao.getCardCountByCourse(courseId)
        val dueCards = cardDao.getDueCardCountByCourse(courseId, Date())
        val completedCards = totalCards - dueCards

        courseDao.updateCourseStats(courseId, dueCards, totalCards, completedCards)
    }
}
