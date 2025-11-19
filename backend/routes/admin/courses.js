/**
 * ============================================
 * Admin Course Routes
 * ============================================
 * Admin routes for course management
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const {
  requirePermission,
  requireOwnershipOrPermission
} = require('../../middleware/rbac');
const { auditLog, logAction } = require('../../middleware/auditLog');
const { Course, Card, UserCourse, User } = require('../../models');
const { Op } = require('sequelize');

/**
 * @route   GET /api/admin/courses
 * @desc    Get all courses (including unpublished)
 * @access  Admin, Teacher
 */
router.get(
  '/',
  protect,
  requirePermission('courses.view.unpublished'),
  async (req, res) => {
    try {
      const {
        category,
        search,
        isPublished,
        createdBy,
        limit = 50,
        offset = 0
      } = req.query;

      const where = {};

      // Filter by category
      if (category) {
        where.category = category;
      }

      // Filter by published status
      if (isPublished !== undefined) {
        where.isPublished = isPublished === 'true';
      }

      // Filter by creator (teachers see their own by default)
      if (createdBy) {
        where.createdBy = parseInt(createdBy);
      } else if (req.user.role === 'teacher') {
        // Teachers only see their own courses
        where.createdBy = req.user.id;
      }

      // Search by title or description
      if (search) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const courses = await Course.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'username', 'email', 'fullName']
          }
        ]
      });

      res.json({
        success: true,
        data: {
          courses: courses.rows,
          total: courses.count,
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      });
    } catch (error) {
      console.error('Error fetching courses:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching courses'
      });
    }
  }
);

/**
 * @route   GET /api/admin/courses/:id
 * @desc    Get course details
 * @access  Admin, Teacher (own courses)
 */
router.get(
  '/:id',
  protect,
  requirePermission('courses.view.unpublished'),
  async (req, res) => {
    try {
      const course = await Course.findByPk(req.params.id, {
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'username', 'email', 'fullName']
          },
          {
            model: Card,
            as: 'cards',
            where: { userId: null }, // Template cards only
            required: false
          }
        ]
      });

      if (!course) {
        return res.status(404).json({
          success: false,
          error: 'Course not found'
        });
      }

      // Check if teacher owns this course
      if (req.user.role === 'teacher' && course.createdBy !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'You can only view your own courses'
        });
      }

      res.json({
        success: true,
        data: course
      });
    } catch (error) {
      console.error('Error fetching course:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching course'
      });
    }
  }
);

/**
 * @route   POST /api/admin/courses
 * @desc    Create new course
 * @access  Admin, Teacher
 */
router.post(
  '/',
  protect,
  requirePermission('courses.create'),
  auditLog('course.create', 'course', { includeBody: true }),
  async (req, res) => {
    try {
      const {
        title,
        description,
        category,
        difficulty,
        price,
        isFree,
        isPublished,
        imageUrl
      } = req.body;

      // Validation
      if (!title || !description) {
        return res.status(400).json({
          success: false,
          error: 'Title and description are required'
        });
      }

      const course = await Course.create({
        title,
        description,
        category: category || 'General',
        difficulty: difficulty || 'beginner',
        price: price || 0,
        isFree: isFree !== undefined ? isFree : true,
        isPublished: isPublished !== undefined ? isPublished : false,
        imageUrl,
        createdBy: req.user.id,
        totalCards: 0,
        enrollmentCount: 0
      });

      res.status(201).json({
        success: true,
        message: 'Course created successfully',
        data: course
      });
    } catch (error) {
      console.error('Error creating course:', error);
      res.status(500).json({
        success: false,
        error: 'Error creating course'
      });
    }
  }
);

/**
 * @route   PUT /api/admin/courses/:id
 * @desc    Update course
 * @access  Admin (any course), Teacher (own courses)
 */
router.put(
  '/:id',
  protect,
  auditLog('course.update', 'course', { includeBody: true }),
  async (req, res) => {
    try {
      const course = await Course.findByPk(req.params.id);

      if (!course) {
        return res.status(404).json({
          success: false,
          error: 'Course not found'
        });
      }

      // Check ownership or admin permission
      const isOwner = course.createdBy === req.user.id;
      const hasAdminPermission = ['admin', 'super_admin'].includes(req.user.role);

      if (!isOwner && !hasAdminPermission) {
        return res.status(403).json({
          success: false,
          error: 'You can only edit your own courses'
        });
      }

      // Update course
      const {
        title,
        description,
        category,
        difficulty,
        price,
        isFree,
        isPublished,
        imageUrl,
        isFeatured
      } = req.body;

      if (title !== undefined) course.title = title;
      if (description !== undefined) course.description = description;
      if (category !== undefined) course.category = category;
      if (difficulty !== undefined) course.difficulty = difficulty;
      if (price !== undefined) course.price = price;
      if (isFree !== undefined) course.isFree = isFree;
      if (isPublished !== undefined) course.isPublished = isPublished;
      if (imageUrl !== undefined) course.imageUrl = imageUrl;

      // Only admins can set featured status
      if (isFeatured !== undefined && hasAdminPermission) {
        course.isFeatured = isFeatured;
      }

      await course.save();

      res.json({
        success: true,
        message: 'Course updated successfully',
        data: course
      });
    } catch (error) {
      console.error('Error updating course:', error);
      res.status(500).json({
        success: false,
        error: 'Error updating course'
      });
    }
  }
);

