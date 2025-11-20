const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { Op, fn, col } = require('sequelize');
const StudySession = require('../models/StudySession');
const StudyTask = require('../models/StudyTask');
const Course = require('../models/Course');
const User = require('../models/User');
const StudyGoal = require('../models/StudyGoal');

// Start a new pomodoro/timer session
router.post('/start', protect, async (req, res) => {
  try {
    const {
      courseId,
      taskId,
      timerMode,      // 'pomodoro', 'custom', 'focus'
      workDuration,   // in minutes
      breakDuration,  // in minutes
      title,
      description,
      focusMode
    } = req.body;

    // Validation
    if (!timerMode) {
      return res.status(400).json({ message: 'Timer mode is required' });
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

    // Verify task exists if provided
    if (taskId) {
      const task = await StudyTask.findOne({
        where: { id: taskId, userId: req.user.id }
      });
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
    }

    // Set default durations for pomodoro
    const finalWorkDuration = workDuration || (timerMode === 'pomodoro' ? 25 : 30);
    const finalBreakDuration = breakDuration || (timerMode === 'pomodoro' ? 5 : 10);

    // Create a study session
    const session = await StudySession.create({
      userId: req.user.id,
      courseId: courseId || null,
      title: title || `${timerMode.charAt(0).toUpperCase() + timerMode.slice(1)} Session`,
      description: description || null,
      sessionType: 'study',
      scheduledDate: new Date(),
      startTime: new Date(),
      duration: 0, // Will be updated when session completes
      isCompleted: false,
      notes: JSON.stringify({
        timerMode,
        workDuration: finalWorkDuration,
        breakDuration: finalBreakDuration,
        taskId: taskId || null,
        focusMode: focusMode || false,
        pomodorosCompleted: 0,
        currentPhase: 'work' // 'work' or 'break'
      })
    });

    res.status(201).json({
      session,
      timerSettings: {
        timerMode,
        workDuration: finalWorkDuration,
        breakDuration: finalBreakDuration,
        focusMode: focusMode || false
      }
    });
  } catch (error) {
    console.error('Error starting timer session:', error);
    res.status(500).json({ message: 'Error starting timer session', error: error.message });
  }
});

// Update timer session (log pomodoro completion, switch phases)
router.put('/:id/update', protect, async (req, res) => {
  try {
    const session = await StudySession.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const {
      pomodorosCompleted,
      currentPhase,
      cardsStudied,
      focusMode
    } = req.body;

    // Parse and update notes
    const notes = session.notes ? JSON.parse(session.notes) : {};

    if (pomodorosCompleted !== undefined) {
      notes.pomodorosCompleted = pomodorosCompleted;
    }

    if (currentPhase !== undefined) {
      notes.currentPhase = currentPhase;
    }

    if (focusMode !== undefined) {
      notes.focusMode = focusMode;
    }

    session.notes = JSON.stringify(notes);

    if (cardsStudied !== undefined) {
      session.cardsStudied = cardsStudied;
    }

    await session.save();

    res.json({ session, sessionData: notes });
  } catch (error) {
    console.error('Error updating timer session:', error);
    res.status(500).json({ message: 'Error updating timer session', error: error.message });
  }
});

// Complete a timer session
router.post('/:id/complete', protect, async (req, res) => {
  try {
    const session = await StudySession.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.isCompleted) {
      return res.status(400).json({ message: 'Session is already completed' });
    }

    const {
      cardsStudied,
      cardsCorrect,
      cardsIncorrect,
      pomodorosCompleted,
      actualDuration // in seconds
    } = req.body;

    const now = new Date();
    const startTime = new Date(session.startTime);
    const duration = actualDuration || Math.floor((now - startTime) / 1000);

    // Update session
    session.endTime = now;
    session.duration = duration;
    session.isCompleted = true;

    if (cardsStudied !== undefined) session.cardsStudied = cardsStudied;
    if (cardsCorrect !== undefined) session.cardsCorrect = cardsCorrect;
    if (cardsIncorrect !== undefined) session.cardsIncorrect = cardsIncorrect;

    if (cardsStudied > 0) {
      session.accuracy = ((cardsCorrect / cardsStudied) * 100).toFixed(2);
    }

    // Update notes with final pomodoros completed
    const notes = session.notes ? JSON.parse(session.notes) : {};
    if (pomodorosCompleted !== undefined) {
      notes.pomodorosCompleted = pomodorosCompleted;
    }
    session.notes = JSON.stringify(notes);

    await session.save();

    // Award XP and coins
    const baseXP = Math.floor(duration / 60) * 2; // 2 XP per minute
    const pomodoroBonus = pomodorosCompleted ? pomodorosCompleted * 10 : 0; // 10 XP per pomodoro
    const totalXP = baseXP + pomodoroBonus;
    const coins = Math.floor(duration / 60); // 1 coin per minute

    session.xpEarned = totalXP;
    session.coinsEarned = coins;
    await session.save();

    // Update user
    const user = await User.findByPk(req.user.id);
    user.experiencePoints += totalXP;
    user.coins += coins;

    // Update streak
    const today = new Date().toISOString().split('T')[0];
    const lastStudy = user.lastStudyDate ? new Date(user.lastStudyDate).toISOString().split('T')[0] : null;

    if (lastStudy !== today) {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      if (lastStudy === yesterday) {
        user.currentStreak += 1;
      } else if (lastStudy !== today) {
        user.currentStreak = 1;
      }

      if (user.currentStreak > user.longestStreak) {
        user.longestStreak = user.currentStreak;
      }

      user.lastStudyDate = today;
    }

    await user.save();

    // Update related goals (daily/weekly time goals)
    const studyMinutes = Math.floor(duration / 60);
    const activeGoals = await StudyGoal.findAll({
      where: {
        userId: req.user.id,
        isActive: true,
        isCompleted: false,
        goalType: {
          [Op.in]: ['daily_time', 'weekly_time']
        }
      }
    });

    const goalResults = [];
    for (const goal of activeGoals) {
      await goal.resetIfNeeded();
      const completed = await goal.updateProgress(studyMinutes);
      if (completed) {
        goalResults.push({
          goalId: goal.id,
          title: goal.title,
          xpReward: goal.xpReward,
          coinReward: goal.coinReward
        });

        // Award goal rewards
        user.experiencePoints += goal.xpReward;
        user.coins += goal.coinReward;
      }
    }

    if (goalResults.length > 0) {
      await user.save();
    }

    // Update linked task progress if applicable
    if (notes.taskId) {
      const task = await StudyTask.findOne({
        where: { id: notes.taskId, userId: req.user.id }
      });

      if (task && !task.isCompleted) {
        // Optionally mark task as in progress
        if (task.status === 'pending') {
          task.status = 'in_progress';
          await task.save();
        }
      }
    }

    res.json({
      session,
      rewards: {
        xp: totalXP,
        coins: coins,
        streak: user.currentStreak,
        goalsCompleted: goalResults
      },
      userData: {
        level: user.level,
        experiencePoints: user.experiencePoints,
        coins: user.coins,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak
      }
    });
  } catch (error) {
    console.error('Error completing timer session:', error);
    res.status(500).json({ message: 'Error completing timer session', error: error.message });
  }
});

