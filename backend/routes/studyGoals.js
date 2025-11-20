const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const StudyGoal = require('../models/StudyGoal');
const Course = require('../models/Course');
const User = require('../models/User');
const { Op } = require('sequelize');

// Get all goals for the authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    const {
      goalType,
      isCompleted,
      isActive,
      courseId,
      includeRecurring
    } = req.query;

    const whereClause = { userId: req.user.id };

    if (goalType) {
      whereClause.goalType = goalType;
    }

    if (isCompleted !== undefined) {
      whereClause.isCompleted = isCompleted === 'true';
    }

    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }

    if (courseId) {
      whereClause.courseId = courseId;
    }

    const goals = await StudyGoal.findAll({
      where: whereClause,
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'name', 'code', 'color']
        }
      ],
      order: [
        ['isCompleted', 'ASC'],
        ['priority', 'DESC'],
        ['deadline', 'ASC'],
        ['createdAt', 'DESC']
      ]
    });

    // Reset recurring goals if needed
    for (const goal of goals) {
      await goal.resetIfNeeded();
    }

    res.json(goals);
  } catch (error) {
    console.error('Error fetching study goals:', error);
    res.status(500).json({ message: 'Error fetching study goals', error: error.message });
  }
});

// Get a single goal by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const goal = await StudyGoal.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'name', 'code', 'color']
        }
      ]
    });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // Reset if needed before returning
    await goal.resetIfNeeded();

    res.json(goal);
  } catch (error) {
    console.error('Error fetching study goal:', error);
    res.status(500).json({ message: 'Error fetching study goal', error: error.message });
  }
});

// Create a new study goal
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      courseId,
      title,
      description,
      goalType,
      targetValue,
      unit,
      startDate,
      deadline,
      isRecurring,
      recurringPeriod,
      priority,
      color,
      icon,
      xpReward,
      coinReward,
      milestones,
      reminderEnabled,
      reminderTime,
      notes
    } = req.body;

    // Validation
    if (!title || !goalType || !targetValue) {
      return res.status(400).json({
        message: 'Title, goal type, and target value are required'
      });
    }

    if (targetValue <= 0) {
      return res.status(400).json({
        message: 'Target value must be greater than 0'
      });
    }

    // Verify course exists if provided
    if (courseId) {
      const course = await Course.findOne({
        where: { id: courseId, userId: req.user.id }
      });

      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
    }

    const goal = await StudyGoal.create({
      userId: req.user.id,
      courseId: courseId || null,
      title,
      description,
      goalType,
      targetValue,
      currentProgress: 0,
      unit: unit || 'units',
      startDate: startDate || new Date().toISOString().split('T')[0],
      deadline: deadline || null,
      isRecurring: isRecurring || false,
      recurringPeriod: recurringPeriod || null,
      lastResetDate: isRecurring ? new Date().toISOString().split('T')[0] : null,
      priority: priority || 'medium',
      color: color || '#3b82f6',
      icon: icon || '🎯',
      xpReward: xpReward || 0,
      coinReward: coinReward || 0,
      milestones: milestones || null,
      reminderEnabled: reminderEnabled || false,
      reminderTime: reminderTime || null,
      notes: notes || null
    });

    const createdGoal = await StudyGoal.findByPk(goal.id, {
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'name', 'code', 'color']
        }
      ]
    });

    res.status(201).json(createdGoal);
  } catch (error) {
    console.error('Error creating study goal:', error);
    res.status(500).json({ message: 'Error creating study goal', error: error.message });
  }
});

// Update a study goal
router.put('/:id', authenticate, async (req, res) => {
  try {
    const goal = await StudyGoal.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    const {
      courseId,
      title,
      description,
      goalType,
      targetValue,
      currentProgress,
      unit,
      startDate,
      deadline,
      isActive,
      isRecurring,
      recurringPeriod,
      priority,
      color,
      icon,
      xpReward,
      coinReward,
      milestones,
      reminderEnabled,
      reminderTime,
      notes
    } = req.body;

    // Verify course exists if provided
    if (courseId !== undefined && courseId !== null) {
      const course = await Course.findOne({
        where: { id: courseId, userId: req.user.id }
      });

      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
    }

    // Update fields
    if (courseId !== undefined) goal.courseId = courseId;
    if (title !== undefined) goal.title = title;
    if (description !== undefined) goal.description = description;
    if (goalType !== undefined) goal.goalType = goalType;
    if (targetValue !== undefined) goal.targetValue = targetValue;
    if (currentProgress !== undefined) goal.currentProgress = currentProgress;
    if (unit !== undefined) goal.unit = unit;
    if (startDate !== undefined) goal.startDate = startDate;
    if (deadline !== undefined) goal.deadline = deadline;
    if (isActive !== undefined) goal.isActive = isActive;
    if (isRecurring !== undefined) goal.isRecurring = isRecurring;
    if (recurringPeriod !== undefined) goal.recurringPeriod = recurringPeriod;
    if (priority !== undefined) goal.priority = priority;
    if (color !== undefined) goal.color = color;
    if (icon !== undefined) goal.icon = icon;
    if (xpReward !== undefined) goal.xpReward = xpReward;
    if (coinReward !== undefined) goal.coinReward = coinReward;
    if (milestones !== undefined) goal.milestones = milestones;
    if (reminderEnabled !== undefined) goal.reminderEnabled = reminderEnabled;
    if (reminderTime !== undefined) goal.reminderTime = reminderTime;
    if (notes !== undefined) goal.notes = notes;

    await goal.save();

    // Check if goal is completed
    const completed = await goal.checkCompletion();

    // Award XP and coins if goal just completed
    if (completed && goal.xpReward > 0) {
      const user = await User.findByPk(req.user.id);
      user.experiencePoints += goal.xpReward;
      user.coins += goal.coinReward;
      await user.save();
    }

    const updatedGoal = await StudyGoal.findByPk(goal.id, {
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'name', 'code', 'color']
        }
      ]
    });

    res.json({
      goal: updatedGoal,
      completed,
      rewardsEarned: completed ? {
        xp: goal.xpReward,
        coins: goal.coinReward
      } : null
    });
  } catch (error) {
    console.error('Error updating study goal:', error);
    res.status(500).json({ message: 'Error updating study goal', error: error.message });
  }
});

