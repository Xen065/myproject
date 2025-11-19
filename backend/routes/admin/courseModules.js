/**
 * ============================================
 * Admin Course Modules Routes
 * ============================================
 * Admin routes for managing course modules/sections
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const { requirePermission, requireOwnershipOrPermission } = require('../../middleware/rbac');
const { auditLog, logAction } = require('../../middleware/auditLog');
const { CourseModule, Course, Card, CourseContent } = require('../../models');
const { Op } = require('sequelize');

/**
 * @route   GET /api/admin/course-modules/course/:courseId
 * @desc    Get all modules for a specific course
 * @access  Admin, Teacher (own courses)
 */
router.get(
  '/course/:courseId',
  protect,
  requirePermission('courses.view.unpublished'),
  async (req, res) => {
    try {
      const { courseId } = req.params;

      // Check if course exists and user has access
      const course = await Course.findByPk(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          error: 'Course not found'
        });
      }

      // Teachers can only access their own courses
      if (req.user.role === 'teacher' && course.createdBy !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      const modules = await CourseModule.findAll({
        where: { courseId },
        order: [['orderIndex', 'ASC']],
        include: [
          {
            model: CourseContent,
            as: 'contents',
            attributes: ['id', 'title', 'contentType', 'isPublished']
          },
          {
            model: Card,
            as: 'questions',
            where: { userId: null }, // Only template questions
            required: false,
            attributes: ['id', 'cardType']
          }
        ]
      });

      res.json({
        success: true,
        data: modules
      });
    } catch (error) {
      console.error('Error fetching course modules:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching course modules'
      });
    }
  }
);

/**
 * @route   POST /api/admin/course-modules
 * @desc    Create a new course module
 * @access  Admin, Teacher (own courses)
 */
router.post(
  '/',
  protect,
  requirePermission('courses.create'),
  auditLog('create', 'course_module'),
  async (req, res) => {
    try {
      const { courseId, title, description, icon, estimatedDuration, orderIndex } = req.body;

      // Validate required fields
      if (!courseId || !title) {
        return res.status(400).json({
          success: false,
          error: 'Course ID and title are required'
        });
      }

      // Check if course exists and user has access
      const course = await Course.findByPk(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          error: 'Course not found'
        });
      }

      // Teachers can only create modules for their own courses
      if (req.user.role === 'teacher' && course.createdBy !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      // If orderIndex not provided, set it to the highest + 1
      let finalOrderIndex = orderIndex;
      if (finalOrderIndex === undefined) {
        const maxOrder = await CourseModule.max('orderIndex', {
          where: { courseId }
        });
        finalOrderIndex = (maxOrder || 0) + 1;
      }

      const module = await CourseModule.create({
        courseId,
        title,
        description,
        icon: icon || '📝',
        estimatedDuration,
        orderIndex: finalOrderIndex,
        isPublished: true
      });

      res.status(201).json({
        success: true,
        data: module
      });
    } catch (error) {
      console.error('Error creating course module:', error);
      res.status(500).json({
        success: false,
        error: 'Error creating course module'
      });
    }
  }
);

/**
 * @route   PUT /api/admin/course-modules/:id
 * @desc    Update a course module
 * @access  Admin, Teacher (own courses)
 */
router.put(
  '/:id',
  protect,
  requirePermission('courses.edit.own'),
  auditLog('update', 'course_module'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, icon, estimatedDuration, orderIndex, isPublished } = req.body;

      const module = await CourseModule.findByPk(id, {
        include: [{ model: Course, as: 'course' }]
      });

      if (!module) {
        return res.status(404).json({
          success: false,
          error: 'Module not found'
        });
      }

      // Teachers can only update modules for their own courses
      if (req.user.role === 'teacher' && module.course.createdBy !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      // Update fields
      if (title !== undefined) module.title = title;
      if (description !== undefined) module.description = description;
      if (icon !== undefined) module.icon = icon;
      if (estimatedDuration !== undefined) module.estimatedDuration = estimatedDuration;
      if (orderIndex !== undefined) module.orderIndex = orderIndex;
      if (isPublished !== undefined) module.isPublished = isPublished;

      await module.save();

      res.json({
        success: true,
        data: module
      });
    } catch (error) {
      console.error('Error updating course module:', error);
      res.status(500).json({
        success: false,
        error: 'Error updating course module'
      });
    }
  }
);

/**
 * @route   DELETE /api/admin/course-modules/:id
 * @desc    Delete a course module
 * @access  Admin, Teacher (own courses)
 */
router.delete(
  '/:id',
  protect,
  requirePermission('courses.delete.own'),
  auditLog('delete', 'course_module'),
  async (req, res) => {
    try {
      const { id } = req.params;

      const module = await CourseModule.findByPk(id, {
        include: [{ model: Course, as: 'course' }]
      });

      if (!module) {
        return res.status(404).json({
          success: false,
          error: 'Module not found'
        });
      }

      // Teachers can only delete modules for their own courses
      if (req.user.role === 'teacher' && module.course.createdBy !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      await module.destroy();

      res.json({
        success: true,
        message: 'Module deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting course module:', error);
      res.status(500).json({
        success: false,
        error: 'Error deleting course module'
      });
    }
  }
);

/**
 * @route   PUT /api/admin/course-modules/reorder
 * @desc    Reorder course modules
 * @access  Admin, Teacher (own courses)
 */
router.put(
  '/reorder',
  protect,
  requirePermission('courses.edit.own'),
  async (req, res) => {
    try {
      const { moduleOrders } = req.body; // Array of { id, orderIndex }

      if (!Array.isArray(moduleOrders)) {
        return res.status(400).json({
          success: false,
          error: 'moduleOrders must be an array'
        });
      }

      // Update all modules' orderIndex
      await Promise.all(
        moduleOrders.map(({ id, orderIndex }) =>
          CourseModule.update(
            { orderIndex },
            { where: { id } }
          )
        )
      );

      res.json({
        success: true,
        message: 'Modules reordered successfully'
      });
    } catch (error) {
      console.error('Error reordering modules:', error);
      res.status(500).json({
        success: false,
        error: 'Error reordering modules'
      });
    }
  }
);

module.exports = router;