/**
 * @route   DELETE /api/admin/courses/:id
 * @desc    Delete course
 * @access  Admin (any course), Teacher (own courses)
 */
router.delete(
  '/:id',
  protect,
  auditLog('course.delete', 'course'),
  async (req, res) => {
    try {
      const course = await Course.findByPk(req.params.id);

      if (!course) {
        return res.status(404).json({
          success: false,
          error: 'Course not found'
        });
      }

      // Check ownership or admin permission
      const isOwner = course.createdBy === req.user.id;
      const hasAdminPermission = ['admin', 'super_admin'].includes(req.user.role);

      if (!isOwner && !hasAdminPermission) {
        return res.status(403).json({
          success: false,
          error: 'You can only delete your own courses'
        });
      }

      await course.destroy();

      res.json({
        success: true,
        message: 'Course deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting course:', error);
      res.status(500).json({
        success: false,
        error: 'Error deleting course'
      });
    }
  }
);

/**
 * @route   PUT /api/admin/courses/:id/publish
 * @desc    Publish/unpublish course
 * @access  Admin, Teacher (own courses)
 */
router.put(
  '/:id/publish',
  protect,
  requirePermission('courses.publish'),
  auditLog('course.publish_toggle', 'course'),
  async (req, res) => {
    try {
      const course = await Course.findByPk(req.params.id);

      if (!course) {
        return res.status(404).json({
          success: false,
          error: 'Course not found'
        });
      }

      // Check ownership for teachers
      if (req.user.role === 'teacher' && course.createdBy !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'You can only publish your own courses'
        });
      }

      course.isPublished = !course.isPublished;
      await course.save();

      res.json({
        success: true,
        message: `Course ${course.isPublished ? 'published' : 'unpublished'} successfully`,
        data: course
      });
    } catch (error) {
      console.error('Error toggling publish status:', error);
      res.status(500).json({
        success: false,
        error: 'Error toggling publish status'
      });
    }
  }
);

/**
 * @route   POST /api/admin/courses/:id/duplicate
 * @desc    Duplicate a course
 * @access  Admin, Teacher
 */
router.post(
  '/:id/duplicate',
  protect,
  requirePermission('courses.create'),
  auditLog('course.duplicate', 'course'),
  async (req, res) => {
    try {
      const originalCourse = await Course.findByPk(req.params.id, {
        include: [
          {
            model: Card,
            as: 'cards',
            where: { userId: null }, // Template cards only
            required: false
          }
        ]
      });

      if (!originalCourse) {
        return res.status(404).json({
          success: false,
          error: 'Course not found'
        });
      }

      // Create duplicate course
      const duplicateCourse = await Course.create({
        title: `${originalCourse.title} (Copy)`,
        description: originalCourse.description,
        category: originalCourse.category,
        difficulty: originalCourse.difficulty,
        price: originalCourse.price,
        isFree: originalCourse.isFree,
        imageUrl: originalCourse.imageUrl,
        isPublished: false,
        createdBy: req.user.id,
        totalCards: 0,
        enrollmentCount: 0
      });

      // Duplicate cards
      if (originalCourse.cards && originalCourse.cards.length > 0) {
        const duplicateCards = originalCourse.cards.map(card => ({
          courseId: duplicateCourse.id,
          userId: null,
          question: card.question,
          answer: card.answer,
          hint: card.hint,
          type: card.type,
          options: card.options,
          correctAnswer: card.correctAnswer,
          imageUrl: card.imageUrl,
          status: 'new'
        }));

        await Card.bulkCreate(duplicateCards);

        // Update total cards
        duplicateCourse.totalCards = duplicateCards.length;
        await duplicateCourse.save();
      }

      res.status(201).json({
        success: true,
        message: 'Course duplicated successfully',
        data: duplicateCourse
      });
    } catch (error) {
      console.error('Error duplicating course:', error);
      res.status(500).json({
        success: false,
        error: 'Error duplicating course'
      });
    }
  }
);

/**
 * @route   GET /api/admin/courses/:id/stats
 * @desc    Get course statistics
 * @access  Admin, Teacher (own courses)
 */
router.get(
  '/:id/stats',
  protect,
  requirePermission('stats.view.course'),
  async (req, res) => {
    try {
      const course = await Course.findByPk(req.params.id);

      if (!course) {
        return res.status(404).json({
          success: false,
          error: 'Course not found'
        });
      }

      // Check ownership for teachers
      if (req.user.role === 'teacher' && course.createdBy !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'You can only view stats for your own courses'
        });
      }

      // Get enrollment stats
      const enrollments = await UserCourse.findAll({
        where: { courseId: course.id }
      });

      const totalEnrollments = enrollments.length;
      const activeEnrollments = enrollments.filter(e => e.progressPercentage > 0).length;
      const completedEnrollments = enrollments.filter(e => e.progressPercentage === 100).length;
      const averageProgress = enrollments.length > 0
        ? enrollments.reduce((sum, e) => sum + e.progressPercentage, 0) / enrollments.length
        : 0;

      res.json({
        success: true,
        data: {
          courseId: course.id,
          courseTitle: course.title,
          totalCards: course.totalCards,
          totalEnrollments,
          activeEnrollments,
          completedEnrollments,
          averageProgress: Math.round(averageProgress * 100) / 100
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

module.exports = router;
