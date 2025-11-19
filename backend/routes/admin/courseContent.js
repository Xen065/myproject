/**
 * ============================================
 * Admin Course Content Routes
 * ============================================
 * Admin routes for managing course content (videos, PDFs, files)
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const { requirePermission } = require('../../middleware/rbac');
const { auditLog } = require('../../middleware/auditLog');
const { uploadSingle, uploadWithThumbnail, getFileInfo, deleteFile } = require('../../middleware/upload');
const { CourseContent, Course, CourseModule } = require('../../models');
const { Op } = require('sequelize');

/**
 * @route   GET /api/admin/course-content/course/:courseId
 * @desc    Get all content for a specific course
 * @access  Admin, Teacher (own courses)
 */
router.get(
  '/course/:courseId',
  protect,
  requirePermission('courses.view.unpublished'),
  async (req, res) => {
    try {
      const { courseId } = req.params;
      const { moduleId } = req.query;

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

      const where = { courseId };
      if (moduleId) {
        where.moduleId = moduleId;
      }

      const content = await CourseContent.findAll({
        where,
        order: [['orderIndex', 'ASC']],
        include: [
          {
            model: CourseModule,
            as: 'module',
            attributes: ['id', 'title']
          }
        ]
      });

      res.json({
        success: true,
        data: content
      });
    } catch (error) {
      console.error('Error fetching course content:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching course content'
      });
    }
  }
);

/**
 * @route   POST /api/admin/course-content
 * @desc    Create new course content (with file upload)
 * @access  Admin, Teacher (own courses)
 */
