/**
 * ============================================
 * Admin User Routes
 * ============================================
 * Admin routes for user and role management
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const { requirePermission, requireSuperAdmin } = require('../../middleware/rbac');
const { auditLog, logAction } = require('../../middleware/auditLog');
const { User, Course, StudySession, UserCourse, AuditLog } = require('../../models');
const { Op } = require('sequelize');

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Admin
 */
router.get(
  '/',
  protect,
  requirePermission('users.view.all'),
  async (req, res) => {
    try {
      const {
        role,
        isActive,
        search,
        limit = 50,
        offset = 0,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = req.query;

      const where = {};

      // Filter by role
      if (role) {
        where.role = role;
      }

      // Filter by active status
      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      // Search by username, email, or full name
      if (search) {
        where[Op.or] = [
          { username: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { fullName: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const users = await User.findAndCountAll({
        where,
        attributes: { exclude: ['password'] },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[sortBy, sortOrder]],
        include: [
          {
            model: Course,
            as: 'createdCourses',
            attributes: ['id', 'title']
          }
        ]
      });

      res.json({
        success: true,
        data: {
          users: users.rows,
          total: users.count,
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching users'
      });
    }
  }
);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get user details
 * @access  Admin
 */
router.get(
  '/:id',
  protect,
  requirePermission('users.view.all'),
  async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id, {
        attributes: { exclude: ['password'] },
        include: [
          {
            model: Course,
            as: 'createdCourses',
            attributes: ['id', 'title', 'category', 'enrollmentCount']
          },
          {
            model: UserCourse,
            as: 'courseEnrollments',
            include: [
              {
                model: Course,
                attributes: ['id', 'title', 'category']
              }
            ]
          }
        ]
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Get study statistics
      const studyStats = await StudySession.findAll({
        where: { userId: user.id },
        attributes: [
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'totalSessions'],
          [require('sequelize').fn('SUM', require('sequelize').col('cards_studied')), 'totalCards'],
          [require('sequelize').fn('AVG', require('sequelize').col('accuracy')), 'avgAccuracy']
        ]
      });

      res.json({
        success: true,
        data: {
          user,
          stats: studyStats[0]
        }
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching user'
      });
    }
  }
);

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update user details
 * @access  Admin
 */
router.put(
  '/:id',
  protect,
  requirePermission('users.edit.any'),
  auditLog('user.update', 'user', { includeBody: true }),
  async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      const {
        username,
        email,
        fullName,
        bio,
        level,
        experiencePoints,
        coins,
        isEmailVerified
      } = req.body;

      // Update allowed fields
      if (username !== undefined) user.username = username;
      if (email !== undefined) user.email = email;
      if (fullName !== undefined) user.fullName = fullName;
      if (bio !== undefined) user.bio = bio;
      if (level !== undefined) user.level = level;
      if (experiencePoints !== undefined) user.experiencePoints = experiencePoints;
      if (coins !== undefined) user.coins = coins;
      if (isEmailVerified !== undefined) user.isEmailVerified = isEmailVerified;

      await user.save();

      const updatedUser = user.getPublicProfile();

      res.json({
        success: true,
        message: 'User updated successfully',
        data: updatedUser
      });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({
        success: false,
        error: 'Error updating user'
      });
    }
  }
);

/**
 * @route   PUT /api/admin/users/:id/role
 * @desc    Change user role
 * @access  Admin (for student/teacher), Super Admin (for admin)
 */
router.put(
  '/:id/role',
  protect,
  auditLog('user.role_change', 'user', { includeBody: true }),
  async (req, res) => {
    try {
      const { role } = req.body;

      if (!role || !['student', 'teacher', 'admin', 'super_admin'].includes(role)) {
        return res.status(400).json({
          success: false,
          error: 'Valid role is required (student, teacher, admin, super_admin)'
        });
      }

      // Check permissions based on target role
      if (role === 'admin' || role === 'super_admin') {
        if (req.user.role !== 'super_admin') {
          return res.status(403).json({
            success: false,
            error: 'Only super admins can promote users to admin or super_admin'
          });
        }
      } else {
        // For student/teacher, admin permission is sufficient
        if (!['admin', 'super_admin'].includes(req.user.role)) {
          return res.status(403).json({
            success: false,
            error: 'Insufficient permissions'
          });
        }
      }

      const user = await User.findByPk(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Prevent users from demoting themselves
      if (user.id === req.user.id) {
        return res.status(400).json({
          success: false,
          error: 'You cannot change your own role'
        });
      }

      const oldRole = user.role;

      // Update role
      user.role = role;
      user.roleChangedAt = new Date();
      user.roleChangedBy = req.user.id;

      await user.save();

      res.json({
        success: true,
        message: `User role changed from ${oldRole} to ${role}`,
        data: {
          userId: user.id,
          username: user.username,
          oldRole,
          newRole: role,
          changedBy: req.user.username
        }
      });
    } catch (error) {
      console.error('Error changing user role:', error);
      res.status(500).json({
        success: false,
        error: 'Error changing user role'
      });
    }
  }
);

/**
 * @route   PUT /api/admin/users/:id/status
 * @desc    Activate/deactivate user
 * @access  Admin
 */
router.put(
  '/:id/status',
  protect,
  requirePermission('users.deactivate'),
  auditLog('user.status_change', 'user', { includeBody: true }),
  async (req, res) => {
    try {
      const { isActive } = req.body;

      if (typeof isActive !== 'boolean') {
        return res.status(400).json({
          success: false,
          error: 'isActive must be a boolean'
        });
      }

      const user = await User.findByPk(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Prevent users from deactivating themselves
      if (user.id === req.user.id) {
        return res.status(400).json({
          success: false,
          error: 'You cannot deactivate your own account'
        });
      }

      // Prevent non-super-admins from deactivating admins
      if (user.isAdmin() && req.user.role !== 'super_admin') {
        return res.status(403).json({
          success: false,
          error: 'Only super admins can deactivate admin accounts'
        });
      }

      user.isActive = isActive;
      await user.save();

      res.json({
        success: true,
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: {
          userId: user.id,
          username: user.username,
          isActive: user.isActive
        }
      });
    } catch (error) {
      console.error('Error changing user status:', error);
      res.status(500).json({
        success: false,
        error: 'Error changing user status'
      });
    }
  }
);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Permanently delete user (DANGER!)
 * @access  Super Admin only
 */
router.delete(
  '/:id',
  protect,
  requireSuperAdmin(),
  auditLog('user.delete', 'user'),
  async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Prevent users from deleting themselves
      if (user.id === req.user.id) {
        return res.status(400).json({
          success: false,
          error: 'You cannot delete your own account'
        });
      }

      // Store username for response
      const username = user.username;

      await user.destroy();

      res.json({
        success: true,
        message: `User ${username} permanently deleted`,
        warning: 'This action cannot be undone'
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({
        success: false,
        error: 'Error deleting user'
      });
    }
  }
);

/**
 * @route   GET /api/admin/users/:id/activity
 * @desc    Get user activity logs
 * @access  Admin
 */
router.get(
  '/:id/activity',
  protect,
  requirePermission('audit_logs.view.all'),
  async (req, res) => {
    try {
      const { limit = 50, offset = 0 } = req.query;

      const user = await User.findByPk(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      const logs = await AuditLog.findAndCountAll({
        where: { userId: user.id },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
          },
          logs: logs.rows,
          total: logs.count,
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      });
    } catch (error) {
      console.error('Error fetching user activity:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching user activity'
      });
    }
  }
);

/**
 * @route   GET /api/admin/users/stats/overview
 * @desc    Get user statistics overview
 * @access  Admin
 */
router.get(
  '/stats/overview',
  protect,
  requirePermission('stats.view.platform'),
  async (req, res) => {
    try {
      const [
        totalUsers,
        activeUsers,
        studentCount,
        teacherCount,
        adminCount,
        superAdminCount
      ] = await Promise.all([
        User.count(),
        User.count({ where: { isActive: true } }),
        User.count({ where: { role: 'student' } }),
        User.count({ where: { role: 'teacher' } }),
        User.count({ where: { role: 'admin' } }),
        User.count({ where: { role: 'super_admin' } })
      ]);

      res.json({
        success: true,
        data: {
          totalUsers,
          activeUsers,
          inactiveUsers: totalUsers - activeUsers,
          byRole: {
            student: studentCount,
            teacher: teacherCount,
            admin: adminCount,
            super_admin: superAdminCount
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

module.exports = router;
