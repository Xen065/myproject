/**
 * ============================================
 * Math Trick Routes
 * ============================================
 * Gamified math practice for competitive exams
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { MathTrickProgress, MathTrickScore, MathTrickAchievement, User } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Question Generator Utilities
 */
const QuestionGenerator = {
  // Speed Arithmetic
  speedArithmetic: (level) => {
    const ranges = {
      1: { min: 10, max: 50 },
      2: { min: 50, max: 150 },
      3: { min: 150, max: 500 },
      4: { min: 500, max: 1000 },
      5: { min: 1000, max: 5000 }
    };
    const range = ranges[level];
    const operations = ['+', '-', '×', '÷'];
    const op = operations[Math.floor(Math.random() * operations.length)];

    let num1 = Math.floor(Math.random() * (range.max - range.min) + range.min);
    let num2 = Math.floor(Math.random() * (range.max - range.min) + range.min);
    let answer;
    let question;

    if (op === '÷') {
      // Make sure division is clean
      num1 = num2 * Math.floor(Math.random() * 20 + 2);
      answer = num1 / num2;
      question = `${num1} ÷ ${num2}`;
    } else if (op === '+') {
      answer = num1 + num2;
      question = `${num1} + ${num2}`;
    } else if (op === '-') {
      if (num1 < num2) [num1, num2] = [num2, num1];
      answer = num1 - num2;
      question = `${num1} - ${num2}`;
    } else {
      answer = num1 * num2;
      question = `${num1} × ${num2}`;
    }

    return {
      question: question,
      answer: answer,
      trick: QuestionGenerator.getArithmeticTrick(op, num1, num2)
    };
  },

  // Mental Math Shortcuts
  mentalMath: (level) => {
    const tricks = [
      // Multiply by 11
      () => {
        const num = Math.floor(Math.random() * 80 + 10);
        return {
          question: `${num} × 11`,
          answer: num * 11,
          trick: `Split ${num} and add middle: ${Math.floor(num/10)} + ${num%10} = ${Math.floor(num/10) + num%10}, then combine`
        };
      },
      // Square numbers ending in 5
      () => {
        const num = Math.floor(Math.random() * 15 + 2) * 10 + 5;
        return {
          question: `${num}²`,
          answer: num * num,
          trick: `For numbers ending in 5: ${Math.floor(num/10)} × ${Math.floor(num/10)+1} = ${Math.floor(num/10) * (Math.floor(num/10)+1)}, then add 25`
        };
      },
      // Multiply near 100
      () => {
        const num1 = Math.floor(Math.random() * 10 + 91);
        const num2 = Math.floor(Math.random() * 10 + 91);
        return {
          question: `${num1} × ${num2}`,
          answer: num1 * num2,
          trick: `Both near 100: (${num1}-100) + (${num2}-100) = cross-sum, then multiply differences`
        };
      }
    ];
    const selectedTrick = tricks[Math.floor(Math.random() * tricks.length)];
    return selectedTrick();
  },

  // Percentage
  percentage: (level) => {
    const types = [
      // Find percentage of number
      () => {
        const percent = Math.floor(Math.random() * 50 + 10);
        const num = Math.floor(Math.random() * 900 + 100) * (level * 2);
        return {
          question: `What is ${percent}% of ${num}?`,
          answer: Math.round((percent / 100) * num),
          trick: `Convert ${percent}% to decimal (${percent/100}), then multiply by ${num}`
        };
      },
      // Increase by percentage
      () => {
        const percent = Math.floor(Math.random() * 30 + 5);
        const num = Math.floor(Math.random() * 500 + 100) * level;
        const answer = Math.round(num * (1 + percent/100));
        return {
          question: `Increase ${num} by ${percent}%`,
          answer: answer,
          trick: `Multiply ${num} by ${1 + percent/100} = ${answer}`
        };
      }
    ];
    const selectedType = types[Math.floor(Math.random() * types.length)];
    return selectedType();
  },

  // Profit & Loss
  profitLoss: (level) => {
    const cp = Math.floor(Math.random() * 500 + 200) * level;
    const profitPercent = Math.floor(Math.random() * 40 + 5);
    const sp = Math.round(cp * (1 + profitPercent/100));

    return {
      question: `CP = ${cp}, SP = ${sp}. Profit %?`,
      answer: profitPercent,
      trick: `Profit% = ((SP - CP) / CP) × 100 = ((${sp} - ${cp}) / ${cp}) × 100`
    };
  },

  // Squares & Cubes
  squaresCubes: (level) => {
    const ranges = {
      1: { min: 10, max: 20 },
      2: { min: 20, max: 30 },
      3: { min: 30, max: 50 },
      4: { min: 50, max: 75 },
      5: { min: 75, max: 100 }
    };
    const range = ranges[level];
    const num = Math.floor(Math.random() * (range.max - range.min) + range.min);
    const isCube = Math.random() > 0.7;

    return {
      question: isCube ? `${num}³` : `${num}²`,
      answer: isCube ? num * num * num : num * num,
      trick: isCube ? `${num} × ${num} × ${num}` : `${num} × ${num}`
    };
  },

  // Ratio & Proportion
  ratio: (level) => {
    const a = Math.floor(Math.random() * 10 + 2);
    const b = Math.floor(Math.random() * 10 + 2);
    const total = (Math.floor(Math.random() * 100 + 50)) * level;
    const actualA = Math.round((a / (a + b)) * total);

    return {
      question: `Divide ${total} in ratio ${a}:${b}. First part?`,
      answer: actualA,
      trick: `First part = (${a}/(${a}+${b})) × ${total} = ${actualA}`
    };
  },

  // Simplification
  simplification: (level) => {
    const a = Math.floor(Math.random() * 50 + 10) * level;
    const b = Math.floor(Math.random() * 30 + 5) * level;
    const c = Math.floor(Math.random() * 20 + 5);
    const d = Math.floor(Math.random() * 10 + 2);

    // (a + b) × c - d
    const answer = (a + b) * c - d;

    return {
      question: `(${a} + ${b}) × ${c} - ${d}`,
      answer: answer,
      trick: `BODMAS: First brackets (${a + b}), then multiply by ${c} = ${(a+b)*c}, finally subtract ${d}`
    };
  },

  // Time & Work
  timeWork: (level) => {
    const daysA = Math.floor(Math.random() * 15 + 5);
    const daysB = Math.floor(Math.random() * 15 + 5);
    const together = Math.round((daysA * daysB) / (daysA + daysB) * 10) / 10;

    return {
      question: `A does work in ${daysA} days, B in ${daysB} days. Together in ? days`,
      answer: together,
      trick: `Together = (${daysA} × ${daysB})/(${daysA} + ${daysB}) = ${together} days`
    };
  },

  // Speed, Distance & Time
  speedDistance: (level) => {
    const distance = Math.floor(Math.random() * 300 + 100) * level;
    const time = Math.floor(Math.random() * 8 + 2);
    const speed = Math.round(distance / time);

    return {
      question: `A train covers ${distance} km in ${time} hours. Speed in km/h?`,
      answer: speed,
      trick: `Speed = Distance/Time = ${distance}/${time} = ${speed} km/h`
    };
  },

  // Number Series
  numberSeries: (level) => {
    const patterns = [
      // Arithmetic progression
      () => {
        const start = Math.floor(Math.random() * 20 + 5);
        const diff = Math.floor(Math.random() * 10 + 2);
        const series = [start, start+diff, start+2*diff, start+3*diff, start+4*diff];
        const next = start + 5*diff;
        return {
          question: `Find next: ${series.join(', ')}, __?`,
          answer: next,
          trick: `Add ${diff} each time. Next = ${start+4*diff} + ${diff} = ${next}`
        };
      },
      // Squares
      () => {
        const start = Math.floor(Math.random() * 5 + 2);
        const series = [];
        for (let i = 0; i < 5; i++) {
          series.push((start + i) * (start + i));
        }
        const next = (start + 5) * (start + 5);
        return {
          question: `Find next: ${series.join(', ')}, __?`,
          answer: next,
          trick: `Squares of consecutive numbers starting from ${start}. Next = ${start+5}² = ${next}`
        };
      }
    ];
    const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
    return selectedPattern();
  },

  getArithmeticTrick: (op, num1, num2) => {
    if (op === '×') {
      return `Break down: ${num1} × ${num2} = use distribution or standard multiplication`;
    } else if (op === '+') {
      return `Round up and subtract: easier mental calculation`;
    } else if (op === '-') {
      return `Count up from smaller to larger number`;
    } else {
      return `Factor method: divide step by step`;
    }
  }
};

