/**
 * ============================================
 * Admin Card Routes
 * ============================================
 * Admin routes for flashcard template management
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const { requirePermission } = require('../../middleware/rbac');
const { auditLog } = require('../../middleware/auditLog');
const { Card, Course } = require('../../models');
const { Op } = require('sequelize');

/**
 * @route   GET /api/admin/cards
 * @desc    Get all card templates
 * @access  Admin, Teacher
 */
router.get(
  '/',
  protect,
  requirePermission('cards.view.templates'),
  async (req, res) => {
    try {
      const { courseId, type, search, limit = 100, offset = 0 } = req.query;

      const where = { userId: null }; // Only template cards

      if (courseId) {
        where.courseId = parseInt(courseId);

        // If teacher, check if they own this course
        if (req.user.role === 'teacher') {
          const course = await Course.findByPk(courseId);
          if (!course || course.createdBy !== req.user.id) {
            return res.status(403).json({
              success: false,
              error: 'You can only view cards from your own courses'
            });
          }
        }
      } else if (req.user.role === 'teacher') {
        // Teachers only see cards from their own courses
        const teacherCourses = await Course.findAll({
          where: { createdBy: req.user.id },
          attributes: ['id']
        });
        const courseIds = teacherCourses.map(c => c.id);
        where.courseId = { [Op.in]: courseIds };
      }

      if (type) {
        where.type = type;
      }

      if (search) {
        where[Op.or] = [
          { question: { [Op.iLike]: `%${search}%` } },
          { answer: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const cards = await Card.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'title', 'category']
          }
        ]
      });

      res.json({
        success: true,
        data: {
          cards: cards.rows,
          total: cards.count,
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      });
    } catch (error) {
      console.error('Error fetching cards:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching cards'
      });
    }
  }
);

/**
 * @route   GET /api/admin/cards/course/:courseId
 * @desc    Get all cards for a specific course
 * @access  Admin, Teacher (own courses)
 */
router.get(
  '/course/:courseId',
  protect,
  requirePermission('cards.view.templates'),
  async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const { moduleId } = req.query;

      // Check course ownership for teachers
      if (req.user.role === 'teacher') {
        const course = await Course.findByPk(courseId);
        if (!course || course.createdBy !== req.user.id) {
          return res.status(403).json({
            success: false,
            error: 'You can only view cards from your own courses'
          });
        }
      }

      const where = {
        courseId,
        userId: null // Template cards only
      };

      // Filter by module if specified
      if (moduleId) {
        where.moduleId = parseInt(moduleId);
      }

      const cards = await Card.findAll({
        where,
        order: [['createdAt', 'ASC']]
      });

      res.json({
        success: true,
        data: {
          cards,
          count: cards.length
        }
      });
    } catch (error) {
      console.error('Error fetching course cards:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching course cards'
      });
    }
  }
);

/**
 * @route   GET /api/admin/cards/:id
 * @desc    Get card details
 * @access  Admin, Teacher (own courses)
 */
router.get(
  '/:id',
  protect,
  requirePermission('cards.view.templates'),
  async (req, res) => {
    try {
      const card = await Card.findOne({
        where: {
          id: req.params.id,
          userId: null
        },
        include: [
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'title', 'createdBy']
          }
        ]
      });

      if (!card) {
        return res.status(404).json({
          success: false,
          error: 'Card not found'
        });
      }

      // Check ownership for teachers
      if (req.user.role === 'teacher' && card.course.createdBy !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'You can only view cards from your own courses'
        });
      }

      res.json({
        success: true,
        data: card
      });
    } catch (error) {
      console.error('Error fetching card:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching card'
      });
    }
  }
);

/**
 * @route   POST /api/admin/cards
 * @desc    Create new card template
 * @access  Admin, Teacher
 */