// Update goal progress
router.post('/:id/progress', authenticate, async (req, res) => {
  try {
    const { increment } = req.body;

    if (increment === undefined || increment === null) {
      return res.status(400).json({ message: 'Progress increment is required' });
    }

    const goal = await StudyGoal.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // Reset if needed first
    await goal.resetIfNeeded();

    // Update progress
    const completed = await goal.updateProgress(increment);

    // Award XP and coins if goal just completed
    if (completed && goal.xpReward > 0) {
      const user = await User.findByPk(req.user.id);
      user.experiencePoints += goal.xpReward;
      user.coins += goal.coinReward;
      await user.save();
    }

    const updatedGoal = await StudyGoal.findByPk(goal.id, {
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'name', 'code', 'color']
        }
      ]
    });

    res.json({
      goal: updatedGoal,
      completed,
      rewardsEarned: completed ? {
        xp: goal.xpReward,
        coins: goal.coinReward
      } : null
    });
  } catch (error) {
    console.error('Error updating goal progress:', error);
    res.status(500).json({ message: 'Error updating goal progress', error: error.message });
  }
});

// Mark goal as completed
router.post('/:id/complete', authenticate, async (req, res) => {
  try {
    const goal = await StudyGoal.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    if (goal.isCompleted) {
      return res.status(400).json({ message: 'Goal is already completed' });
    }

    goal.isCompleted = true;
    goal.completedAt = new Date();
    goal.currentProgress = goal.targetValue; // Set to 100%
    await goal.save();

    // Award XP and coins
    if (goal.xpReward > 0 || goal.coinReward > 0) {
      const user = await User.findByPk(req.user.id);
      user.experiencePoints += goal.xpReward;
      user.coins += goal.coinReward;
      await user.save();
    }

    const updatedGoal = await StudyGoal.findByPk(goal.id, {
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'name', 'code', 'color']
        }
      ]
    });

    res.json({
      goal: updatedGoal,
      rewardsEarned: {
        xp: goal.xpReward,
        coins: goal.coinReward
      }
    });
  } catch (error) {
    console.error('Error completing study goal:', error);
    res.status(500).json({ message: 'Error completing study goal', error: error.message });
  }
});

// Delete a study goal
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const goal = await StudyGoal.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    await goal.destroy();

    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Error deleting study goal:', error);
    res.status(500).json({ message: 'Error deleting study goal', error: error.message });
  }
});

// Get goal statistics
router.get('/stats/summary', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const [totalGoals, completedGoals, activeGoals, overdue] = await Promise.all([
      StudyGoal.count({ where: { userId } }),
      StudyGoal.count({ where: { userId, isCompleted: true } }),
      StudyGoal.count({ where: { userId, isActive: true, isCompleted: false } }),
      StudyGoal.count({
        where: {
          userId,
          isCompleted: false,
          isActive: true,
          deadline: {
            [Op.lt]: new Date().toISOString().split('T')[0]
          }
        }
      })
    ]);

    const completionRate = totalGoals > 0 ? (completedGoals / totalGoals * 100).toFixed(1) : 0;

    // Get goals expiring soon (next 7 days)
    const expiringSoon = await StudyGoal.count({
      where: {
        userId,
        isCompleted: false,
        isActive: true,
        deadline: {
          [Op.between]: [
            new Date().toISOString().split('T')[0],
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          ]
        }
      }
    });

    res.json({
      totalGoals,
      completedGoals,
      activeGoals,
      overdue,
      expiringSoon,
      completionRate: parseFloat(completionRate)
    });
  } catch (error) {
    console.error('Error fetching goal statistics:', error);
    res.status(500).json({ message: 'Error fetching goal statistics', error: error.message });
  }
});

module.exports = router;
