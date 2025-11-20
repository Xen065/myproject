const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { Op, fn, col, literal } = require('sequelize');
const sequelize = require('../config/database');
const StudySession = require('../models/StudySession');
const Card = require('../models/Card');
const Course = require('../models/Course');
const StudyTask = require('../models/StudyTask');
const ExamReminder = require('../models/ExamReminder');
const User = require('../models/User');

// Get study heatmap data (GitHub-style)
router.get('/heatmap', authenticate, async (req, res) => {
  try {
    const { year, months } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31);

    // Get all study sessions for the year
    const sessions = await StudySession.findAll({
      where: {
        userId: req.user.id,
        scheduledDate: {
          [Op.between]: [startDate, endDate]
        },
        isCompleted: true
      },
      attributes: [
        [fn('DATE', col('scheduled_date')), 'date'],
        [fn('SUM', col('duration')), 'totalSeconds'],
        [fn('COUNT', col('id')), 'sessionCount']
      ],
      group: [fn('DATE', col('scheduled_date'))],
      raw: true
    });

    // Format data for heatmap
    const heatmapData = sessions.map(session => ({
      date: session.date,
      minutes: Math.round(session.totalSeconds / 60),
      sessionCount: parseInt(session.sessionCount)
    }));

    res.json(heatmapData);
  } catch (error) {
    console.error('Error fetching heatmap data:', error);
    res.status(500).json({ message: 'Error fetching heatmap data', error: error.message });
  }
});

// Get course performance breakdown
router.get('/courses/performance', authenticate, async (req, res) => {
  try {
    const courses = await Course.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Card,
          as: 'cards',
          attributes: []
        },
        {
          model: StudySession,
          as: 'studySessions',
          attributes: [],
          where: { isCompleted: true },
          required: false
        }
      ],
      attributes: [
        'id',
        'name',
        'code',
        'color',
        [fn('COUNT', fn('DISTINCT', col('cards.id'))), 'totalCards'],
        [fn('COUNT', fn('DISTINCT', literal('CASE WHEN cards.status = \'mastered\' THEN cards.id END'))), 'masteredCards'],
        [fn('SUM', col('studySessions.duration')), 'totalStudySeconds'],
        [fn('AVG', col('studySessions.accuracy')), 'averageAccuracy']
      ],
      group: ['Course.id'],
      raw: true
    });

    const performanceData = courses.map(course => ({
      id: course.id,
      name: course.name,
      code: course.code,
      color: course.color,
      totalCards: parseInt(course.totalCards) || 0,
      masteredCards: parseInt(course.masteredCards) || 0,
      masteryRate: course.totalCards > 0 ? ((course.masteredCards / course.totalCards) * 100).toFixed(1) : 0,
      totalMinutes: course.totalStudySeconds ? Math.round(course.totalStudySeconds / 60) : 0,
      averageAccuracy: course.averageAccuracy ? parseFloat(course.averageAccuracy).toFixed(1) : 0
    }));

    res.json(performanceData);
  } catch (error) {
    console.error('Error fetching course performance:', error);
    res.status(500).json({ message: 'Error fetching course performance', error: error.message });
  }
});

// Get study time statistics
router.get('/time/stats', authenticate, async (req, res) => {
  try {
    const { period } = req.query; // 'week', 'month', 'year', 'all'
    let startDate;

    const now = new Date();
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0); // All time
    }

    const sessions = await StudySession.findAll({
      where: {
        userId: req.user.id,
        scheduledDate: { [Op.gte]: startDate },
        isCompleted: true
      },
      attributes: [
        [fn('SUM', col('duration')), 'totalSeconds'],
        [fn('COUNT', col('id')), 'sessionCount'],
        [fn('AVG', col('duration')), 'averageSessionSeconds'],
        [fn('SUM', col('cards_studied')), 'totalCards']
      ],
      raw: true
    });

    const stats = sessions[0] || {};

    res.json({
      totalMinutes: stats.totalSeconds ? Math.round(stats.totalSeconds / 60) : 0,
      totalHours: stats.totalSeconds ? (stats.totalSeconds / 3600).toFixed(1) : 0,
      sessionCount: parseInt(stats.sessionCount) || 0,
      averageSessionMinutes: stats.averageSessionSeconds ? Math.round(stats.averageSessionSeconds / 60) : 0,
      totalCards: parseInt(stats.totalCards) || 0,
      period
    });
  } catch (error) {
    console.error('Error fetching time statistics:', error);
    res.status(500).json({ message: 'Error fetching time statistics', error: error.message });
  }
});

