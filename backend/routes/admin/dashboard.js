/**
 * ============================================
 * Admin Dashboard Routes
 * ============================================
 * Admin routes for dashboard statistics and overview
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const { requirePermission } = require('../../middleware/rbac');
const { User, Course, Card, StudySession, UserCourse, AuditLog } = require('../../models');
const { Op } = require('sequelize');
const sequelize = require('../../config/database');

/**
 * @route   GET /api/admin/dashboard/overview
 * @desc    Get dashboard overview statistics
 * @access  Admin
 */
router.get(
  '/overview',
  protect,
  requirePermission('stats.view.platform'),
  async (req, res) => {
    try {
      // Get counts
      const [
        totalUsers,
        activeUsers,
        totalCourses,
        publishedCourses,
        totalCards,
        totalEnrollments
      ] = await Promise.all([
        User.count(),
        User.count({ where: { isActive: true } }),
        Course.count(),
        Course.count({ where: { isPublished: true } }),
        Card.count({ where: { userId: null } }), // Template cards only
        UserCourse.count()
      ]);

      // Get user role breakdown
      const usersByRole = await User.findAll({
        attributes: [
          'role',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['role']
      });

      const roleBreakdown = {};
      usersByRole.forEach(u => {
        roleBreakdown[u.role] = parseInt(u.get('count'));
      });

      // Get recent activity (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const [recentUsers, recentCourses, recentStudySessions, recentAuditLogs] = await Promise.all([
        User.count({
          where: {
            createdAt: { [Op.gte]: yesterday }
          }
        }),
        Course.count({
          where: {
            createdAt: { [Op.gte]: yesterday }
          }
        }),
        StudySession.count({
          where: {
            createdAt: { [Op.gte]: yesterday }
          }
        }),
        AuditLog.count({
          where: {
            createdAt: { [Op.gte]: yesterday }
          }
        })
      ]);

      // Get top courses by enrollment
      const topCourses = await Course.findAll({
        order: [['enrollmentCount', 'DESC']],
        limit: 5,
        attributes: ['id', 'title', 'enrollmentCount', 'category']
      });

      // Get recent user registrations
      const recentUsersList = await User.findAll({
        order: [['createdAt', 'DESC']],
        limit: 5,
        attributes: ['id', 'username', 'email', 'role', 'createdAt']
      });

      res.json({
        success: true,
        data: {
          overview: {
            totalUsers,
            activeUsers,
            inactiveUsers: totalUsers - activeUsers,
            totalCourses,
            publishedCourses,
            unpublishedCourses: totalCourses - publishedCourses,
            totalCards,
            totalEnrollments
          },
          usersByRole: roleBreakdown,
          recentActivity: {
            newUsers: recentUsers,
            newCourses: recentCourses,
            studySessions: recentStudySessions,
            auditLogs: recentAuditLogs
          },
          topCourses,
          recentUsers: recentUsersList
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching dashboard overview'
      });
    }
  }
);

/**
 * @route   GET /api/admin/dashboard/stats/users
 * @desc    Get detailed user statistics
 * @access  Admin
 */
router.get(
  '/stats/users',
  protect,
  requirePermission('stats.view.platform'),
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      // Build date filter
      const dateWhere = {};
      if (startDate || endDate) {
        dateWhere.createdAt = {};
        if (startDate) dateWhere.createdAt[Op.gte] = new Date(startDate);
        if (endDate) dateWhere.createdAt[Op.lte] = new Date(endDate);
      }

      // User growth over time
      const userGrowth = await User.findAll({
        attributes: [
          [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        where: dateWhere,
        group: [sequelize.fn('DATE', sequelize.col('created_at'))],
        order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']]
      });

      // Average level and XP
      const avgStats = await User.findOne({
        attributes: [
          [sequelize.fn('AVG', sequelize.col('level')), 'avgLevel'],
          [sequelize.fn('AVG', sequelize.col('experience_points')), 'avgXP'],
          [sequelize.fn('AVG', sequelize.col('current_streak')), 'avgStreak']
        ]
      });

      res.json({
        success: true,
        data: {
          userGrowth: userGrowth.map(u => ({
            date: u.get('date'),
            count: parseInt(u.get('count'))
          })),
          averages: {
            level: parseFloat(avgStats.get('avgLevel')).toFixed(2),
            experiencePoints: Math.round(parseFloat(avgStats.get('avgXP'))),
            streak: parseFloat(avgStats.get('avgStreak')).toFixed(2)
          }
        }
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching user stats'
      });
    }
  }
);

