const db = require('./database');

class EduMasterRepository {
  // User Stats
  getUserStats() {
    return db.prepare('SELECT * FROM user_stats WHERE userId = ?').get('default');
  }

  updateUserStats(stats) {
    const stmt = db.prepare(`
      UPDATE user_stats
      SET level = ?, experiencePoints = ?, coins = ?, currentStreak = ?,
          longestStreak = ?, totalCardsStudied = ?, totalStudyMinutes = ?,
          averageAccuracy = ?, lastStudyDate = ?
      WHERE userId = ?
    `);
    return stmt.run(
      stats.level, stats.experiencePoints, stats.coins, stats.currentStreak,
      stats.longestStreak, stats.totalCardsStudied, stats.totalStudyMinutes,
      stats.averageAccuracy, stats.lastStudyDate, 'default'
    );
  }

  // Courses
  getAllCourses() {
    return db.prepare('SELECT * FROM courses ORDER BY isOwned DESC, name ASC').all();
  }

  getOwnedCourses() {
    return db.prepare('SELECT * FROM courses WHERE isOwned = 1 ORDER BY name ASC').all();
  }

  getCourseById(id) {
    return db.prepare('SELECT * FROM courses WHERE id = ?').get(id);
  }

  purchaseCourse(courseId) {
    const course = this.getCourseById(courseId);
    const userStats = this.getUserStats();

    if (!course || course.isOwned) {
      return { success: false, message: 'Course already owned or not found' };
    }

    if (userStats.coins < course.price) {
      return { success: false, message: 'Insufficient coins' };
    }

    // Deduct coins and mark course as owned
    const newCoins = userStats.coins - course.price;
    db.prepare('UPDATE user_stats SET coins = ? WHERE userId = ?').run(newCoins, 'default');
    db.prepare('UPDATE courses SET isOwned = 1 WHERE id = ?').run(courseId);

    return { success: true, message: 'Course purchased successfully' };
  }

  updateCourseProgress(courseId) {
    const totalCards = db.prepare('SELECT COUNT(*) as count FROM cards WHERE courseId = ?').get(courseId).count;
    const completedCards = db.prepare('SELECT COUNT(*) as count FROM cards WHERE courseId = ? AND repetitions > 0').get(courseId).count;
    const dueCards = db.prepare('SELECT COUNT(*) as count FROM cards WHERE courseId = ? AND nextReview <= ?').get(courseId, Date.now()).count;

    db.prepare(`
      UPDATE courses
      SET totalCards = ?, cardsCompleted = ?, cardsDue = ?
      WHERE id = ?
    `).run(totalCards, completedCards, dueCards, courseId);
  }

  // Cards
  getCardsByCourse(courseId) {
    return db.prepare('SELECT * FROM cards WHERE courseId = ? ORDER BY id ASC').all(courseId);
  }

  getDueCards(courseId) {
    const now = Date.now();
    return db.prepare('SELECT * FROM cards WHERE courseId = ? AND (nextReview IS NULL OR nextReview <= ?) ORDER BY nextReview ASC').all(courseId, now);
  }

  getCardById(id) {
    return db.prepare('SELECT * FROM cards WHERE id = ?').get(id);
  }

  // SM-2 Spaced Repetition Algorithm
  reviewCard(cardId, quality) {
    const card = this.getCardById(cardId);
    if (!card) return null;

    const now = Date.now();
    let { interval, easeFactor, repetitions, timesReviewed, timesCorrect, timesIncorrect } = card;

    // Update review counts
    timesReviewed++;
    if (quality >= 3) {
      timesCorrect++;
    } else {
      timesIncorrect++;
    }

    // SM-2 Algorithm
    if (quality < 3) {
      // Failed - reset
      repetitions = 0;
      interval = 1;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
    } else {
      // Passed
      repetitions++;

      if (repetitions === 1) {
        interval = 1;
      } else if (repetitions === 2) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }

      // Update ease factor
      easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    }

    // Calculate next review date
    const nextReview = now + interval * 24 * 60 * 60 * 1000;

    // Update card in database
    db.prepare(`
      UPDATE cards
      SET interval = ?, easeFactor = ?, repetitions = ?, nextReview = ?,
          lastReviewed = ?, timesReviewed = ?, timesCorrect = ?, timesIncorrect = ?
      WHERE id = ?
    `).run(interval, easeFactor, repetitions, nextReview, now, timesReviewed, timesCorrect, timesIncorrect, cardId);

    // Award XP and coins
    const xpGained = quality >= 4 ? 20 : quality >= 3 ? 10 : 5;
    const coinsGained = quality >= 4 ? 8 : quality >= 3 ? 5 : 2;

    this.addExperience(xpGained);
    this.addCoins(coinsGained);

    // Update course progress
    this.updateCourseProgress(card.courseId);

