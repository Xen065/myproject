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
const { uploadSingle } = require('../../middleware/upload');
const { Card, Course } = require('../../models');
const { Op } = require('sequelize');
const path = require('path');

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

      const where = {}; // Template cards query

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
          // Teachers only see their own template cards
          where.userId = req.user.id;
        }
      } else if (req.user.role === 'teacher') {
        // Teachers only see cards from their own courses
        const teacherCourses = await Course.findAll({
          where: { createdBy: req.user.id },
          attributes: ['id']
        });
        const courseIds = teacherCourses.map(c => c.id);
        where.courseId = { [Op.in]: courseIds };
        where.userId = req.user.id;
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
 * @route   POST /api/admin/cards/upload-image
 * @desc    Upload image for image quiz card
 * @access  Admin, Teacher
 */
router.post(
  '/upload-image',
  protect,
  requirePermission('cards.create'),
  uploadSingle,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No image file uploaded'
        });
      }

      // Generate URL path for the uploaded image
      const imageUrl = `/uploads/course-content/${req.file.filename}`;

      res.json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          imageUrl,
          fileName: req.file.originalname,
          fileSize: req.file.size
        }
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({
        success: false,
        error: 'Error uploading image'
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
        imageUrl,
        occludedRegions,
        orderedItems,
        multiSelectAnswers,
        matchingPairs,
        categories,
        tags
      } = req.body;

      // Validation
      if (!courseId || !question) {
        return res.status(400).json({
          success: false,
          error: 'Course ID and question are required'
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
      const validCardTypes = ['basic', 'multiple_choice', 'cloze', 'image', 'ordered', 'true_false', 'multi_select', 'matching', 'categorization'];
      const finalCardType = cardType && validCardTypes.includes(cardType) ? cardType : 'basic';

      // Type-specific validation
      if (finalCardType === 'multiple_choice') {
        // For multiple choice, ensure we have options and answer is one of them
        if (!options || !Array.isArray(options) || options.length < 2) {
          return res.status(400).json({
            success: false,
            error: 'Multiple choice questions must have at least 2 options'
          });
        }
        if (!answer) {
          return res.status(400).json({
            success: false,
            error: 'Answer is required for multiple choice questions'
          });
        }
      } else if (finalCardType === 'image') {
        // For image quiz, ensure we have imageUrl and occludedRegions
        if (!imageUrl) {
          return res.status(400).json({
            success: false,
            error: 'Image URL is required for image quiz cards'
          });
        }
        if (!occludedRegions || !Array.isArray(occludedRegions) || occludedRegions.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'At least one occluded region is required for image quiz cards'
          });
        }
        // Validate each region has required fields
        const invalidRegion = occludedRegions.find(
          r => typeof r.x !== 'number' || typeof r.y !== 'number' ||
               typeof r.width !== 'number' || typeof r.height !== 'number' || !r.answer
        );
        if (invalidRegion) {
          return res.status(400).json({
            success: false,
            error: 'Each occluded region must have x, y, width, height, and answer'
          });
        }
      } else if (finalCardType === 'ordered') {
        // For ordered questions, ensure we have orderedItems
        if (!orderedItems || !Array.isArray(orderedItems) || orderedItems.length < 2) {
          return res.status(400).json({
            success: false,
            error: 'Ordered questions must have at least 2 items'
          });
        }
        // Validate each item is a non-empty string
        const invalidItem = orderedItems.find(item => typeof item !== 'string' || !item.trim());
        if (invalidItem !== undefined) {
          return res.status(400).json({
            success: false,
            error: 'All items must be non-empty strings'
          });
        }
      } else if (finalCardType === 'true_false') {
        // For true/false, ensure answer is 'true' or 'false'
        if (!answer || !['true', 'false'].includes(answer.toLowerCase())) {
          return res.status(400).json({
            success: false,
            error: 'True/False questions must have answer as "true" or "false"'
          });
        }
      } else if (finalCardType === 'multi_select') {
        // For multi-select, ensure we have options and at least 2 correct answers
        if (!options || !Array.isArray(options) || options.length < 2) {
          return res.status(400).json({
            success: false,
            error: 'Multi-select questions must have at least 2 options'
          });
        }
        if (!multiSelectAnswers || !Array.isArray(multiSelectAnswers) || multiSelectAnswers.length < 1) {
          return res.status(400).json({
            success: false,
            error: 'Multi-select questions must have at least 1 correct answer'
          });
        }
        // Validate all correct answers are in options
        const invalidAnswer = multiSelectAnswers.find(ans => !options.includes(ans));
        if (invalidAnswer) {
          return res.status(400).json({
            success: false,
            error: 'All correct answers must be in the options list'
          });
        }
      } else if (finalCardType === 'matching') {
        // For matching, ensure we have pairs
        if (!matchingPairs || !Array.isArray(matchingPairs) || matchingPairs.length < 2) {
          return res.status(400).json({
            success: false,
            error: 'Matching questions must have at least 2 pairs'
          });
        }
        // Validate each pair has left and right
        const invalidPair = matchingPairs.find(pair => !pair.left || !pair.right || !pair.left.trim() || !pair.right.trim());
        if (invalidPair !== undefined) {
          return res.status(400).json({
            success: false,
            error: 'Each pair must have both left and right items'
          });
        }
      } else if (finalCardType === 'categorization') {
        // For categorization, ensure we have categories with items
        if (!categories || typeof categories !== 'object' || Object.keys(categories).length < 2) {
          return res.status(400).json({
            success: false,
            error: 'Categorization questions must have at least 2 categories'
          });
        }
        // Validate each category has at least one item
        for (const [catName, items] of Object.entries(categories)) {
          if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
              success: false,
              error: `Category "${catName}" must have at least one item`
            });
          }
          // Validate all items are non-empty strings
          const invalidItem = items.find(item => typeof item !== 'string' || !item.trim());
          if (invalidItem !== undefined) {
            return res.status(400).json({
              success: false,
              error: `All items in category "${catName}" must be non-empty strings`
            });
          }
        }
      } else {
        // For basic and cloze, answer is required
        if (!answer) {
          return res.status(400).json({
            success: false,
            error: 'Answer is required'
          });
        }
      }

      // Create card template
      const card = await Card.create({
        courseId,
        moduleId: moduleId || null,
        userId: course.createdBy, // Template card belongs to course creator
        question,
        answer: answer || '',
        hint: hint || null,
        explanation: explanation || null,
        cardType: finalCardType,
        options: (finalCardType === 'multiple_choice' || finalCardType === 'multi_select') ? options : null,
        imageUrl: finalCardType === 'image' ? imageUrl : null,
        occludedRegions: finalCardType === 'image' ? occludedRegions : null,
        orderedItems: finalCardType === 'ordered' ? orderedItems : null,
        multiSelectAnswers: finalCardType === 'multi_select' ? multiSelectAnswers : null,
        matchingPairs: finalCardType === 'matching' ? matchingPairs : null,
        categories: finalCardType === 'categorization' ? categories : null,
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
        explanation,
        cardType,
        options,
        imageUrl,
        occludedRegions,
        orderedItems,
        multiSelectAnswers,
        matchingPairs,
        categories
      } = req.body;

      if (question !== undefined) card.question = question;
      if (answer !== undefined) card.answer = answer;
      if (hint !== undefined) card.hint = hint;
      if (explanation !== undefined) card.explanation = explanation;
      if (cardType !== undefined) card.cardType = cardType;
      if (options !== undefined) card.options = options;
      if (imageUrl !== undefined) card.imageUrl = imageUrl;
      if (occludedRegions !== undefined) card.occludedRegions = occludedRegions;
      if (orderedItems !== undefined) card.orderedItems = orderedItems;
      if (multiSelectAnswers !== undefined) card.multiSelectAnswers = multiSelectAnswers;
      if (matchingPairs !== undefined) card.matchingPairs = matchingPairs;
      if (categories !== undefined) card.categories = categories;

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
