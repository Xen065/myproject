const Database = require('better-sqlite3');
const path = require('path');

// Create database connection
const db = new Database(path.join(__dirname, 'edumaster.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
function initializeDatabase() {
  // Cards table
  db.exec(`
    CREATE TABLE IF NOT EXISTS cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      courseId INTEGER NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      hint TEXT,
      interval INTEGER DEFAULT 0,
      easeFactor REAL DEFAULT 2.5,
      repetitions INTEGER DEFAULT 0,
      nextReview INTEGER,
      lastReviewed INTEGER,
      timesReviewed INTEGER DEFAULT 0,
      timesCorrect INTEGER DEFAULT 0,
      timesIncorrect INTEGER DEFAULT 0,
      createdAt INTEGER DEFAULT (strftime('%s', 'now') * 1000),
      FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE
    )
  `);

  // Courses table
  db.exec(`
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      icon TEXT NOT NULL,
      totalCards INTEGER DEFAULT 0,
      cardsCompleted INTEGER DEFAULT 0,
      cardsDue INTEGER DEFAULT 0,
      isOwned INTEGER DEFAULT 0,
      price INTEGER DEFAULT 0,
      rating REAL DEFAULT 0.0,
      createdAt INTEGER DEFAULT (strftime('%s', 'now') * 1000)
    )
  `);

  // StudySessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS study_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      courseId INTEGER NOT NULL,
      scheduledDate INTEGER NOT NULL,
      duration INTEGER DEFAULT 0,
      isCompleted INTEGER DEFAULT 0,
      cardsReviewed INTEGER DEFAULT 0,
      cardsCorrect INTEGER DEFAULT 0,
      completedAt INTEGER,
      FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE
    )
  `);

  // UserStats table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT DEFAULT 'default',
      level INTEGER DEFAULT 1,
      experiencePoints INTEGER DEFAULT 0,
      coins INTEGER DEFAULT 2450,
      currentStreak INTEGER DEFAULT 0,
      longestStreak INTEGER DEFAULT 0,
      totalCardsStudied INTEGER DEFAULT 0,
      totalStudyMinutes INTEGER DEFAULT 0,
      averageAccuracy REAL DEFAULT 0.0,
      lastStudyDate INTEGER,
      createdAt INTEGER DEFAULT (strftime('%s', 'now') * 1000)
    )
  `);

  // Achievements table
  db.exec(`
    CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT NOT NULL,
      category TEXT NOT NULL,
      isUnlocked INTEGER DEFAULT 0,
      progress INTEGER DEFAULT 0,
      maxProgress INTEGER NOT NULL,
      unlockedAt INTEGER
    )
  `);

  console.log('Database tables created successfully');
}

// Initialize sample data
function populateSampleData() {
  const checkCourses = db.prepare('SELECT COUNT(*) as count FROM courses').get();

  if (checkCourses.count === 0) {
    console.log('Populating sample data...');

    // Insert courses
    const insertCourse = db.prepare(`
      INSERT INTO courses (name, description, category, icon, totalCards, cardsCompleted, cardsDue, isOwned, price, rating)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertCourse.run('English Vocabulary', 'Expand your English vocabulary with common words', 'Language', '📚', 500, 156, 12, 1, 0, 4.8);
    insertCourse.run('Current Affairs 2024', 'Stay updated with current events and news', 'General Knowledge', '📰', 200, 89, 8, 1, 0, 4.5);
    insertCourse.run('General Science MCQ', 'Multiple choice questions on general science', 'Science', '🔬', 150, 67, 5, 1, 0, 4.6);
    insertCourse.run('Physics Fundamentals', 'Master the basics of physics', 'Science', '⚛️', 300, 0, 0, 0, 450, 4.9);
    insertCourse.run('World Geography', 'Learn about countries, capitals, and landmarks', 'Geography', '🌍', 250, 0, 0, 0, 350, 4.7);

    // Insert sample cards
    const insertCard = db.prepare(`
      INSERT INTO cards (courseId, question, answer, hint, interval, easeFactor, repetitions, nextReview, timesReviewed, timesCorrect)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = Date.now();
    insertCard.run(1, 'What does "ephemeral" mean?', 'Lasting for a very short time', 'Think of something temporary', 6, 2.5, 2, now + 6 * 24 * 60 * 60 * 1000, 5, 4);
    insertCard.run(1, 'What does "ubiquitous" mean?', 'Present, appearing, or found everywhere', 'Think of something omnipresent', 3, 2.4, 1, now + 3 * 24 * 60 * 60 * 1000, 3, 2);
    insertCard.run(3, 'What is photosynthesis?', 'The process by which plants use sunlight to synthesize nutrients', 'Plants and sunlight', 1, 2.5, 1, now - 2 * 24 * 60 * 60 * 1000, 2, 2);
    insertCard.run(3, 'State Newton\'s First Law of Motion', 'An object at rest stays at rest and an object in motion stays in motion unless acted upon by an external force', 'Inertia', 1, 2.3, 1, now - 1 * 24 * 60 * 60 * 1000, 4, 3);

    // Insert user stats
    const insertUserStats = db.prepare(`
      INSERT INTO user_stats (level, experiencePoints, coins, currentStreak, longestStreak, totalCardsStudied, totalStudyMinutes, averageAccuracy, lastStudyDate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertUserStats.run(12, 1200, 2450, 7, 47, 248, 1350, 89.0, now);

    // Insert achievements
    const insertAchievement = db.prepare(`
      INSERT INTO achievements (name, description, icon, category, isUnlocked, progress, maxProgress, unlockedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertAchievement.run('First Steps', 'Complete your first card review', '🎯', 'Milestone', 1, 1, 1, now - 30 * 24 * 60 * 60 * 1000);
    insertAchievement.run('Week Warrior', 'Maintain a 7-day study streak', '🔥', 'Streak', 1, 7, 7, now - 1 * 24 * 60 * 60 * 1000);
    insertAchievement.run('Bookworm', 'Study 100 cards', '📖', 'Progress', 1, 248, 100, now - 15 * 24 * 60 * 60 * 1000);
    insertAchievement.run('Fire Starter', 'Maintain a 14-day study streak', '🚀', 'Streak', 1, 14, 14, now - 10 * 24 * 60 * 60 * 1000);
    insertAchievement.run('Perfectionist', 'Achieve 100% accuracy in a session', '💯', 'Performance', 0, 0, 1, null);
    insertAchievement.run('Diamond Mind', 'Reach level 20', '💎', 'Milestone', 0, 12, 20, null);
    insertAchievement.run('Rising Star', 'Earn 5000 coins', '⭐', 'Economy', 0, 2450, 5000, null);
    insertAchievement.run('Champion', 'Complete 1000 cards', '🏆', 'Progress', 0, 248, 1000, null);

    console.log('Sample data populated successfully');
  }
}

// Initialize database
initializeDatabase();
populateSampleData();

module.exports = db;
