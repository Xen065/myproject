/**
 * ============================================
 * Study Routes
 * ============================================
 * Study sessions and card review with spaced repetition
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { Card, StudySession, User } = require('../models');

/**
 * @route   POST /api/study/review
 * @desc    Review a card (update spaced repetition data)
 * @access  Private
 */
router.post('/review', protect, async (req, res) => {
  try {
    const { cardId, quality, responseTime } = req.body;

    // Quality: 1 (Again), 2 (Hard), 3 (Good), 4 (Easy)
    if (!cardId || !quality || quality < 1 || quality > 4) {
      return res.status(400).json({
        success: false,
        message: 'Valid cardId and quality (1-4) are required'
      });
    }

    const card = await Card.findOne({
      where: {
        id: cardId,
        userId: req.user.id
      }
    });

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    // Get user's frequency mode preference
    const user = await User.findByPk(req.user.id);
    const frequencyMode = user.frequencyMode || 'normal';

    // Calculate next review using SM-2 algorithm with frequency mode
    const reviewData = card.calculateNextReview(quality, frequencyMode);

    // Update card
    card.easeFactor = reviewData.easeFactor;
    card.interval = reviewData.interval;
    card.repetitions = reviewData.repetitions;
    card.nextReviewDate = reviewData.nextReviewDate;
    card.lastReviewDate = reviewData.lastReviewDate;

    // Update statistics
    card.timesReviewed++;
    if (quality >= 3) {
      card.timesCorrect++;
    } else {
      card.timesIncorrect++;
    }

    // Update status
    if (card.repetitions === 0) {
      card.status = 'learning';
    } else if (card.repetitions >= 3 && quality >= 3) {
      card.status = 'reviewing';
    }

    if (card.repetitions >= 10 && card.easeFactor >= 2.3) {
      card.status = 'mastered';
    }

    // Update response time
    if (responseTime) {
      if (card.averageResponseTime) {
        card.averageResponseTime = (card.averageResponseTime + responseTime) / 2;
      } else {
        card.averageResponseTime = responseTime;
      }
    }

    await card.save();

    // Update user streak (user already fetched above)
    const today = new Date().toDateString();
    const lastStudy = user.lastStudyDate ? new Date(user.lastStudyDate).toDateString() : null;

    if (lastStudy !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      if (lastStudy === yesterdayStr) {
        // Consecutive day
        user.currentStreak++;
      } else if (lastStudy !== null) {
        // Streak broken
        user.currentStreak = 1;
      } else {
        // First study
        user.currentStreak = 1;
      }

      if (user.currentStreak > user.longestStreak) {
        user.longestStreak = user.currentStreak;
      }

      user.lastStudyDate = new Date();

      // Add XP and coins
      const xpGained = quality * 5;
      const coinsGained = quality >= 3 ? 2 : 1;
      user.experiencePoints += xpGained;
      user.coins += coinsGained;

      await user.save();
    }

    res.json({
      success: true,
      message: 'Card reviewed successfully',
      data: {
        card,
        nextReview: reviewData.nextReviewDate,
        interval: reviewData.interval
      }
    });
  } catch (error) {
    console.error('Review card error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reviewing card'
    });
  }
});

/**
 * @route   POST /api/study/skip
 * @desc    Skip a card for 1 hour
 * @access  Private
 */
router.post('/skip', protect, async (req, res) => {
  try {
    const { cardId } = req.body;

    if (!cardId) {
      return res.status(400).json({
        success: false,
        message: 'cardId is required'
      });
    }

    const card = await Card.findOne({
      where: {
        id: cardId,
        userId: req.user.id
      }
    });

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    // Set next review to 1 hour from now
    const nextReviewDate = new Date();
    nextReviewDate.setHours(nextReviewDate.getHours() + 1);

    card.nextReviewDate = nextReviewDate;
    await card.save();

    res.json({
      success: true,
      message: 'Card skipped for 1 hour',
      data: {
        card,
        nextReview: nextReviewDate
      }
    });
  } catch (error) {
    console.error('Skip card error:', error);
    res.status(500).json({
      success: false,
      message: 'Error skipping card'
    });
  }
});

/**
 * @route   POST /api/study/sessions
 * @desc    Create a study session
 * @access  Private
 */
router.post('/sessions', protect, async (req, res) => {
  try {
    const { courseId, title, scheduledDate } = req.body;

    const session = await StudySession.create({
      userId: req.user.id,
      courseId: courseId || null,
      title: title || 'Study Session',
      scheduledDate: scheduledDate || new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Study session created',
      data: {
        session
      }
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating study session'
    });
  }
});

/**
 * @route   GET /api/study/sessions
 * @desc    Get user's study sessions
 * @access  Private
 */
router.get('/sessions', protect, async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const sessions = await StudySession.findAll({
      where: {
        userId: req.user.id
      },
      limit: parseInt(limit),
      order: [['scheduledDate', 'DESC']]
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
      message: 'Error fetching sessions'
    });
  }
});

module.exports = router;
