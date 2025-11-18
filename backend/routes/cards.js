/**
 * ============================================
 * Card Routes (Flashcards)
 * ============================================
 * Flashcard CRUD operations
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { Card, Course } = require('../models');
const { Op } = require('sequelize');

/**
 * @route   GET /api/cards
 * @desc    Get user's cards
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const { courseId, status, limit = 100 } = req.query;

    const where = { userId: req.user.id, isActive: true };

    if (courseId) {
      where.courseId = courseId;
    }

    if (status) {
      where.status = status;
    }

    const cards = await Card.findAll({
      where,
      limit: parseInt(limit),
      include: [{
        model: Course,
        as: 'course',
        attributes: ['id', 'title', 'icon', 'color']
      }],
      order: [['nextReviewDate', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        cards,
        count: cards.length
      }
    });
  } catch (error) {
    console.error('Get cards error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cards'
    });
  }
});

/**
 * @route   GET /api/cards/due
 * @desc    Get cards due for review
 * @access  Private
 */
router.get('/due', protect, async (req, res) => {
  try {
    const { courseId, limit = 20 } = req.query;

    const where = {
      userId: req.user.id,
      isActive: true,
      isSuspended: false,
      nextReviewDate: {
        [Op.lte]: new Date()
      }
    };

    if (courseId) {
      where.courseId = courseId;
    }

    const dueCards = await Card.findAll({
      where,
      limit: parseInt(limit),
      include: [{
        model: Course,
        as: 'course',
        attributes: ['id', 'title', 'icon', 'color']
      }],
      order: [['nextReviewDate', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        cards: dueCards,
        count: dueCards.length
      }
    });
  } catch (error) {
    console.error('Get due cards error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching due cards'
    });
  }
});

/**
 * @route   POST /api/cards
 * @desc    Create a new card
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
  try {
    const { question, answer, hint, courseId, cardType, options } = req.body;

    if (!question || !answer || !courseId) {
      return res.status(400).json({
        success: false,
        message: 'Question, answer, and courseId are required'
      });
    }

    const card = await Card.create({
      question,
      answer,
      hint,
      courseId,
      userId: req.user.id,
      cardType: cardType || 'basic',
      options: options || null
    });

    res.status(201).json({
      success: true,
      message: 'Card created successfully',
      data: {
        card
      }
    });
  } catch (error) {
    console.error('Create card error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating card'
    });
  }
});

/**
 * @route   PUT /api/cards/:id
 * @desc    Update a card
 * @access  Private
 */
router.put('/:id', protect, async (req, res) => {
  try {
    const card = await Card.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    const { question, answer, hint, options } = req.body;

    if (question !== undefined) card.question = question;
    if (answer !== undefined) card.answer = answer;
    if (hint !== undefined) card.hint = hint;
    if (options !== undefined) card.options = options;

    await card.save();

    res.json({
      success: true,
      message: 'Card updated successfully',
      data: {
        card
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating card'
    });
  }
});

/**
 * @route   DELETE /api/cards/:id
 * @desc    Delete a card (soft delete)
 * @access  Private
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const card = await Card.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    card.isActive = false;
    await card.save();

    res.json({
      success: true,
      message: 'Card deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting card'
    });
  }
});

module.exports = router;
