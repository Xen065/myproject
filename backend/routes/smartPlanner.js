const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { Op, fn, col } = require('sequelize');
const StudyTask = require('../models/StudyTask');
const ExamReminder = require('../models/ExamReminder');
const Card = require('../models/Card');
const Course = require('../models/Course');
const StudySession = require('../models/StudySession');

// Generate smart study plan for a week
router.post('/plan-week', authenticate, async (req, res) => {
  try {
    const { startDate, availableHoursPerDay, preferredStudyTimes } = req.body;

    const planStartDate = startDate ? new Date(startDate) : new Date();
    const availableHours = availableHoursPerDay || 4; // Default 4 hours/day

    // Get upcoming tasks (next 7 days)
    const sevenDaysLater = new Date(planStartDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    const upcomingTasks = await StudyTask.findAll({
      where: {
        userId: req.user.id,
        isCompleted: false,
        dueDate: {
          [Op.between]: [planStartDate, sevenDaysLater]
        }
      },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'name', 'code', 'color']
        }
      ],
      order: [
        ['priority', 'DESC'],
        ['dueDate', 'ASC']
      ]
    });

    // Get upcoming exams (next 14 days)
    const fourteenDaysLater = new Date(planStartDate.getTime() + 14 * 24 * 60 * 60 * 1000);

    const upcomingExams = await ExamReminder.findAll({
      where: {
        userId: req.user.id,
        isPassed: false,
        isActive: true,
        examDate: {
          [Op.between]: [planStartDate, fourteenDaysLater]
        }
      },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'name', 'code', 'color']
        }
      ],
      order: [['examDate', 'ASC']]
    });

    // Get cards due for review (next 7 days)
    const dueCards = await Card.findAll({
      where: {
        userId: req.user.id,
        nextReviewDate: {
          [Op.between]: [planStartDate, sevenDaysLater]
        },
        status: {
          [Op.in]: ['new', 'learning', 'reviewing']
        }
      },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'name', 'code', 'color']
        }
      ]
    });

    // Group cards by course and date
    const cardsByCourse = {};
    dueCards.forEach(card => {
      const courseId = card.courseId;
      if (!cardsByCourse[courseId]) {
        cardsByCourse[courseId] = {
          course: card.course,
          cards: []
        };
      }
      cardsByCourse[courseId].cards.push(card);
    });

    // Get past performance data (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const pastSessions = await StudySession.findAll({
      where: {
        userId: req.user.id,
        scheduledDate: { [Op.gte]: thirtyDaysAgo },
        isCompleted: true
      },
      attributes: [
        'courseId',
        [fn('AVG', col('accuracy')), 'avgAccuracy'],
        [fn('COUNT', col('id')), 'sessionCount']
      ],
      group: ['courseId']
    });

    const coursePerformance = {};
    pastSessions.forEach(session => {
      coursePerformance[session.courseId] = {
        avgAccuracy: parseFloat(session.avgAccuracy) || 0,
        sessionCount: parseInt(session.sessionCount)
      };
    });

    // Calculate priority scores for each course
    const coursePriorities = {};

    // Factor 1: Upcoming exams (highest priority)
    upcomingExams.forEach(exam => {
      const daysUntilExam = Math.ceil((new Date(exam.examDate) - planStartDate) / (1000 * 60 * 60 * 24));
      const urgencyScore = Math.max(10 - daysUntilExam, 1) * 10; // More urgent = higher score

      if (!coursePriorities[exam.courseId]) {
        coursePriorities[exam.courseId] = {
          course: exam.course,
          score: 0,
          reasons: []
        };
      }

      coursePriorities[exam.courseId].score += urgencyScore;
      coursePriorities[exam.courseId].reasons.push(`Exam in ${daysUntilExam} days`);
    });

    // Factor 2: Urgent tasks
    upcomingTasks.forEach(task => {
      const daysUntilDue = Math.ceil((new Date(task.dueDate) - planStartDate) / (1000 * 60 * 60 * 24));
      const taskScore = task.priority === 'urgent' ? 30 :
                        task.priority === 'high' ? 20 :
                        task.priority === 'medium' ? 10 : 5;

      const urgencyMultiplier = Math.max(5 - daysUntilDue, 1);

      if (!coursePriorities[task.courseId]) {
        coursePriorities[task.courseId] = {
          course: task.course,
          score: 0,
          reasons: []
        };
      }

      coursePriorities[task.courseId].score += taskScore * urgencyMultiplier;
      coursePriorities[task.courseId].reasons.push(`${task.priority} priority task due in ${daysUntilDue} days`);
    });

    // Factor 3: Cards due for review
    Object.keys(cardsByCourse).forEach(courseId => {
      const cardCount = cardsByCourse[courseId].cards.length;
      const reviewScore = Math.min(cardCount * 0.5, 50); // Cap at 50

      if (!coursePriorities[courseId]) {
        coursePriorities[courseId] = {
          course: cardsByCourse[courseId].course,
          score: 0,
          reasons: []
        };
      }

      coursePriorities[courseId].score += reviewScore;
      coursePriorities[courseId].reasons.push(`${cardCount} cards due for review`);
    });

    // Factor 4: Past performance (lower accuracy = need more study)
    Object.keys(coursePerformance).forEach(courseId => {
      const performance = coursePerformance[courseId];
      if (performance.avgAccuracy < 70) {
        const weaknessScore = (70 - performance.avgAccuracy) * 0.5;

        if (coursePriorities[courseId]) {
          coursePriorities[courseId].score += weaknessScore;
          coursePriorities[courseId].reasons.push(`Low accuracy (${performance.avgAccuracy.toFixed(1)}%)`);
        }
      }
    });

    // Sort courses by priority
    const sortedCourses = Object.keys(coursePriorities)
      .map(courseId => ({
        courseId,
        ...coursePriorities[courseId]
      }))
      .sort((a, b) => b.score - a.score);

    // Generate daily schedule
    const dailySchedule = [];
    const totalAvailableMinutes = availableHours * 60;

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(planStartDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateString = currentDate.toISOString().split('T')[0];

      // Distribute time among top courses
      const dailyActivities = [];
      let remainingMinutes = totalAvailableMinutes;

      // Check for exams on this day or next day
      const nearbyExams = upcomingExams.filter(exam => {
        const examDate = new Date(exam.examDate);
        const daysDiff = Math.ceil((examDate - currentDate) / (1000 * 60 * 60 * 24));
        return daysDiff >= 0 && daysDiff <= 1;
      });

      if (nearbyExams.length > 0) {
        // Dedicate more time to exam prep
        nearbyExams.forEach(exam => {
          const prepTime = Math.min(120, remainingMinutes * 0.6); // Up to 2 hours or 60% of time
          dailyActivities.push({
            type: 'exam_prep',
            courseId: exam.courseId,
            courseName: exam.course ? exam.course.name : 'Unknown',
            title: `Exam Preparation: ${exam.examTitle}`,
            duration: prepTime,
            priority: 'urgent',
            description: `Prepare for ${exam.examTitle} on ${exam.examDate}`
          });
          remainingMinutes -= prepTime;
        });
      }

      // Check for tasks due on this day
      const todayTasks = upcomingTasks.filter(task => {
        const dueDate = new Date(task.dueDate).toISOString().split('T')[0];
        return dueDate === dateString;
      });

      todayTasks.forEach(task => {
        const taskTime = Math.min(task.estimatedDuration || 60, remainingMinutes * 0.4);
        dailyActivities.push({
          type: 'task',
          taskId: task.id,
          courseId: task.courseId,
          courseName: task.course ? task.course.name : 'Unknown',
          title: task.title,
          duration: taskTime,
          priority: task.priority,
          description: task.description
        });
        remainingMinutes -= taskTime;
      });

      // Distribute remaining time among top priority courses
      let courseIndex = 0;
      while (remainingMinutes > 30 && courseIndex < sortedCourses.length) {
        const course = sortedCourses[courseIndex];
        const studyTime = Math.min(60, remainingMinutes / (sortedCourses.length - courseIndex));

        // Check if there are cards to review
        const courseCards = cardsByCourse[course.courseId];
        if (courseCards && courseCards.cards.length > 0) {
          dailyActivities.push({
            type: 'card_review',
            courseId: course.courseId,
            courseName: course.course.name,
            title: `Review ${course.course.name} flashcards`,
            duration: studyTime,
            priority: 'medium',
            description: `Review ${Math.min(courseCards.cards.length, Math.floor(studyTime / 2))} cards`,
            estimatedCards: Math.min(courseCards.cards.length, Math.floor(studyTime / 2))
          });
        } else {
          dailyActivities.push({
            type: 'study',
            courseId: course.courseId,
            courseName: course.course.name,
            title: `Study ${course.course.name}`,
            duration: studyTime,
            priority: 'medium',
            description: course.reasons.join(', ')
          });
        }

        remainingMinutes -= studyTime;
        courseIndex++;
      }

      // Add break time
      if (dailyActivities.length > 0) {
        const totalStudyTime = dailyActivities.reduce((sum, act) => sum + act.duration, 0);
        const breakTime = Math.floor(totalStudyTime / 25) * 5; // 5 min break per 25 min study

        dailyActivities.push({
          type: 'break',
          title: 'Breaks',
          duration: breakTime,
          priority: 'low',
          description: 'Pomodoro breaks'
        });
      }

      dailySchedule.push({
        date: dateString,
        dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'long' }),
        activities: dailyActivities,
        totalMinutes: dailyActivities.reduce((sum, act) => sum + act.duration, 0)
      });
    }

    res.json({
      weeklyPlan: dailySchedule,
      coursePriorities: sortedCourses.slice(0, 5), // Top 5 priorities
      summary: {
        totalTasks: upcomingTasks.length,
        totalExams: upcomingExams.length,
        totalDueCards: dueCards.length,
        estimatedWeeklyHours: (dailySchedule.reduce((sum, day) => sum + day.totalMinutes, 0) / 60).toFixed(1)
      }
    });
  } catch (error) {
    console.error('Error generating study plan:', error);
    res.status(500).json({ message: 'Error generating study plan', error: error.message });
  }
});

