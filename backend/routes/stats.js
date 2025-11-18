/**
 * ============================================
 * Statistics Routes
 * ============================================
 * User progress and statistics
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { Card, StudySession, User, UserCourse } = require('../models');
const { Op } = require('sequelize');

/**
 * @route   GET /api/stats/dashboard
 * @desc    Get dashboard statistics
 * @access  Private
 */
router.get('/dashboard', protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    // Get card counts
    const totalCards = await Card.count({
      where: {
        userId: req.user.id,
        isActive: true
      }
    });

    const dueCards = await Card.count({
      where: {
        userId: req.user.id,
        isActive: true,
        isSuspended: false,
        nextReviewDate: {
          [Op.lte]: new Date()
        }
      }
    });

    const masteredCards = await Card.count({
      where: {
        userId: req.user.id,
        isActive: true,
        status: 'mastered'
      }
    });

    // Get enrolled courses count
    const enrolledCourses = await UserCourse.count({
      where: {
        userId: req.user.id,
        isActive: true
      }
    });

    // Get today's completed cards
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completedToday = await Card.count({
      where: {
        userId: req.user.id,
        lastReviewDate: {
          [Op.gte]: today
        }
      }
    });

    // Calculate accuracy
    const cardsWithReviews = await Card.findAll({
      where: {
        userId: req.user.id,
        timesReviewed: {
          [Op.gt]: 0
        }
      },
      attributes: ['timesCorrect', 'timesIncorrect']
    });

    let totalCorrect = 0;
    let totalIncorrect = 0;

    cardsWithReviews.forEach(card => {
      totalCorrect += card.timesCorrect;
      totalIncorrect += card.timesIncorrect;
    });

    const accuracy = totalCorrect + totalIncorrect > 0
      ? Math.round((totalCorrect / (totalCorrect + totalIncorrect)) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        user: {
          level: user.level,
          xp: user.experiencePoints,
          coins: user.coins,
          streak: user.currentStreak,
          longestStreak: user.longestStreak
        },
        cards: {
          total: totalCards,
          due: dueCards,
          mastered: masteredCards,
          completedToday
        },
        courses: {
          enrolled: enrolledCourses
        },
        performance: {
          accuracy,
          totalReviews: totalCorrect + totalIncorrect
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics'
    });
  }
});

/**
 * @route   GET /api/stats/history
 * @desc    Get study history
 * @access  Private
 */
router.get('/history', protect, async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const sessions = await StudySession.findAll({
      where: {
        userId: req.user.id,
        createdAt: {
          [Op.gte]: startDate
        }
      },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        sessions,
        count: sessions.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching study history'
    });
  }
});

module.exports = router;