/**
 * @route   GET /api/math-trick/progress
 * @desc    Get or initialize user progress
 * @access  Private
 */
router.get('/progress', protect, async (req, res) => {
  try {
    let progress = await MathTrickProgress.findOne({
      where: { userId: req.user.id }
    });

    // Initialize if doesn't exist
    if (!progress) {
      progress = await MathTrickProgress.create({
        userId: req.user.id
      });
    }

    res.json({
      success: true,
      data: { progress }
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching progress'
    });
  }
});

/**
 * @route   GET /api/math-trick/questions
 * @desc    Generate questions for a game session
 * @access  Private
 */
router.get('/questions', protect, async (req, res) => {
  try {
    const { topic, level, count = 20 } = req.query;

    if (!topic || !level) {
      return res.status(400).json({
        success: false,
        message: 'Topic and level are required'
      });
    }

    const questions = [];
    const questionCount = parseInt(count);
    const questionLevel = parseInt(level);

    // Generate questions
    for (let i = 0; i < questionCount; i++) {
      let questionData;

      switch(topic) {
        case 'speedArithmetic':
          questionData = QuestionGenerator.speedArithmetic(questionLevel);
          break;
        case 'mentalMath':
          questionData = QuestionGenerator.mentalMath(questionLevel);
          break;
        case 'percentage':
          questionData = QuestionGenerator.percentage(questionLevel);
          break;
        case 'profitLoss':
          questionData = QuestionGenerator.profitLoss(questionLevel);
          break;
        case 'squaresCubes':
          questionData = QuestionGenerator.squaresCubes(questionLevel);
          break;
        case 'ratio':
          questionData = QuestionGenerator.ratio(questionLevel);
          break;
        case 'simplification':
          questionData = QuestionGenerator.simplification(questionLevel);
          break;
        case 'timeWork':
          questionData = QuestionGenerator.timeWork(questionLevel);
          break;
        case 'speedDistance':
          questionData = QuestionGenerator.speedDistance(questionLevel);
          break;
        case 'numberSeries':
          questionData = QuestionGenerator.numberSeries(questionLevel);
          break;
        default:
          questionData = QuestionGenerator.speedArithmetic(questionLevel);
      }

      questions.push({
        id: i + 1,
        ...questionData
      });
    }

    res.json({
      success: true,
      data: { questions }
    });
  } catch (error) {
    console.error('Generate questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating questions'
    });
  }
});