router.post(
  '/',
  protect,
  requirePermission('cards.create'),
  auditLog('card.create', 'card', { includeBody: true }),
  async (req, res) => {
    try {
      const {
        courseId,
        moduleId,
        question,
        answer,
        hint,
        explanation,
        cardType,
        options,
        tags
      } = req.body;

      // Validation
      if (!courseId || !question || !answer) {
        return res.status(400).json({
          success: false,
          error: 'Course ID, question, and answer are required'
        });
      }

      // Check if course exists and user has permission
      const course = await Course.findByPk(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          error: 'Course not found'
        });
      }

      // Teachers can only add cards to their own courses
      if (req.user.role === 'teacher' && course.createdBy !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'You can only add cards to your own courses'
        });
      }

      // Validate cardType
      const validCardTypes = ['basic', 'multiple_choice', 'cloze', 'image'];
      const finalCardType = cardType && validCardTypes.includes(cardType) ? cardType : 'basic';

      // For multiple choice, ensure we have options
      if (finalCardType === 'multiple_choice' && (!options || !Array.isArray(options) || options.length < 2)) {
        return res.status(400).json({
          success: false,
          error: 'Multiple choice questions must have at least 2 options'
        });
      }

      // Create card template
      const card = await Card.create({
        courseId,
        moduleId: moduleId || null,
        userId: null, // Template card
        question,
        answer,
        hint: hint || null,
        explanation: explanation || null,
        cardType: finalCardType,
        options: finalCardType === 'multiple_choice' ? options : null,
        tags: tags || [],
        status: 'new',
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0
      });

      // Update course total cards count
      await course.increment('totalCards');

      res.status(201).json({
        success: true,
        message: 'Card created successfully',
        data: card
      });
    } catch (error) {
      console.error('Error creating card:', error);
      res.status(500).json({
        success: false,
        error: 'Error creating card'
      });
    }
  }
);

/**
 * @route   POST /api/admin/cards/bulk
 * @desc    Bulk create cards
 * @access  Admin, Teacher
 */
router.post(
  '/bulk',
  protect,
  requirePermission('cards.create'),
  auditLog('card.bulk_create', 'card', { includeBody: true }),
  async (req, res) => {
    try {
      const { courseId, cards } = req.body;

      // Validation
      if (!courseId || !Array.isArray(cards) || cards.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Course ID and cards array are required'
        });
      }

      // Check if course exists and user has permission
      const course = await Course.findByPk(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          error: 'Course not found'
        });
      }

      if (req.user.role === 'teacher' && course.createdBy !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'You can only add cards to your own courses'
        });
      }

      // Prepare cards for bulk creation
      const cardData = cards.map(card => ({
        courseId,
        userId: null,
        question: card.question,
        answer: card.answer,
        hint: card.hint || null,
        type: card.type || 'basic',
        options: card.options || null,
        correctAnswer: card.correctAnswer || null,
        imageUrl: card.imageUrl || null,
        status: 'new',
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0
      }));

      // Create cards
      const createdCards = await Card.bulkCreate(cardData);

      // Update course total cards count
      await course.increment('totalCards', { by: createdCards.length });

      res.status(201).json({
        success: true,
        message: `${createdCards.length} cards created successfully`,
        data: {
          count: createdCards.length,
          cards: createdCards
        }
      });
    } catch (error) {
      console.error('Error bulk creating cards:', error);
      res.status(500).json({
        success: false,
        error: 'Error bulk creating cards'
      });
    }
  }
);

/**
 * @route   PUT /api/admin/cards/:id
 * @desc    Update card template
 * @access  Admin, Teacher (own courses)
 */
