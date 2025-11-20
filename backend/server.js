/**
 * ============================================
 * EduMaster Backend Server
 * ============================================
 * This is the main entry point for the backend API server.
 * It sets up Express, connects to PostgreSQL, and handles all API requests.
 */

// Load environment variables from .env file
require('dotenv').config();

// Import required packages
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');

// Import database connection
const db = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');
const cardRoutes = require('./routes/cards');
const studyRoutes = require('./routes/study');
const studyTasksRoutes = require('./routes/studyTasks');
const examRemindersRoutes = require('./routes/examReminders');
const calendarRoutes = require('./routes/calendar');
const statsRoutes = require('./routes/stats');
const achievementRoutes = require('./routes/achievements');
const adminRoutes = require('./routes/admin');

// Initialize Express app
const app = express();

// ============================================
// Middleware Configuration
// ============================================

// Enable CORS (Cross-Origin Resource Sharing)
// This allows the React frontend to communicate with this backend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Parse JSON request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// HTTP request logger (shows requests in console)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// ============================================
// API Routes
// ============================================

// Health check endpoint (test if server is running)
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'EduMaster API Server is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Authentication routes (login, register)
app.use('/api/auth', authRoutes);

// User profile routes
app.use('/api/users', userRoutes);

// Course management routes
app.use('/api/courses', courseRoutes);

// Flashcard routes
app.use('/api/cards', cardRoutes);

// Study session routes (spaced repetition)
app.use('/api/study', studyRoutes);

// Study tasks (todo list) routes
app.use('/api/study/tasks', studyTasksRoutes);

// Exam reminders routes
app.use('/api/study/exams', examRemindersRoutes);

// Calendar integration routes
app.use('/api/calendar', calendarRoutes);

// Statistics and progress routes
app.use('/api/stats', statsRoutes);

// Achievement and gamification routes
app.use('/api/achievements', achievementRoutes);

// Admin routes (RBAC protected)
app.use('/api/admin', adminRoutes);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================
// Database Connection & Server Start
// ============================================

const PORT = process.env.PORT || 5000;

// Connect to database and start server
db.authenticate()
  .then(() => {
    console.log('✅ Database connected successfully');

    // Sync database models (create tables if they don't exist)
    return db.sync({ alter: process.env.NODE_ENV === 'development' });
  })
  .then(() => {
    console.log('✅ Database synchronized');

    // Start listening for requests
    app.listen(PORT, () => {
      console.log('');
      console.log('🚀 ============================================');
      console.log(`🚀 EduMaster API Server is running!`);
      console.log(`🚀 Environment: ${process.env.NODE_ENV}`);
      console.log(`🚀 Port: ${PORT}`);
      console.log(`🚀 URL: http://localhost:${PORT}`);
      console.log(`🚀 Health Check: http://localhost:${PORT}/api/health`);
      console.log('🚀 ============================================');
      console.log('');
    });
  })
  .catch(err => {
    console.error('❌ Unable to start server:', err);
    process.exit(1);
  });

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  db.close();
  process.exit(0);
});