/**
 * @route   POST /api/math-trick/submit-game
 * @desc    Submit completed game and update progress
 * @access  Private
 */
router.post('/submit-game', protect, async (req, res) => {
  try {
    const {
      gameMode,
      topic,
      level,
      score,
      questionsAnswered,
      correctAnswers,
      wrongAnswers,
      totalTime,
      maxStreak,
      questionResults
    } = req.body;

    // Validation
    if (!gameMode || !level || score === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Calculate stats
    const accuracy = questionsAnswered > 0 ? (correctAnswers / questionsAnswered) * 100 : 0;
    const averageTime = questionsAnswered > 0 ? totalTime / questionsAnswered : 0;

    // Calculate XP earned
    const baseXP = correctAnswers * 10;
    const streakBonus = Math.floor(maxStreak / 3) * 5;
    const speedBonus = averageTime < 15 ? 20 : averageTime < 30 ? 10 : 0;
    const xpEarned = baseXP + streakBonus + speedBonus;

    // Save score
    const gameScore = await MathTrickScore.create({
      userId: req.user.id,
      gameMode,
      topic: topic || null,
      level,
      score,
      questionsAnswered,
      correctAnswers,
      wrongAnswers,
      accuracy,
      averageTime,
      totalTime,
      maxStreak,
      xpEarned,
      questionResults: questionResults || []
    });

    // Update user progress
    let progress = await MathTrickProgress.findOne({
      where: { userId: req.user.id }
    });

    if (!progress) {
      progress = await MathTrickProgress.create({
        userId: req.user.id
      });
    }

    // Update progress stats
    progress.totalScore += score;
    progress.totalQuestionsAnswered += questionsAnswered;
    progress.totalCorrectAnswers += correctAnswers;
    progress.totalWrongAnswers += wrongAnswers;
    progress.xp += xpEarned;

    // Update streak
    if (correctAnswers > 0) {
      progress.currentStreak = maxStreak;
      if (maxStreak > progress.longestStreak) {
        progress.longestStreak = maxStreak;
      }
    } else {
      progress.currentStreak = 0;
    }

    // Update average speed
    const totalQuestions = progress.totalQuestionsAnswered;
    progress.averageSpeed = ((progress.averageSpeed * (totalQuestions - questionsAnswered)) + (averageTime * questionsAnswered)) / totalQuestions;

    // Check for level up
    const xpThresholds = [0, 1000, 3000, 6000, 10000, 15000];
    for (let i = 1; i <= 5; i++) {
      if (progress.xp >= xpThresholds[i] && progress.level < i) {
        progress.level = i;
      }
    }

    // Update topic stats
    if (topic && progress.topicStats[topic]) {
      const topicStat = progress.topicStats[topic];
      const prevCorrect = topicStat.correct;
      const prevWrong = topicStat.wrong;
      const prevAvgTime = topicStat.avgTime || 0;

      topicStat.correct += correctAnswers;
      topicStat.wrong += wrongAnswers;

      const totalAnswered = prevCorrect + prevWrong + correctAnswers + wrongAnswers;
      topicStat.avgTime = ((prevAvgTime * (prevCorrect + prevWrong)) + (averageTime * questionsAnswered)) / totalAnswered;

      progress.topicStats = { ...progress.topicStats };
      progress.changed('topicStats', true);
    }

    // Update daily streak
    const today = new Date().toDateString();
    const lastPlayed = progress.lastPlayedDate ? new Date(progress.lastPlayedDate).toDateString() : null;

    if (lastPlayed !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      if (lastPlayed === yesterdayStr) {
        progress.dailyStreak += 1;
      } else if (lastPlayed !== today) {
        progress.dailyStreak = 1;
      }
    }

    progress.lastPlayedDate = new Date();

    await progress.save();

    // Check for achievements
    const newAchievements = await checkAndAwardAchievements(req.user.id, progress, gameScore);

    res.json({
      success: true,
      message: 'Game submitted successfully',
      data: {
        score: gameScore,
        progress,
        xpEarned,
        newAchievements
      }
    });
  } catch (error) {
    console.error('Submit game error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting game'
    });
  }
});

