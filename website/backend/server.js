const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const repository = require('./repository');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API Routes

// User Stats
app.get('/api/user-stats', (req, res) => {
  try {
    const stats = repository.getUserStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/user-stats', (req, res) => {
  try {
    repository.updateUserStats(req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Courses
app.get('/api/courses', (req, res) => {
  try {
    const courses = repository.getAllCourses();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/courses/owned', (req, res) => {
  try {
    const courses = repository.getOwnedCourses();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/courses/:id', (req, res) => {
  try {
    const course = repository.getCourseById(req.params.id);
    if (course) {
      res.json(course);
    } else {
      res.status(404).json({ error: 'Course not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/courses/:id/purchase', (req, res) => {
  try {
    const result = repository.purchaseCourse(req.params.id);
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cards
app.get('/api/courses/:courseId/cards', (req, res) => {
  try {
    const cards = repository.getCardsByCourse(req.params.courseId);
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/courses/:courseId/cards/due', (req, res) => {
  try {
    const cards = repository.getDueCards(req.params.courseId);
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/cards/:id', (req, res) => {
  try {
    const card = repository.getCardById(req.params.id);
    if (card) {
      res.json(card);
    } else {
      res.status(404).json({ error: 'Card not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/cards/:id/review', (req, res) => {
  try {
    const { quality } = req.body;
    if (quality < 1 || quality > 5) {
      return res.status(400).json({ error: 'Quality must be between 1 and 5' });
    }

    repository.updateStreak();
    const result = repository.reviewCard(req.params.id, quality);

    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ error: 'Card not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Achievements
app.get('/api/achievements', (req, res) => {
  try {
    const achievements = repository.getAllAchievements();
    res.json(achievements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Study Sessions
app.get('/api/study-sessions', (req, res) => {
  try {
    const sessions = repository.getAllStudySessions();
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/study-sessions', (req, res) => {
  try {
    const { courseId, scheduledDate, duration } = req.body;
    const result = repository.createStudySession(courseId, scheduledDate, duration);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/study-sessions/:id/complete', (req, res) => {
  try {
    const { cardsReviewed, cardsCorrect } = req.body;
    repository.completeStudySession(req.params.id, cardsReviewed, cardsCorrect);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dashboard Stats
app.get('/api/dashboard', (req, res) => {
  try {
    const stats = repository.getDashboardStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'EduMaster API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`EduMaster Backend running on http://localhost:${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
});

module.exports = app;