router.post(
  '/',
  protect,
  requirePermission('courses.create'),
  uploadWithThumbnail,
  auditLog('create', 'course_content'),
  async (req, res) => {
    try {
      const {
        courseId,
        moduleId,
        title,
        description,
        contentType,
        externalUrl,
        duration,
        orderIndex,
        isPublished,
        isFree,
        isDownloadable
      } = req.body;

      // Validate required fields
      if (!courseId || !title || !contentType) {
        return res.status(400).json({
          success: false,
          error: 'Course ID, title, and content type are required'
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

      // Teachers can only create content for their own courses
      if (req.user.role === 'teacher' && course.createdBy !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      // Check if module exists (if provided)
      if (moduleId) {
        const module = await CourseModule.findOne({
          where: { id: moduleId, courseId }
        });
        if (!module) {
          return res.status(404).json({
            success: false,
            error: 'Module not found in this course'
          });
        }
      }

      // Get file info if uploaded
      let fileData = {};
      if (req.files && req.files.file && req.files.file[0]) {
        const file = req.files.file[0];
        fileData = getFileInfo(file);
      }

      // Get thumbnail info if uploaded
      let thumbnailPath = null;
      if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
        thumbnailPath = req.files.thumbnail[0].path.replace(/\\/g, '/');
      }

      // If orderIndex not provided, set it to the highest + 1
      let finalOrderIndex = orderIndex;
      if (finalOrderIndex === undefined) {
        const where = { courseId };
        if (moduleId) where.moduleId = moduleId;

        const maxOrder = await CourseContent.max('orderIndex', { where });
        finalOrderIndex = (maxOrder || 0) + 1;
      }

      const content = await CourseContent.create({
        courseId,
        moduleId: moduleId || null,
        title,
        description,
        contentType,
        ...fileData,
        externalUrl,
        duration: duration ? parseInt(duration) : null,
        thumbnailPath,
        orderIndex: finalOrderIndex,
        isPublished: isPublished !== 'false',
        isFree: isFree === 'true',
        isDownloadable: isDownloadable !== 'false'
      });

      res.status(201).json({
        success: true,
        data: content
      });
    } catch (error) {
      console.error('Error creating course content:', error);
      res.status(500).json({
        success: false,
        error: 'Error creating course content'
      });
    }
  }
);

/**
 * @route   PUT /api/admin/course-content/:id
 * @desc    Update course content
 * @access  Admin, Teacher (own courses)
 */
router.put(
  '/:id',
  protect,
  requirePermission('courses.edit.own'),
  uploadWithThumbnail,
  auditLog('update', 'course_content'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        title,
        description,
        contentType,
        externalUrl,
        duration,
        orderIndex,
        isPublished,
        isFree,
        isDownloadable,
        moduleId
      } = req.body;

      const content = await CourseContent.findByPk(id, {
        include: [{ model: Course, as: 'course' }]
      });

      if (!content) {
        return res.status(404).json({
          success: false,
          error: 'Content not found'
        });
      }

      // Teachers can only update content for their own courses
      if (req.user.role === 'teacher' && content.course.createdBy !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      // Update file if new one uploaded
      if (req.files && req.files.file && req.files.file[0]) {
        // Delete old file
        if (content.filePath) {
          await deleteFile(content.filePath);
        }

        const file = req.files.file[0];
        const fileData = getFileInfo(file);
        Object.assign(content, fileData);
      }

      // Update thumbnail if new one uploaded
      if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
        // Delete old thumbnail
        if (content.thumbnailPath) {
          await deleteFile(content.thumbnailPath);
        }

        content.thumbnailPath = req.files.thumbnail[0].path.replace(/\\/g, '/');
      }

      // Update other fields
      if (title !== undefined) content.title = title;
      if (description !== undefined) content.description = description;
      if (contentType !== undefined) content.contentType = contentType;
      if (externalUrl !== undefined) content.externalUrl = externalUrl;
      if (duration !== undefined) content.duration = parseInt(duration);
      if (orderIndex !== undefined) content.orderIndex = orderIndex;
      if (isPublished !== undefined) content.isPublished = isPublished !== 'false';
      if (isFree !== undefined) content.isFree = isFree === 'true';
      if (isDownloadable !== undefined) content.isDownloadable = isDownloadable !== 'false';
      if (moduleId !== undefined) content.moduleId = moduleId || null;

      await content.save();

      res.json({
        success: true,
        data: content
      });
    } catch (error) {
      console.error('Error updating course content:', error);
      res.status(500).json({
        success: false,
        error: 'Error updating course content'
      });
    }
  }
);

/**
 * @route   DELETE /api/admin/course-content/:id
 * @desc    Delete course content
 * @access  Admin, Teacher (own courses)
 */
router.delete(
  '/:id',
  protect,
  requirePermission('courses.delete.own'),
  auditLog('delete', 'course_content'),
  async (req, res) => {
    try {
      const { id } = req.params;

      const content = await CourseContent.findByPk(id, {
        include: [{ model: Course, as: 'course' }]
      });

      if (!content) {
        return res.status(404).json({
          success: false,
          error: 'Content not found'
        });
      }

      // Teachers can only delete content for their own courses
      if (req.user.role === 'teacher' && content.course.createdBy !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      // Delete associated files
      if (content.filePath) {
        await deleteFile(content.filePath);
      }
      if (content.thumbnailPath) {
        await deleteFile(content.thumbnailPath);
      }

      await content.destroy();

      res.json({
        success: true,
        message: 'Content deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting course content:', error);
      res.status(500).json({
        success: false,
        error: 'Error deleting course content'
      });
    }
  }
);

/**
 * @route   PUT /api/admin/course-content/reorder
 * @desc    Reorder course content
 * @access  Admin, Teacher (own courses)
 */
router.put(
  '/reorder',
  protect,
  requirePermission('courses.edit.own'),
  async (req, res) => {
    try {
      const { contentOrders } = req.body; // Array of { id, orderIndex }

      if (!Array.isArray(contentOrders)) {
        return res.status(400).json({
          success: false,
          error: 'contentOrders must be an array'
        });
      }

      // Update all content's orderIndex
      await Promise.all(
        contentOrders.map(({ id, orderIndex }) =>
          CourseContent.update(
            { orderIndex },
            { where: { id } }
          )
        )
      );

      res.json({
        success: true,
        message: 'Content reordered successfully'
      });
    } catch (error) {
      console.error('Error reordering content:', error);
      res.status(500).json({
        success: false,
        error: 'Error reordering content'
      });
    }
  }
);

module.exports = router;
