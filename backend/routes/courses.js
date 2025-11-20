/**
 * ============================================
 * Course Routes
 * ============================================
 * Course management and enrollment
 */

const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');
const { Course, UserCourse, Card } = require('../models');
const { Op } = require('sequelize');

/**
 * @route   GET /api/courses
 * @desc    Get all published courses
 * @access  Public
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, search, limit = 50 } = req.query;

    const where = { isPublished: true };

    if (category) {
      where.category = category;
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const courses = await Course.findAll({
      where,
      limit: parseInt(limit),
      order: [
        ['isFeatured', 'DESC'],
        ['enrollmentCount', 'DESC']
      ]
    });

    res.json({
      success: true,
      data: {
        courses,
        count: courses.length
      }
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses'
    });
  }
});

/**
 * @route   GET /api/courses/:id
 * @desc    Get single course by ID
 * @access  Public
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      data: {
        course
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching course'
    });
  }
});

/**
 * @route   POST /api/courses/:id/enroll
 * @desc    Enroll in a course
 * @access  Private
 */
router.post('/:id/enroll', protect, async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if already enrolled
    const existing = await UserCourse.findOne({
      where: {
        userId: req.user.id,
        courseId: course.id
      }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }

    // Create enrollment
    const enrollment = await UserCourse.create({
      userId: req.user.id,
      courseId: course.id
    });

    // Update enrollment count
    await course.increment('enrollmentCount');

    // Copy template cards from the course to this user
    // Find template cards for this course (cards with userId: null are templates)
    const templateCards = await Card.findAll({
      where: {
        courseId: course.id,
        userId: null
      }
    });

    // Create cards for the new user based on templates
    const newCards = [];
    for (const template of templateCards) {
      const cardData = {
        question: template.question,
        answer: template.answer,
        hint: template.hint,
        explanation: template.explanation,
        cardType: template.cardType,
        options: template.options,
        imageUrl: template.imageUrl,
        occludedRegions: template.occludedRegions,
        courseId: course.id,
        userId: req.user.id,
        status: 'new',
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReviewDate: new Date(),
        isActive: true,
        tags: template.tags
      };
      newCards.push(cardData);
    }

    // Bulk create all cards
    let cardsCreated = 0;
    if (newCards.length > 0) {
      const createdCards = await Card.bulkCreate(newCards);
      cardsCreated = createdCards.length;
    }

    res.status(201).json({
      success: true,
      message: `Enrolled successfully! ${cardsCreated} flashcards added to your study queue.`,
      data: {
        enrollment,
        cardsCreated
      }
    });
  } catch (error) {
    console.error('Enroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Error enrolling in course'
    });
  }
});

/**
 * @route   GET /api/courses/my/enrolled
 * @desc    Get user's enrolled courses
 * @access  Private
 */
router.get('/my/enrolled', protect, async (req, res) => {
  try {
    const enrollments = await UserCourse.findAll({
      where: {
        userId: req.user.id,
        isActive: true
      },
      include: [{
        model: Course,
        as: 'Course'
      }]
    });

    res.json({
      success: true,
      data: {
        enrollments,
        count: enrollments.length
      }
    });
  } catch (error) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching enrolled courses'
    });
  }
});

module.exports = router;