router.put(
  '/:id',
  protect,
  requirePermission('cards.edit.templates'),
  auditLog('card.update', 'card', { includeBody: true }),
  async (req, res) => {
    try {
      const card = await Card.findOne({
        where: {
          id: req.params.id,
          userId: null
        },
        include: [
          {
            model: Course,
            as: 'course'
          }
        ]
      });

      if (!card) {
        return res.status(404).json({
          success: false,
          error: 'Card not found'
        });
      }

      // Check ownership for teachers
      if (req.user.role === 'teacher' && card.course.createdBy !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'You can only edit cards from your own courses'
        });
      }

      // Update card
      const {
        question,
        answer,
        hint,
        type,
        options,
        correctAnswer,
        imageUrl
      } = req.body;

      if (question !== undefined) card.question = question;
      if (answer !== undefined) card.answer = answer;
      if (hint !== undefined) card.hint = hint;
      if (type !== undefined) card.type = type;
      if (options !== undefined) card.options = options;
      if (correctAnswer !== undefined) card.correctAnswer = correctAnswer;
      if (imageUrl !== undefined) card.imageUrl = imageUrl;

      await card.save();

      res.json({
        success: true,
        message: 'Card updated successfully',
        data: card
      });
    } catch (error) {
      console.error('Error updating card:', error);
      res.status(500).json({
        success: false,
        error: 'Error updating card'
      });
    }
  }
);

/**
 * @route   DELETE /api/admin/cards/:id
 * @desc    Delete card template
 * @access  Admin, Teacher (own courses)
 */
router.delete(
  '/:id',
  protect,
  requirePermission('cards.delete.own'),
  auditLog('card.delete', 'card'),
  async (req, res) => {
    try {
      const card = await Card.findOne({
        where: {
          id: req.params.id,
          userId: null
        },
        include: [
          {
            model: Course,
            as: 'course'
          }
        ]
      });

      if (!card) {
        return res.status(404).json({
          success: false,
          error: 'Card not found'
        });
      }

      // Check ownership for teachers
      if (req.user.role === 'teacher' && card.course.createdBy !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'You can only delete cards from your own courses'
        });
      }

      const courseId = card.courseId;

      await card.destroy();

      // Update course total cards count
      const course = await Course.findByPk(courseId);
      if (course) {
        await course.decrement('totalCards');
      }

      res.json({
        success: true,
        message: 'Card deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting card:', error);
      res.status(500).json({
        success: false,
        error: 'Error deleting card'
      });
    }
  }
);

/**
 * @route   DELETE /api/admin/cards/bulk
 * @desc    Bulk delete cards
 * @access  Admin, Teacher (own courses)
 */
router.delete(
  '/bulk/delete',
  protect,
  requirePermission('cards.delete.own'),
  auditLog('card.bulk_delete', 'card', { includeBody: true }),
  async (req, res) => {
    try {
      const { cardIds } = req.body;

      if (!Array.isArray(cardIds) || cardIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Card IDs array is required'
        });
      }

      // Get all cards to check ownership
      const cards = await Card.findAll({
        where: {
          id: { [Op.in]: cardIds },
          userId: null
        },
        include: [
          {
            model: Course,
            as: 'course'
          }
        ]
      });

      // Check if teacher owns all courses
      if (req.user.role === 'teacher') {
        const unauthorizedCards = cards.filter(c => c.course.createdBy !== req.user.id);
        if (unauthorizedCards.length > 0) {
          return res.status(403).json({
            success: false,
            error: 'You can only delete cards from your own courses'
          });
        }
      }

      // Group cards by course for updating counts
      const courseCardCounts = {};
      cards.forEach(card => {
        courseCardCounts[card.courseId] = (courseCardCounts[card.courseId] || 0) + 1;
      });

      // Delete cards
      await Card.destroy({
        where: {
          id: { [Op.in]: cardIds },
          userId: null
        }
      });

      // Update course card counts
      for (const [courseId, count] of Object.entries(courseCardCounts)) {
        const course = await Course.findByPk(courseId);
        if (course) {
          await course.decrement('totalCards', { by: count });
        }
      }

      res.json({
        success: true,
        message: `${cards.length} cards deleted successfully`
      });
    } catch (error) {
      console.error('Error bulk deleting cards:', error);
      res.status(500).json({
        success: false,
        error: 'Error bulk deleting cards'
      });
    }
  }
);

module.exports = router;