// Get priority recommendations for today
router.get('/today-priorities', authenticate, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const [todayTasks, todayExams, dueCards] = await Promise.all([
      StudyTask.findAll({
        where: {
          userId: req.user.id,
          isCompleted: false,
          dueDate: { [Op.lte]: tomorrow }
        },
        include: [
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'name', 'code', 'color']
          }
        ],
        order: [
          ['priority', 'DESC'],
          ['dueDate', 'ASC']
        ],
        limit: 5
      }),
      ExamReminder.findAll({
        where: {
          userId: req.user.id,
          isPassed: false,
          isActive: true,
          examDate: { [Op.lte]: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
        },
        include: [
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'name', 'code', 'color']
          }
        ],
        order: [['examDate', 'ASC']],
        limit: 3
      }),
      Card.count({
        where: {
          userId: req.user.id,
          nextReviewDate: { [Op.lte]: today },
          status: { [Op.in]: ['learning', 'reviewing'] }
        }
      })
    ]);

    const priorities = [];

    // Add exam preparation
    todayExams.forEach(exam => {
      const daysUntil = Math.ceil((new Date(exam.examDate) - new Date()) / (1000 * 60 * 60 * 24));
      priorities.push({
        type: 'exam',
        priority: 'urgent',
        title: `Prepare for ${exam.examTitle}`,
        description: `Exam in ${daysUntil} days`,
        courseId: exam.courseId,
        courseName: exam.course ? exam.course.name : 'Unknown',
        urgency: daysUntil <= 3 ? 'critical' : 'high',
        estimatedTime: 90
      });
    });

    // Add urgent tasks
    todayTasks.forEach(task => {
      const daysUntil = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
      priorities.push({
        type: 'task',
        priority: task.priority,
        title: task.title,
        description: `Due in ${daysUntil} ${daysUntil === 1 ? 'day' : 'days'}`,
        courseId: task.courseId,
        courseName: task.course ? task.course.name : 'Unknown',
        urgency: daysUntil <= 0 ? 'critical' : daysUntil <= 1 ? 'high' : 'medium',
        estimatedTime: task.estimatedDuration || 60
      });
    });

    // Add card review
    if (dueCards > 0) {
      priorities.push({
        type: 'cards',
        priority: 'medium',
        title: 'Review flashcards',
        description: `${dueCards} cards due today`,
        urgency: dueCards > 50 ? 'high' : 'medium',
        estimatedTime: Math.min(dueCards * 2, 120) // 2 min per card, max 2 hours
      });
    }

    // Sort by urgency
    const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    priorities.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

    res.json({
      date: today,
      priorities: priorities.slice(0, 5),
      summary: {
        totalTasks: todayTasks.length,
        totalExams: todayExams.length,
        dueCards,
        estimatedTotalTime: priorities.reduce((sum, p) => sum + p.estimatedTime, 0)
      }
    });
  } catch (error) {
    console.error('Error fetching today priorities:', error);
    res.status(500).json({ message: 'Error fetching today priorities', error: error.message });
  }
});

