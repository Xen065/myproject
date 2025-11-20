/**
 * ============================================
 * Calendar Integration Routes
 * ============================================
 * Unified calendar view with tasks, exams, and study sessions
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { StudyTask, ExamReminder, StudySession } = require('../models');
const { Op } = require('sequelize');

/**
 * @route   GET /api/calendar/events
 * @desc    Get all calendar events (tasks, exams, sessions) for a date range
 * @access  Private
 */
router.get('/events', protect, async (req, res) => {
  try {
    const { fromDate, toDate, month, year } = req.query;

    let startDate, endDate;

    // If month and year provided, get all events for that month
    if (month && year) {
      startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
    } else if (fromDate && toDate) {
      startDate = new Date(fromDate);
      endDate = new Date(toDate);
    } else {
      // Default to current month
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }

    // Fetch tasks with due dates
    const tasks = await StudyTask.findAll({
      where: {
        userId: req.user.id,
        dueDate: {
          [Op.between]: [startDate, endDate]
        }
      }
    });

    // Fetch exam reminders
    const exams = await ExamReminder.findAll({
      where: {
        userId: req.user.id,
        examDate: {
          [Op.between]: [startDate, endDate]
        },
        isActive: true
      }
    });

    // Fetch scheduled study sessions
    const sessions = await StudySession.findAll({
      where: {
        userId: req.user.id,
        scheduledDate: {
          [Op.between]: [startDate, endDate]
        }
      }
    });

    // Transform to unified calendar event format
    const events = [
      ...tasks.map(task => ({
        id: `task-${task.id}`,
        type: 'task',
        title: task.title,
        date: task.dueDate,
        description: task.description,
        priority: task.priority,
        status: task.status,
        isCompleted: task.isCompleted,
        color: getPriorityColor(task.priority),
        courseId: task.courseId,
        data: task
      })),
      ...exams.map(exam => ({
        id: `exam-${exam.id}`,
        type: 'exam',
        title: exam.examTitle,
        date: exam.examDate,
        time: exam.examTime,
        description: exam.description,
        examType: exam.examType,
        location: exam.location,
        duration: exam.duration,
        color: exam.color || '#f5576c',
        courseId: exam.courseId,
        data: exam
      })),
      ...sessions.map(session => ({
        id: `session-${session.id}`,
        type: 'session',
        title: session.title,
        date: session.scheduledDate,
        startTime: session.startTime,
        endTime: session.endTime,
        description: session.description,
        sessionType: session.sessionType,
        isCompleted: session.isCompleted,
        color: '#10B981',
        courseId: session.courseId,
        data: session
      }))
    ];

    // Sort by date
    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      success: true,
      data: {
        events,
        count: events.length,
        dateRange: {
          start: startDate,
          end: endDate
        }
      }
    });
  } catch (error) {
    console.error('Get calendar events error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching calendar events'
    });
  }
});

/**
 * @route   GET /api/calendar/events/day/:date
 * @desc    Get all events for a specific day
 * @access  Private
 */
router.get('/events/day/:date', protect, async (req, res) => {
  try {
    const requestedDate = new Date(req.params.date);
    const startOfDay = new Date(requestedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(requestedDate.setHours(23, 59, 59, 999));

    // Fetch tasks for this day
    const tasks = await StudyTask.findAll({
      where: {
        userId: req.user.id,
        dueDate: {
          [Op.between]: [startOfDay, endOfDay]
        }
      }
    });

    // Fetch exams for this day
    const exams = await ExamReminder.findAll({
      where: {
        userId: req.user.id,
        examDate: {
          [Op.between]: [startOfDay, endOfDay]
        },
        isActive: true
      }
    });

    // Fetch sessions for this day
    const sessions = await StudySession.findAll({
      where: {
        userId: req.user.id,
        scheduledDate: {
          [Op.between]: [startOfDay, endOfDay]
        }
      }
    });

    const events = [
      ...tasks.map(task => ({
        id: `task-${task.id}`,
        type: 'task',
        title: task.title,
        date: task.dueDate,
        description: task.description,
        priority: task.priority,
        status: task.status,
        isCompleted: task.isCompleted,
        color: getPriorityColor(task.priority),
        data: task
      })),
      ...exams.map(exam => ({
        id: `exam-${exam.id}`,
        type: 'exam',
        title: exam.examTitle,
        date: exam.examDate,
        time: exam.examTime,
        description: exam.description,
        examType: exam.examType,
        location: exam.location,
        color: exam.color || '#f5576c',
        data: exam
      })),
      ...sessions.map(session => ({
        id: `session-${session.id}`,
        type: 'session',
        title: session.title,
        date: session.scheduledDate,
        startTime: session.startTime,
        endTime: session.endTime,
        description: session.description,
        isCompleted: session.isCompleted,
        color: '#10B981',
        data: session
      }))
    ];

    res.json({
      success: true,
      data: {
        date: req.params.date,
        events,
        count: events.length
      }
    });
  } catch (error) {
    console.error('Get day events error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching day events'
    });
  }
});

/**
 * @route   GET /api/calendar/summary
 * @desc    Get calendar summary (upcoming events, overdue tasks, etc.)
 * @access  Private
 */
router.get('/summary', protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    // Overdue tasks
    const overdueTasks = await StudyTask.findAll({
      where: {
        userId: req.user.id,
        dueDate: {
          [Op.lt]: today
        },
        isCompleted: false
      }
    });

    // Today's tasks
    const todayTasks = await StudyTask.findAll({
      where: {
        userId: req.user.id,
        dueDate: {
          [Op.between]: [today, tomorrow]
        }
      }
    });

    // Upcoming exams (next 7 days)
    const upcomingExams = await ExamReminder.findAll({
      where: {
        userId: req.user.id,
        examDate: {
          [Op.between]: [today, nextWeek]
        },
        isActive: true,
        isPassed: false
      },
      order: [['examDate', 'ASC']]
    });

    // Pending tasks count
    const pendingTasksCount = await StudyTask.count({
      where: {
        userId: req.user.id,
        isCompleted: false
      }
    });

    res.json({
      success: true,
      data: {
        overdueTasks: {
          count: overdueTasks.length,
          tasks: overdueTasks
        },
        todayTasks: {
          count: todayTasks.length,
          tasks: todayTasks
        },
        upcomingExams: {
          count: upcomingExams.length,
          exams: upcomingExams
        },
        pendingTasksCount
      }
    });
  } catch (error) {
    console.error('Get calendar summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching calendar summary'
    });
  }
});

// Helper function to get color based on priority
function getPriorityColor(priority) {
  switch (priority) {
    case 'urgent':
      return '#dc2626'; // red
    case 'high':
      return '#f59e0b'; // orange
    case 'medium':
      return '#3b82f6'; // blue
    case 'low':
      return '#6b7280'; // gray
    default:
      return '#3b82f6';
  }
}

module.exports = router;