/**
 * @route   GET /api/math-trick/leaderboard
 * @desc    Get leaderboard
 * @access  Private
 */
router.get('/leaderboard', protect, async (req, res) => {
  try {
    const { period = 'all-time', limit = 100 } = req.query;

    let whereClause = {};

    if (period === 'daily') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      whereClause.completedAt = { [Op.gte]: today };
    } else if (period === 'weekly') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      whereClause.completedAt = { [Op.gte]: weekAgo };
    }

    // Get top scorers
    const topScorers = await MathTrickProgress.findAll({
      include: [{
        model: User,
        as: 'student',
        attributes: ['id', 'username', 'firstName', 'lastName']
      }],
      order: [['totalScore', 'DESC']],
      limit: parseInt(limit)
    });

    // Get current user rank
    const allUsers = await MathTrickProgress.findAll({
      order: [['totalScore', 'DESC']],
      attributes: ['userId', 'totalScore']
    });

    const userRank = allUsers.findIndex(u => u.userId === req.user.id) + 1;

    res.json({
      success: true,
      data: {
        leaderboard: topScorers,
        userRank
      }
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard'
    });
  }
});

/**
 * @route   GET /api/math-trick/achievements
 * @desc    Get user achievements
 * @access  Private
 */
router.get('/achievements', protect, async (req, res) => {
  try {
    const achievements = await MathTrickAchievement.findAll({
      where: { userId: req.user.id },
      order: [['unlockedAt', 'DESC']]
    });

    res.json({
      success: true,
      data: { achievements }
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching achievements'
    });
  }
});