// Get suggested study schedule based on past patterns
router.get('/optimal-times', authenticate, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const sessions = await StudySession.findAll({
      where: {
        userId: req.user.id,
        scheduledDate: { [Op.gte]: thirtyDaysAgo },
        isCompleted: true
      },
      attributes: [
        'startTime',
        'accuracy',
        'duration'
      ]
    });

    // Analyze performance by hour of day
    const hourlyPerformance = {};

    sessions.forEach(session => {
      const hour = new Date(session.startTime).getHours();
      if (!hourlyPerformance[hour]) {
        hourlyPerformance[hour] = {
          sessionCount: 0,
          totalAccuracy: 0,
          totalDuration: 0
        };
      }

      hourlyPerformance[hour].sessionCount += 1;
      hourlyPerformance[hour].totalAccuracy += session.accuracy || 0;
      hourlyPerformance[hour].totalDuration += session.duration || 0;
    });

    // Calculate average accuracy and duration per hour
    const optimalTimes = Object.keys(hourlyPerformance).map(hour => {
      const data = hourlyPerformance[hour];
      return {
        hour: parseInt(hour),
        timeRange: `${hour}:00 - ${parseInt(hour) + 1}:00`,
        averageAccuracy: (data.totalAccuracy / data.sessionCount).toFixed(1),
        sessionCount: data.sessionCount,
        averageDuration: Math.round(data.totalDuration / data.sessionCount / 60)
      };
    }).sort((a, b) => b.averageAccuracy - a.averageAccuracy);

    const recommendations = {
      bestTimes: optimalTimes.slice(0, 3),
      allTimes: optimalTimes,
      suggestion: optimalTimes.length > 0
        ? `Your peak performance is at ${optimalTimes[0].timeRange} with ${optimalTimes[0].averageAccuracy}% accuracy`
        : 'Complete more study sessions to generate personalized recommendations'
    };

    res.json(recommendations);
  } catch (error) {
    console.error('Error analyzing optimal times:', error);
    res.status(500).json({ message: 'Error analyzing optimal times', error: error.message });
  }
});

module.exports = router;