// Cancel a timer session
router.post('/:id/cancel', protect, async (req, res) => {
  try {
    const session = await StudySession.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    session.isCancelled = true;
    await session.save();

    res.json({ message: 'Session cancelled', session });
  } catch (error) {
    console.error('Error cancelling timer session:', error);
    res.status(500).json({ message: 'Error cancelling timer session', error: error.message });
  }
});

// Get active timer session for user
router.get('/active', protect, async (req, res) => {
  try {
    const session = await StudySession.findOne({
      where: {
        userId: req.user.id,
        isCompleted: false,
        isCancelled: false
      },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'name', 'code', 'color']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 1
    });

    if (!session) {
      return res.json({ hasActiveSession: false, session: null });
    }

    const notes = session.notes ? JSON.parse(session.notes) : {};

    res.json({
      hasActiveSession: true,
      session,
      timerData: notes
    });
  } catch (error) {
    console.error('Error fetching active session:', error);
    res.status(500).json({ message: 'Error fetching active session', error: error.message });
  }
});

// Get session history (recent timer sessions)
router.get('/history', protect, async (req, res) => {
  try {
    const { limit, courseId } = req.query;
    const queryLimit = limit ? parseInt(limit) : 20;

    const whereClause = {
      userId: req.user.id,
      isCompleted: true
    };

    if (courseId) {
      whereClause.courseId = courseId;
    }

    const sessions = await StudySession.findAll({
      where: whereClause,
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'name', 'code', 'color']
        }
      ],
      order: [['scheduledDate', 'DESC'], ['createdAt', 'DESC']],
      limit: queryLimit
    });

    // Parse notes for each session
    const sessionsWithData = sessions.map(session => {
      const notes = session.notes ? JSON.parse(session.notes) : {};
      return {
        ...session.toJSON(),
        timerData: notes
      };
    });

    res.json(sessionsWithData);
  } catch (error) {
    console.error('Error fetching session history:', error);
    res.status(500).json({ message: 'Error fetching session history', error: error.message });
  }
});

// Get timer statistics
router.get('/stats', protect, async (req, res) => {
  try {
    const { period } = req.query; // 'today', 'week', 'month', 'all'
    let startDate;

    const now = new Date();
    switch (period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0);
    }

    const sessions = await StudySession.findAll({
      where: {
        userId: req.user.id,
        scheduledDate: { [Op.gte]: startDate },
        isCompleted: true
      }
    });

    let totalSeconds = 0;
    let totalPomodoros = 0;
    let totalSessions = sessions.length;

    sessions.forEach(session => {
      totalSeconds += session.duration || 0;
      const notes = session.notes ? JSON.parse(session.notes) : {};
      totalPomodoros += notes.pomodorosCompleted || 0;
    });

    const totalMinutes = Math.round(totalSeconds / 60);
    const averageSessionMinutes = totalSessions > 0 ? Math.round(totalSeconds / totalSessions / 60) : 0;

    res.json({
      totalSessions,
      totalMinutes,
      totalHours: (totalSeconds / 3600).toFixed(1),
      totalPomodoros,
      averageSessionMinutes,
      period
    });
  } catch (error) {
    console.error('Error fetching timer statistics:', error);
    res.status(500).json({ message: 'Error fetching timer statistics', error: error.message });
  }
});

module.exports = router;