/**
 * @route   GET /api/admin/dashboard/stats/courses
 * @desc    Get detailed course statistics
 * @access  Admin
 */
router.get(
  '/stats/courses',
  protect,
  requirePermission('stats.view.platform'),
  async (req, res) => {
    try {
      // Courses by category
      const coursesByCategory = await Course.findAll({
        attributes: [
          'category',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['category'],
        order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']]
      });

      // Courses by difficulty
      const coursesByDifficulty = await Course.findAll({
        attributes: [
          'difficulty',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['difficulty']
      });

      // Average enrollment per course
      const avgEnrollment = await Course.findOne({
        attributes: [
          [sequelize.fn('AVG', sequelize.col('enrollment_count')), 'avgEnrollment']
        ]
      });

      // Most popular courses
      const popularCourses = await Course.findAll({
        order: [['enrollmentCount', 'DESC']],
        limit: 10,
        attributes: ['id', 'title', 'category', 'enrollmentCount', 'totalCards'],
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'username']
          }
        ]
      });

      res.json({
        success: true,
        data: {
          byCategory: coursesByCategory.map(c => ({
            category: c.category,
            count: parseInt(c.get('count'))
          })),
          byDifficulty: coursesByDifficulty.map(c => ({
            difficulty: c.difficulty,
            count: parseInt(c.get('count'))
          })),
          averageEnrollment: parseFloat(avgEnrollment.get('avgEnrollment')).toFixed(2),
          popularCourses
        }
      });
    } catch (error) {
      console.error('Error fetching course stats:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching course stats'
      });
    }
  }
);

/**
 * @route   GET /api/admin/dashboard/stats/engagement
 * @desc    Get platform engagement statistics
 * @access  Admin
 */
router.get(
  '/stats/engagement',
  protect,
  requirePermission('stats.view.platform'),
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      // Build date filter
      const dateWhere = {};
      if (startDate || endDate) {
        dateWhere.createdAt = {};
        if (startDate) dateWhere.createdAt[Op.gte] = new Date(startDate);
        if (endDate) dateWhere.createdAt[Op.lte] = new Date(endDate);
      }

      // Study sessions over time
      const studySessions = await StudySession.findAll({
        attributes: [
          [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'sessions'],
          [sequelize.fn('SUM', sequelize.col('cards_studied')), 'cards'],
          [sequelize.fn('AVG', sequelize.col('accuracy')), 'accuracy']
        ],
        where: dateWhere,
        group: [sequelize.fn('DATE', sequelize.col('created_at'))],
        order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']]
      });

      // Total study statistics
      const totalStudyStats = await StudySession.findOne({
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'totalSessions'],
          [sequelize.fn('SUM', sequelize.col('cards_studied')), 'totalCards'],
          [sequelize.fn('AVG', sequelize.col('accuracy')), 'avgAccuracy'],
          [sequelize.fn('SUM', sequelize.col('xp_earned')), 'totalXP']
        ],
        where: dateWhere
      });

      // Active users (users who studied in the period)
      const activeUsers = await StudySession.findAll({
        attributes: [
          [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('user_id'))), 'count']
        ],
        where: dateWhere
      });

      res.json({
        success: true,
        data: {
          studyActivity: studySessions.map(s => ({
            date: s.get('date'),
            sessions: parseInt(s.get('sessions')),
            cards: parseInt(s.get('cards') || 0),
            accuracy: parseFloat(s.get('accuracy')).toFixed(2)
          })),
          totals: {
            sessions: parseInt(totalStudyStats.get('totalSessions')),
            cardsStudied: parseInt(totalStudyStats.get('totalCards') || 0),
            averageAccuracy: parseFloat(totalStudyStats.get('avgAccuracy')).toFixed(2),
            totalXPEarned: parseInt(totalStudyStats.get('totalXP') || 0)
          },
          activeUsers: parseInt(activeUsers[0].get('count'))
        }
      });
    } catch (error) {
      console.error('Error fetching engagement stats:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching engagement stats'
      });
    }
  }
);

module.exports = router;