    return {
      card: this.getCardById(cardId),
      xpGained,
      coinsGained
    };
  }

  // Experience and Level System
  addExperience(xp) {
    const userStats = this.getUserStats();
    let { level, experiencePoints, totalCardsStudied } = userStats;

    experiencePoints += xp;
    totalCardsStudied++;

    // Check for level up
    const xpNeeded = level * 100;
    if (experiencePoints >= xpNeeded) {
      level++;
      experiencePoints = experiencePoints - xpNeeded;
      this.checkLevelAchievements(level);
    }

    db.prepare(`
      UPDATE user_stats
      SET level = ?, experiencePoints = ?, totalCardsStudied = ?
      WHERE userId = ?
    `).run(level, experiencePoints, totalCardsStudied, 'default');
  }

  addCoins(coins) {
    const userStats = this.getUserStats();
    const newCoins = userStats.coins + coins;
    db.prepare('UPDATE user_stats SET coins = ? WHERE userId = ?').run(newCoins, 'default');
    this.checkCoinAchievements(newCoins);
  }

  // Streak Management
  updateStreak() {
    const userStats = this.getUserStats();
    const now = Date.now();
    const lastStudy = userStats.lastStudyDate || 0;
    const daysDiff = Math.floor((now - lastStudy) / (24 * 60 * 60 * 1000));

    let { currentStreak, longestStreak } = userStats;

    if (daysDiff === 0) {
      // Already studied today
      return;
    } else if (daysDiff === 1) {
      // Consecutive day
      currentStreak++;
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
      this.checkStreakAchievements(currentStreak);
    } else {
      // Streak broken
      currentStreak = 1;
    }

    db.prepare(`
      UPDATE user_stats
      SET currentStreak = ?, longestStreak = ?, lastStudyDate = ?
      WHERE userId = ?
    `).run(currentStreak, longestStreak, now, 'default');
  }

  // Achievements
  getAllAchievements() {
    return db.prepare('SELECT * FROM achievements ORDER BY isUnlocked DESC, id ASC').all();
  }

  unlockAchievement(achievementId) {
    const now = Date.now();
    db.prepare(`
      UPDATE achievements
      SET isUnlocked = 1, unlockedAt = ?
      WHERE id = ?
    `).run(now, achievementId);
  }

  updateAchievementProgress(achievementId, progress) {
    const achievement = db.prepare('SELECT * FROM achievements WHERE id = ?').get(achievementId);
    if (achievement && !achievement.isUnlocked && progress >= achievement.maxProgress) {
      this.unlockAchievement(achievementId);
    } else {
      db.prepare('UPDATE achievements SET progress = ? WHERE id = ?').run(progress, achievementId);
    }
  }

  checkStreakAchievements(streak) {
    // Week Warrior - 7 days
    if (streak >= 7) {
      const achievement = db.prepare('SELECT * FROM achievements WHERE name = ?').get('Week Warrior');
      if (achievement && !achievement.isUnlocked) {
        this.updateAchievementProgress(achievement.id, 7);
      }
    }
    // Fire Starter - 14 days
    if (streak >= 14) {
      const achievement = db.prepare('SELECT * FROM achievements WHERE name = ?').get('Fire Starter');
      if (achievement && !achievement.isUnlocked) {
        this.updateAchievementProgress(achievement.id, 14);
      }
    }
  }

  checkLevelAchievements(level) {
    // Diamond Mind - Level 20
    if (level >= 20) {
      const achievement = db.prepare('SELECT * FROM achievements WHERE name = ?').get('Diamond Mind');
      if (achievement && !achievement.isUnlocked) {
        this.updateAchievementProgress(achievement.id, 20);
      }
    }
  }

  checkCoinAchievements(coins) {
    // Rising Star - 5000 coins
    if (coins >= 5000) {
      const achievement = db.prepare('SELECT * FROM achievements WHERE name = ?').get('Rising Star');
      if (achievement && !achievement.isUnlocked) {
        this.updateAchievementProgress(achievement.id, 5000);
      }
    }
  }

  checkCardAchievements(totalCards) {
    // Bookworm - 100 cards
    if (totalCards >= 100) {
      const achievement = db.prepare('SELECT * FROM achievements WHERE name = ?').get('Bookworm');
      if (achievement && !achievement.isUnlocked) {
        this.updateAchievementProgress(achievement.id, 100);
      }
    }
    // Champion - 1000 cards
    if (totalCards >= 1000) {
      const achievement = db.prepare('SELECT * FROM achievements WHERE name = ?').get('Champion');
      if (achievement && !achievement.isUnlocked) {
        this.updateAchievementProgress(achievement.id, 1000);
      }
    }
  }

  // Study Sessions
  getAllStudySessions() {
    return db.prepare('SELECT * FROM study_sessions ORDER BY scheduledDate DESC').all();
  }

  createStudySession(courseId, scheduledDate, duration) {
    const stmt = db.prepare(`
      INSERT INTO study_sessions (courseId, scheduledDate, duration)
      VALUES (?, ?, ?)
    `);
    return stmt.run(courseId, scheduledDate, duration);
  }

  completeStudySession(sessionId, cardsReviewed, cardsCorrect) {
    const now = Date.now();
    db.prepare(`
      UPDATE study_sessions
      SET isCompleted = 1, completedAt = ?, cardsReviewed = ?, cardsCorrect = ?
      WHERE id = ?
    `).run(now, cardsReviewed, cardsCorrect, sessionId);
  }

  // Statistics
  getDashboardStats() {
    const userStats = this.getUserStats();
    const courses = this.getOwnedCourses();

    let dueToday = 0;
    let completed = 0;
    let newCards = 0;

    courses.forEach(course => {
      this.updateCourseProgress(course.id);
      const updatedCourse = this.getCourseById(course.id);
      dueToday += updatedCourse.cardsDue || 0;
      completed += updatedCourse.cardsCompleted || 0;
      newCards += (updatedCourse.totalCards - updatedCourse.cardsCompleted) || 0;
    });

    return {
      dueToday,
      completed,
      newCards,
      studyTime: userStats.totalStudyMinutes,
      streak: userStats.currentStreak,
      cardsStudied: userStats.totalCardsStudied,
      accuracy: userStats.averageAccuracy,
      level: userStats.level
    };
  }
}

module.exports = new EduMasterRepository();