// Get daily study time for a period (for charts)
router.get('/time/daily', authenticate, async (req, res) => {
  try {
    const { days } = req.query; // Number of days to look back
    const daysBack = days ? parseInt(days) : 30;
    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

    const sessions = await StudySession.findAll({
      where: {
        userId: req.user.id,
        scheduledDate: { [Op.gte]: startDate },
        isCompleted: true
      },
      attributes: [
        [fn('DATE', col('scheduled_date')), 'date'],
        [fn('SUM', col('duration')), 'totalSeconds'],
        [fn('COUNT', col('id')), 'sessionCount']
      ],
      group: [fn('DATE', col('scheduled_date'))],
      order: [[fn('DATE', col('scheduled_date')), 'ASC']],
      raw: true
    });

    const dailyData = sessions.map(session => ({
      date: session.date,
      minutes: Math.round(session.totalSeconds / 60),
      hours: (session.totalSeconds / 3600).toFixed(2),
      sessionCount: parseInt(session.sessionCount)
    }));

    res.json(dailyData);
  } catch (error) {
    console.error('Error fetching daily time data:', error);
    res.status(500).json({ message: 'Error fetching daily time data', error: error.message });
  }
});

// Get study time per course (pie chart data)
router.get('/time/by-course', authenticate, async (req, res) => {
  try {
    const { period } = req.query;
    let startDate;

    const now = new Date();
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0);
    }

    const courseTime = await StudySession.findAll({
      where: {
        userId: req.user.id,
        scheduledDate: { [Op.gte]: startDate },
        isCompleted: true
      },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'name', 'code', 'color']
        }
      ],
      attributes: [
        'courseId',
        [fn('SUM', col('duration')), 'totalSeconds']
      ],
      group: ['courseId', 'course.id', 'course.name', 'course.code', 'course.color'],
      raw: true,
      nest: true
    });

    const data = courseTime.map(item => ({
      courseId: item.courseId,
      courseName: item.course.name,
      courseCode: item.course.code,
      color: item.course.color,
      minutes: Math.round(item.totalSeconds / 60),
      hours: (item.totalSeconds / 3600).toFixed(2)
    }));

    res.json(data);
  } catch (error) {
    console.error('Error fetching course time data:', error);
    res.status(500).json({ message: 'Error fetching course time data', error: error.message });
  }
});

// Get flashcard mastery rate over time
router.get('/cards/mastery-trend', authenticate, async (req, res) => {
  try {
    const { months } = req.query;
    const monthsBack = months ? parseInt(months) : 6;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsBack);

    // Get card counts by status for each month
    const cards = await Card.findAll({
      where: { userId: req.user.id },
      attributes: [
        [fn('DATE_TRUNC', 'month', col('updated_at')), 'month'],
        'status',
        [fn('COUNT', col('id')), 'count']
      ],
      group: [fn('DATE_TRUNC', 'month', col('updated_at')), 'status'],
      order: [[fn('DATE_TRUNC', 'month', col('updated_at')), 'ASC']],
      raw: true
    });

    // Organize by month
    const monthlyData = {};
    cards.forEach(card => {
      const monthKey = new Date(card.month).toISOString().split('T')[0].substring(0, 7);
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { new: 0, learning: 0, reviewing: 0, mastered: 0 };
      }
      monthlyData[monthKey][card.status] = parseInt(card.count);
    });

    const trendData = Object.keys(monthlyData).map(month => {
      const data = monthlyData[month];
      const total = data.new + data.learning + data.reviewing + data.mastered;
      return {
        month,
        ...data,
        total,
        masteryRate: total > 0 ? ((data.mastered / total) * 100).toFixed(1) : 0
      };
    });

    res.json(trendData);
  } catch (error) {
    console.error('Error fetching mastery trend:', error);
    res.status(500).json({ message: 'Error fetching mastery trend', error: error.message });
  }
});

