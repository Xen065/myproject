/**
 * ============================================
 * Admin Routes Index
 * ============================================
 * Combines all admin routes
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/rbac');

// Import admin route modules
const courseRoutes = require('./courses');
const cardRoutes = require('./cards');
const userRoutes = require('./users');
const auditLogRoutes = require('./auditLogs');
const dashboardRoutes = require('./dashboard');
const permissionRoutes = require('./permissions');
const courseModuleRoutes = require('./courseModules');
const courseContentRoutes = require('./courseContent');

// All admin routes require authentication and admin/teacher/super_admin role
router.use(protect);
router.use(requireRole(['teacher', 'admin', 'super_admin']));

// Mount admin route modules
router.use('/courses', courseRoutes);
router.use('/cards', cardRoutes);
router.use('/users', userRoutes);
router.use('/audit-logs', auditLogRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/permissions', permissionRoutes);
router.use('/course-modules', courseModuleRoutes);
router.use('/course-content', courseContentRoutes);

/**
 * @route   GET /api/admin/health
 * @desc    Admin health check
 * @access  Admin, Teacher
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Admin API is running',
    user: {
      id: req.user.id,
      username: req.user.username,
      role: req.user.role
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
