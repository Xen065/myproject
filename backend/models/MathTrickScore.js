const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MathTrickScore = sequelize.define('MathTrickScore', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  gameMode: {
    type: DataTypes.ENUM('speed_challenge', 'daily_practice', 'endless', 'competitive_simulation'),
    allowNull: false
  },
  topic: {
    type: DataTypes.STRING,
    allowNull: true // null means mixed topics
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  questionsAnswered: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  correctAnswers: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  wrongAnswers: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  accuracy: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0 // percentage
  },
  averageTime: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0 // in seconds
  },
  totalTime: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0 // in seconds
  },
  maxStreak: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  xpEarned: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  // Detailed question-by-question data
  questionResults: {
    type: DataTypes.JSON,
    defaultValue: [] // Array of { question, userAnswer, correctAnswer, timeTaken, points, isCorrect }
  },
  completedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true,
  tableName: 'math_trick_scores'
});

module.exports = MathTrickScore;