// Get upcoming workload (next 7 or 30 days)
router.get('/workload/upcoming', authenticate, async (req, res) => {
  try {
    const { days } = req.query;
    const daysAhead = days ? parseInt(days) : 7;
    const endDate = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);

    const [dueTasks, upcomingExams, dueCards] = await Promise.all([
      StudyTask.count({
        where: {
          userId: req.user.id,
          isCompleted: false,
          dueDate: {
            [Op.lte]: endDate
          }
        }
      }),
      ExamReminder.count({
        where: {
          userId: req.user.id,
          examDate: {
            [Op.between]: [new Date(), endDate]
          },
          isPassed: false,
          isActive: true
        }
      }),
      Card.count({
        where: {
          userId: req.user.id,
          nextReviewDate: {
            [Op.lte]: endDate
          },
          status: {
            [Op.in]: ['learning', 'reviewing']
          }
        }
      })
    ]);

    // Get daily breakdown
    const dailyTasks = await StudyTask.findAll({
      where: {
        userId: req.user.id,
        isCompleted: false,
        dueDate: {
          [Op.between]: [new Date(), endDate]
        }
      },
      attributes: [
        [fn('DATE', col('due_date')), 'date'],
        [fn('COUNT', col('id')), 'count']
      ],
      group: [fn('DATE', col('due_date'))],
      order: [[fn('DATE', col('due_date')), 'ASC']],
      raw: true
    });

    const dailyExams = await ExamReminder.findAll({
      where: {
        userId: req.user.id,
        examDate: {
          [Op.between]: [new Date(), endDate]
        },
        isPassed: false,
        isActive: true
      },
      attributes: [
        [fn('DATE', col('exam_date')), 'date'],
        [fn('COUNT', col('id')), 'count']
      ],
      group: [fn('DATE', col('exam_date'))],
      order: [[fn('DATE', col('exam_date')), 'ASC']],
      raw: true
    });

    const dailyCards = await Card.findAll({
      where: {
        userId: req.user.id,
        nextReviewDate: {
          [Op.between]: [new Date(), endDate]
        },
        status: {
          [Op.in]: ['learning', 'reviewing']
        }
      },
      attributes: [
        [fn('DATE', col('next_review_date')), 'date'],
        [fn('COUNT', col('id')), 'count']
      ],
      group: [fn('DATE', col('next_review_date'))],
      order: [[fn('DATE', col('next_review_date')), 'ASC']],
      raw: true
    });

    // Combine daily data
    const dailyWorkload = {};
    dailyTasks.forEach(item => {
      dailyWorkload[item.date] = { tasks: parseInt(item.count), exams: 0, cards: 0 };
    });
    dailyExams.forEach(item => {
      if (!dailyWorkload[item.date]) dailyWorkload[item.date] = { tasks: 0, exams: 0, cards: 0 };
      dailyWorkload[item.date].exams = parseInt(item.count);
    });
    dailyCards.forEach(item => {
      if (!dailyWorkload[item.date]) dailyWorkload[item.date] = { tasks: 0, exams: 0, cards: 0 };
      dailyWorkload[item.date].cards = parseInt(item.count);
    });

    const dailyWorkloadArray = Object.keys(dailyWorkload).map(date => ({
      date,
      ...dailyWorkload[date],
      total: dailyWorkload[date].tasks + dailyWorkload[date].exams + dailyWorkload[date].cards
    })).sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      summary: {
        dueTasks,
        upcomingExams,
        dueCards,
        total: dueTasks + upcomingExams + dueCards
      },
      daily: dailyWorkloadArray
    });
  } catch (error) {
    console.error('Error fetching upcoming workload:', error);
    res.status(500).json({ message: 'Error fetching upcoming workload', error: error.message });
  }
});

