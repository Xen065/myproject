/**
 * ============================================
 * Study Tasks (Todo List) Routes
 * ============================================
 * Manage study tasks integrated with calendar
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { StudyTask, Course } = require('../models');
const { Op } = require('sequelize');

/**
 * @route   GET /api/study/tasks
 * @desc    Get all tasks for current user
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const { status, courseId, priority, fromDate, toDate } = req.query;

    const whereClause = { userId: req.user.id };

    if (status) whereClause.status = status;
    if (courseId) whereClause.courseId = courseId;
    if (priority) whereClause.priority = priority;

    if (fromDate || toDate) {
      whereClause.dueDate = {};
      if (fromDate) whereClause.dueDate[Op.gte] = new Date(fromDate);
      if (toDate) whereClause.dueDate[Op.lte] = new Date(toDate);
    }

    const tasks = await StudyTask.findAll({
      where: whereClause,
      order: [
        ['dueDate', 'ASC'],
        ['priority', 'DESC'],
        ['createdAt', 'DESC']
      ]
    });

    res.json({
      success: true,
      data: {
        tasks,
        count: tasks.length
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks'
    });
  }
});

/**
 * @route   GET /api/study/tasks/:id
 * @desc    Get single task
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const task = await StudyTask.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: { task }
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching task'
    });
  }
});

/**
 * @route   POST /api/study/tasks
 * @desc    Create a new task
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
  try {
    const {
      courseId,
      title,
      description,
      dueDate,
      priority,
      estimatedDuration,
      tags,
      linkedToCalendar,
      reminderEnabled,
      reminderDate,
      notes
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    const task = await StudyTask.create({
      userId: req.user.id,
      courseId: courseId || null,
      title,
      description,
      dueDate: dueDate || null,
      priority: priority || 'medium',
      estimatedDuration: estimatedDuration || null,
      tags: tags || [],
      linkedToCalendar: linkedToCalendar || false,
      reminderEnabled: reminderEnabled || false,
      reminderDate: reminderDate || null,
      notes: notes || null
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task }
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating task'
    });
  }
});

/**
 * @route   PUT /api/study/tasks/:id
 * @desc    Update a task
 * @access  Private
 */
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await StudyTask.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const {
      courseId,
      title,
      description,
      dueDate,
      priority,
      status,
      isCompleted,
      estimatedDuration,
      tags,
      linkedToCalendar,
      reminderEnabled,
      reminderDate,
      notes
    } = req.body;

    // Update fields
    if (courseId !== undefined) task.courseId = courseId;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (priority !== undefined) task.priority = priority;
    if (status !== undefined) task.status = status;
    if (estimatedDuration !== undefined) task.estimatedDuration = estimatedDuration;
    if (tags !== undefined) task.tags = tags;
    if (linkedToCalendar !== undefined) task.linkedToCalendar = linkedToCalendar;
    if (reminderEnabled !== undefined) task.reminderEnabled = reminderEnabled;
    if (reminderDate !== undefined) task.reminderDate = reminderDate;
    if (notes !== undefined) task.notes = notes;

    // Handle completion
    if (isCompleted !== undefined) {
      task.isCompleted = isCompleted;
      if (isCompleted) {
        task.completedAt = new Date();
        task.status = 'completed';
      } else {
        task.completedAt = null;
      }
    }

    await task.save();

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: { task }
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating task'
    });
  }
});

/**
 * @route   DELETE /api/study/tasks/:id
 * @desc    Delete a task
 * @access  Private
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await StudyTask.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    await task.destroy();

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting task'
    });
  }
});

/**
 * @route   POST /api/study/tasks/:id/complete
 * @desc    Mark task as complete
 * @access  Private
 */
router.post('/:id/complete', protect, async (req, res) => {
  try {
    const task = await StudyTask.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    task.isCompleted = true;
    task.completedAt = new Date();
    task.status = 'completed';
    await task.save();

    res.json({
      success: true,
      message: 'Task marked as complete',
      data: { task }
    });
  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing task'
    });
  }
});

module.exports = router;
