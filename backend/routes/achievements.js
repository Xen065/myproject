/**
 * ============================================
 * Achievement Routes
 * ============================================
 * Gamification achievements
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { Achievement, UserAchievement } = require('../models');

/**
 * @route   GET /api/achievements
 * @desc    Get all achievements with user progress
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const achievements = await Achievement.findAll({
      where: {
        isActive: true
      },
      order: [['sortOrder', 'ASC']]
    });

    // Get user's achievement progress
    const userAchievements = await UserAchievement.findAll({
      where: {
        userId: req.user.id
      }
    });

    // Create a map of user achievements for easy lookup
    const userAchievementMap = {};
    userAchievements.forEach(ua => {
      userAchievementMap[ua.achievementId] = {
        unlocked: ua.isCompleted,
        progress: ua.progress,
        unlockedAt: ua.unlockedAt
      };
    });

    // Combine achievements with user progress
    const achievementsWithProgress = achievements.map(achievement => {
      const userProgress = userAchievementMap[achievement.id] || {
        unlocked: false,
        progress: 0,
        unlockedAt: null
      };

      return {
        ...achievement.toJSON(),
        userProgress
      };
    });

    res.json({
      success: true,
      data: {
        achievements: achievementsWithProgress,
        count: achievements.length
      }
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
 * @route   GET /api/achievements/unlocked
 * @desc    Get user's unlocked achievements
 * @access  Private
 */
router.get('/unlocked', protect, async (req, res) => {
  try {
    const unlockedAchievements = await UserAchievement.findAll({
      where: {
        userId: req.user.id,
        isCompleted: true
      },
      include: [{
        model: Achievement,
        as: 'Achievement'
      }],
      order: [['unlockedAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        achievements: unlockedAchievements,
        count: unlockedAchievements.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching unlocked achievements'
    });
  }
});

module.exports = router;