// Get streak data and milestones
router.get('/streak', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['currentStreak', 'longestStreak', 'lastStudyDate', 'level', 'experiencePoints', 'coins']
    });

    // Get study days in the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const studyDays = await StudySession.findAll({
      where: {
        userId: req.user.id,
        scheduledDate: { [Op.gte]: thirtyDaysAgo },
        isCompleted: true
      },
      attributes: [[fn('DATE', col('scheduled_date')), 'date']],
      group: [fn('DATE', col('scheduled_date'))],
      raw: true
    });

    const studyDates = studyDays.map(d => d.date);

    // Calculate streak milestones
    const milestones = [
      { days: 7, name: '1 Week Streak', icon: '🔥', achieved: user.longestStreak >= 7 },
      { days: 14, name: '2 Week Streak', icon: '🔥🔥', achieved: user.longestStreak >= 14 },
      { days: 30, name: '1 Month Streak', icon: '🔥🔥🔥', achieved: user.longestStreak >= 30 },
      { days: 60, name: '2 Month Streak', icon: '💪', achieved: user.longestStreak >= 60 },
      { days: 100, name: '100 Day Streak', icon: '🏆', achieved: user.longestStreak >= 100 },
      { days: 365, name: '1 Year Streak', icon: '👑', achieved: user.longestStreak >= 365 }
    ];

    res.json({
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      lastStudyDate: user.lastStudyDate,
      studyDaysLast30: studyDates,
      milestones,
      nextMilestone: milestones.find(m => !m.achieved) || null
    });
  } catch (error) {
    console.error('Error fetching streak data:', error);
    res.status(500).json({ message: 'Error fetching streak data', error: error.message });
  }
});

// Get comprehensive analytics summary
router.get('/summary', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    // Total study time
    const [timeStats] = await StudySession.findAll({
      where: {
        userId: req.user.id,
        isCompleted: true
      },
      attributes: [
        [fn('SUM', col('duration')), 'totalSeconds'],
        [fn('COUNT', col('id')), 'sessionCount']
      ],
      raw: true
    });

    // Card statistics
    const [cardStats] = await Card.findAll({
      where: { userId: req.user.id },
      attributes: [
        [fn('COUNT', col('id')), 'totalCards'],
        [fn('COUNT', literal('CASE WHEN status = \'mastered\' THEN 1 END')), 'masteredCards'],
        [fn('AVG', col('times_correct')), 'avgCorrect']
      ],
      raw: true
    });

    // Task statistics
    const [taskStats] = await StudyTask.findAll({
      where: { userId: req.user.id },
      attributes: [
        [fn('COUNT', col('id')), 'totalTasks'],
        [fn('COUNT', literal('CASE WHEN is_completed = true THEN 1 END')), 'completedTasks']
      ],
      raw: true
    });

    // Course count
    const courseCount = await Course.count({ where: { userId: req.user.id } });

    res.json({
      user: {
        level: user.level,
        experiencePoints: user.experiencePoints,
        coins: user.coins,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak
      },
      study: {
        totalHours: timeStats.totalSeconds ? (timeStats.totalSeconds / 3600).toFixed(1) : 0,
        totalSessions: parseInt(timeStats.sessionCount) || 0,
        averageSessionMinutes: timeStats.sessionCount > 0 ? Math.round(timeStats.totalSeconds / timeStats.sessionCount / 60) : 0
      },
      cards: {
        total: parseInt(cardStats.totalCards) || 0,
        mastered: parseInt(cardStats.masteredCards) || 0,
        masteryRate: cardStats.totalCards > 0 ? ((cardStats.masteredCards / cardStats.totalCards) * 100).toFixed(1) : 0
      },
      tasks: {
        total: parseInt(taskStats.totalTasks) || 0,
        completed: parseInt(taskStats.completedTasks) || 0,
        completionRate: taskStats.totalTasks > 0 ? ((taskStats.completedTasks / taskStats.totalTasks) * 100).toFixed(1) : 0
      },
      courses: courseCount
    });
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    res.status(500).json({ message: 'Error fetching analytics summary', error: error.message });
  }
});

module.exports = router;