/**
 * @route   GET /api/math-trick/stats
 * @desc    Get detailed statistics
 * @access  Private
 */
router.get('/stats', protect, async (req, res) => {
  try {
    const progress = await MathTrickProgress.findOne({
      where: { userId: req.user.id }
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'No progress found'
      });
    }

    // Get recent games
    const recentGames = await MathTrickScore.findAll({
      where: { userId: req.user.id },
      order: [['completedAt', 'DESC']],
      limit: 10
    });

    // Calculate stats
    const totalGames = await MathTrickScore.count({
      where: { userId: req.user.id }
    });

    const avgAccuracy = progress.totalQuestionsAnswered > 0
      ? (progress.totalCorrectAnswers / progress.totalQuestionsAnswered) * 100
      : 0;

    res.json({
      success: true,
      data: {
        progress,
        recentGames,
        totalGames,
        avgAccuracy
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
});

/**
 * Helper: Check and award achievements
 */
async function checkAndAwardAchievements(userId, progress, gameScore) {
  const newAchievements = [];

  const achievementRules = [
    {
      name: 'First Steps',
      icon: '🎯',
      description: 'Complete your first game',
      category: 'special',
      condition: () => progress.totalQuestionsAnswered >= 10
    },
    {
      name: 'Speed Demon',
      icon: '⚡',
      description: 'Average time under 10 seconds',
      category: 'speed',
      condition: () => gameScore.averageTime < 10 && gameScore.questionsAnswered >= 10
    },
    {
      name: 'Perfect Score',
      icon: '💯',
      description: 'Get 20 consecutive correct answers',
      category: 'streak',
      condition: () => gameScore.maxStreak >= 20
    },
    {
      name: 'Sharpshooter',
      icon: '🎯',
      description: '95% accuracy in a game',
      category: 'accuracy',
      condition: () => gameScore.accuracy >= 95 && gameScore.questionsAnswered >= 15
    },
    {
      name: 'Level Up',
      icon: '⭐',
      description: 'Reach Level 2',
      category: 'level',
      condition: () => progress.level >= 2
    },
    {
      name: 'Math Master',
      icon: '🏆',
      description: 'Reach Level 5',
      category: 'level',
      condition: () => progress.level >= 5
    },
    {
      name: 'Century',
      icon: '💯',
      description: 'Answer 100 questions correctly',
      category: 'special',
      condition: () => progress.totalCorrectAnswers >= 100
    },
    {
      name: 'Daily Warrior',
      icon: '🔥',
      description: '7 day streak',
      category: 'streak',
      condition: () => progress.dailyStreak >= 7
    }
  ];

  for (const rule of achievementRules) {
    if (rule.condition()) {
      // Check if already awarded
      const existing = await MathTrickAchievement.findOne({
        where: {
          userId,
          badgeName: rule.name
        }
      });

      if (!existing) {
        const achievement = await MathTrickAchievement.create({
          userId,
          badgeName: rule.name,
          badgeIcon: rule.icon,
          description: rule.description,
          category: rule.category
        });
        newAchievements.push(achievement);
      }
    }
  }

  return newAchievements;
}

module.exports = router;
