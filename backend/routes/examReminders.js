/**
 * ============================================
 * Exam Reminders Routes
 * ============================================
 * Manage exam reminders integrated with calendar
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { ExamReminder, Course } = require('../models');
const { Op } = require('sequelize');

/**
 * @route   GET /api/study/exams
 * @desc    Get all exam reminders for current user
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const { courseId, fromDate, toDate, isActive, isPassed } = req.query;

    const whereClause = { userId: req.user.id };

    if (courseId) whereClause.courseId = courseId;
    if (isActive !== undefined) whereClause.isActive = isActive === 'true';
    if (isPassed !== undefined) whereClause.isPassed = isPassed === 'true';

    if (fromDate || toDate) {
      whereClause.examDate = {};
      if (fromDate) whereClause.examDate[Op.gte] = new Date(fromDate);
      if (toDate) whereClause.examDate[Op.lte] = new Date(toDate);
    }

    const exams = await ExamReminder.findAll({
      where: whereClause,
      order: [['examDate', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        exams,
        count: exams.length
      }
    });
  } catch (error) {
    console.error('Get exam reminders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching exam reminders'
    });
  }
});

/**
 * @route   GET /api/study/exams/upcoming
 * @desc    Get upcoming exams (next 30 days)
 * @access  Private
 */
router.get('/upcoming', protect, async (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const exams = await ExamReminder.findAll({
      where: {
        userId: req.user.id,
        examDate: {
          [Op.between]: [today, thirtyDaysFromNow]
        },
        isActive: true,
        isPassed: false
      },
      order: [['examDate', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        exams,
        count: exams.length
      }
    });
  } catch (error) {
    console.error('Get upcoming exams error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching upcoming exams'
    });
  }
});

/**
 * @route   GET /api/study/exams/:id
 * @desc    Get single exam reminder
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const exam = await ExamReminder.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam reminder not found'
      });
    }

    res.json({
      success: true,
      data: { exam }
    });
  } catch (error) {
    console.error('Get exam reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching exam reminder'
    });
  }
});

/**
 * @route   POST /api/study/exams
 * @desc    Create a new exam reminder
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
  try {
    const {
      courseId,
      examTitle,
      examDate,
      examTime,
      location,
      description,
      examType,
      duration,
      reminderDays,
      notes,
      color,
      notificationEnabled
    } = req.body;

    if (!examTitle || !examDate) {
      return res.status(400).json({
        success: false,
        message: 'Exam title and date are required'
      });
    }

    const exam = await ExamReminder.create({
      userId: req.user.id,
      courseId: courseId || null,
      examTitle,
      examDate,
      examTime: examTime || null,
      location: location || null,
      description: description || null,
      examType: examType || 'test',
      duration: duration || null,
      reminderDays: reminderDays || [1, 7],
      notes: notes || null,
      color: color || '#f5576c',
      notificationEnabled: notificationEnabled !== false
    });

    res.status(201).json({
      success: true,
      message: 'Exam reminder created successfully',
      data: { exam }
    });
  } catch (error) {
    console.error('Create exam reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating exam reminder'
    });
  }
});

/**
 * @route   PUT /api/study/exams/:id
 * @desc    Update an exam reminder
 * @access  Private
 */
router.put('/:id', protect, async (req, res) => {
  try {
    const exam = await ExamReminder.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam reminder not found'
      });
    }

    const {
      courseId,
      examTitle,
      examDate,
      examTime,
      location,
      description,
      examType,
      duration,
      reminderDays,
      isActive,
      isPassed,
      notes,
      color,
      notificationEnabled
    } = req.body;

    // Update fields
    if (courseId !== undefined) exam.courseId = courseId;
    if (examTitle !== undefined) exam.examTitle = examTitle;
    if (examDate !== undefined) exam.examDate = examDate;
    if (examTime !== undefined) exam.examTime = examTime;
    if (location !== undefined) exam.location = location;
    if (description !== undefined) exam.description = description;
    if (examType !== undefined) exam.examType = examType;
    if (duration !== undefined) exam.duration = duration;
    if (reminderDays !== undefined) exam.reminderDays = reminderDays;
    if (isActive !== undefined) exam.isActive = isActive;
    if (isPassed !== undefined) exam.isPassed = isPassed;
    if (notes !== undefined) exam.notes = notes;
    if (color !== undefined) exam.color = color;
    if (notificationEnabled !== undefined) exam.notificationEnabled = notificationEnabled;

    await exam.save();

    res.json({
      success: true,
      message: 'Exam reminder updated successfully',
      data: { exam }
    });
  } catch (error) {
    console.error('Update exam reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating exam reminder'
    });
  }
});

/**
 * @route   DELETE /api/study/exams/:id
 * @desc    Delete an exam reminder
 * @access  Private
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const exam = await ExamReminder.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam reminder not found'
      });
    }

    await exam.destroy();

    res.json({
      success: true,
      message: 'Exam reminder deleted successfully'
    });
  } catch (error) {
    console.error('Delete exam reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting exam reminder'
    });
  }
});

/**
 * @route   POST /api/study/exams/:id/mark-passed
 * @desc    Mark exam as passed
 * @access  Private
 */
router.post('/:id/mark-passed', protect, async (req, res) => {
  try {
    const exam = await ExamReminder.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam reminder not found'
      });
    }

    exam.isPassed = true;
    await exam.save();

    res.json({
      success: true,
      message: 'Exam marked as passed',
      data: { exam }
    });
  } catch (error) {
    console.error('Mark exam passed error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking exam as passed'
    });
  }
});

module.exports = router;
