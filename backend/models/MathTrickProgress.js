const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MathTrickProgress = sequelize.define('MathTrickProgress', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 5
    }
  },
  xp: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  currentStreak: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  longestStreak: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalQuestionsAnswered: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalCorrectAnswers: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalWrongAnswers: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  averageSpeed: {
    type: DataTypes.FLOAT,
    defaultValue: 0 // in seconds
  },
  dailyStreak: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastPlayedDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // Topic-wise stats (JSON object)
  topicStats: {
    type: DataTypes.JSON,
    defaultValue: {
      speedArithmetic: { correct: 0, wrong: 0, avgTime: 0 },
      mentalMath: { correct: 0, wrong: 0, avgTime: 0 },
      numberSeries: { correct: 0, wrong: 0, avgTime: 0 },
      percentage: { correct: 0, wrong: 0, avgTime: 0 },
      profitLoss: { correct: 0, wrong: 0, avgTime: 0 },
      timeWork: { correct: 0, wrong: 0, avgTime: 0 },
      speedDistance: { correct: 0, wrong: 0, avgTime: 0 },
      ratio: { correct: 0, wrong: 0, avgTime: 0 },
      simplification: { correct: 0, wrong: 0, avgTime: 0 },
      squaresCubes: { correct: 0, wrong: 0, avgTime: 0 }
    }
  },
  unlockedTopics: {
    type: DataTypes.JSON,
    defaultValue: ['speedArithmetic', 'mentalMath', 'percentage'] // Start with 3 unlocked
  }
}, {
  timestamps: true,
  tableName: 'math_trick_progress'
});

module.exports = MathTrickProgress;
