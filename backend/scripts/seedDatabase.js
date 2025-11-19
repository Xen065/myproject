/**
 * ============================================
 * Database Seeding Script
 * ============================================
 * Adds sample data for testing
 */

require('dotenv').config();
const { User, Course, Card, Achievement } = require('../models');

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');

    // Create sample users
    console.log('Creating sample users...');
    const user1 = await User.create({
      username: 'demo',
      email: 'demo@edumaster.com',
      password: 'demo123',
      fullName: 'Demo Student',
      level: 5,
      experiencePoints: 450,
      coins: 1250,
      currentStreak: 7,
      longestStreak: 15
    });

    console.log('✅ Created user: demo@edumaster.com / demo123');

    // Create sample courses
    console.log('Creating sample courses...');
    const courses = await Course.bulkCreate([
      {
        title: 'English Vocabulary',
        description: 'Essential English words and phrases for everyday communication',
        icon: '📚',
        color: '#6366F1',
        category: 'Language',
        difficulty: 'beginner',
        totalCards: 50,
        activeCards: 50,
        isFree: true,
        isPublished: true,
        isFeatured: true,
        enrollmentCount: 1250
      },
      {
        title: 'JavaScript Fundamentals',
        description: 'Learn the basics of JavaScript programming',
        icon: '💻',
        color: '#F59E0B',
        category: 'Programming',
        difficulty: 'beginner',
        totalCards: 75,
        activeCards: 75,
        isFree: true,
        isPublished: true,
        isFeatured: true,
        enrollmentCount: 980
      },
      {
        title: 'World History',
        description: 'Important historical events and dates',
        icon: '🏛️',
        color: '#10B981',
        category: 'History',
        difficulty: 'intermediate',
        totalCards: 100,
        activeCards: 100,
        isFree: true,
        isPublished: true,
        enrollmentCount: 567
      },
      {
        title: 'Biology Basics',
        description: 'Core concepts in biology and life sciences',
        icon: '🧬',
        color: '#8B5CF6',
        category: 'Science',
        difficulty: 'intermediate',
        totalCards: 80,
        activeCards: 80,
        price: 500,
        isFree: false,
        isPublished: true,
        enrollmentCount: 423
      }
    ]);

    console.log(`✅ Created ${courses.length} courses`);

    // Create sample cards for the first course
    console.log('Creating sample flashcards...');
    const cards = await Card.bulkCreate([
      {
        question: 'What does "serendipity" mean?',
        answer: 'The occurrence of events by chance in a happy or beneficial way',
        hint: 'Think of a happy accident',
        courseId: courses[0].id,
        userId: user1.id,
        status: 'reviewing',
        repetitions: 3,
        easeFactor: 2.5,
        interval: 7
      },
      {
        question: 'Define "ephemeral"',
        answer: 'Lasting for a very short time',
        hint: 'Think of something temporary',
        courseId: courses[0].id,
        userId: user1.id,
        status: 'learning',
        repetitions: 1,
        easeFactor: 2.3,
        interval: 1
      },
      {
        question: 'What is "eloquent"?',
        answer: 'Fluent or persuasive in speaking or writing',
        hint: 'Describes a good speaker',
        courseId: courses[0].id,
        userId: user1.id,
        status: 'new',
        repetitions: 0
      },
      {
        question: 'What does "let" do in JavaScript?',
        answer: 'Declares a block-scoped variable',
        hint: 'ES6 variable declaration',
        courseId: courses[1].id,
        userId: user1.id,
        status: 'reviewing',
        repetitions: 5,
        easeFactor: 2.6,
        interval: 14
      },
      {
        question: 'What is the difference between == and ===?',
        answer: '== compares values with type coercion, === compares values and types without coercion',
        hint: 'One checks type, one doesn\'t',
        courseId: courses[1].id,
        userId: user1.id,
        status: 'mastered',
        repetitions: 12,
        easeFactor: 2.5,
        interval: 30
      }
    ]);

    console.log(`✅ Created ${cards.length} flashcards`);

    // Create achievements
    console.log('Creating achievements...');
    const achievements = await Achievement.bulkCreate([
      {
        title: 'First Steps',
        description: 'Complete your first card review',
        icon: '🎯',
        category: 'cards',
        requirement: 1,
        requirementText: 'Review 1 card',
        xpReward: 10,
        coinReward: 5,
        rarity: 'common',
        sortOrder: 1
      },
      {
        title: 'Week Warrior',
        description: 'Maintain a 7-day study streak',
        icon: '🔥',
        category: 'streak',
        requirement: 7,
        requirementText: 'Study for 7 consecutive days',
        xpReward: 100,
        coinReward: 50,
        rarity: 'rare',
        sortOrder: 2
      },
      {
        title: 'Century Club',
        description: 'Review 100 cards',
        icon: '💯',
        category: 'cards',
        requirement: 100,
        requirementText: 'Complete 100 card reviews',
        xpReward: 200,
        coinReward: 100,
        rarity: 'epic',
        sortOrder: 3
      },
      {
        title: 'Perfect Score',
        description: 'Achieve 100% accuracy in a session',
        icon: '⭐',
        category: 'accuracy',
        requirement: 100,
        requirementText: 'Get all cards correct in one session',
        xpReward: 50,
        coinReward: 25,
        rarity: 'rare',
        sortOrder: 4
      },
      {
        title: 'Course Collector',
        description: 'Enroll in 5 courses',
        icon: '📚',
        category: 'courses',
        requirement: 5,
        requirementText: 'Enroll in 5 different courses',
        xpReward: 75,
        coinReward: 40,
        rarity: 'common',
        sortOrder: 5
      },
      {
        title: 'Master Student',
        description: 'Master 50 cards',
        icon: '🏆',
        category: 'cards',
        requirement: 50,
        requirementText: 'Achieve mastered status on 50 cards',
        xpReward: 500,
        coinReward: 250,
        rarity: 'legendary',
        sortOrder: 6
      }
    ]);

    console.log(`✅ Created ${achievements.length} achievements`);

    console.log('');
    console.log('🎉 Database seeding complete!');
    console.log('');
    console.log('📝 Test Credentials:');
    console.log('   Email: demo@edumaster.com');
    console.log('   Password: demo123');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
