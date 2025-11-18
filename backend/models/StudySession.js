/**
 * ============================================
 * StudySession Model
 * ============================================
 * Records study sessions and calendar events
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StudySession = sequelize.define('StudySession', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // User Relationship
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },

  // Course Relationship (optional)
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'course_id',
    references: {
      model: 'courses',
      key: 'id'
    }
  },

  // Session Information
  title: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'Study Session'
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  sessionType: {
    type: DataTypes.ENUM('study', 'review', 'scheduled', 'practice'),
    defaultValue: 'study',
    field: 'session_type'
  },

  // Timing
  scheduledDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'scheduled_date',
    comment: 'For calendar/scheduled sessions'
  },

  startTime: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'start_time'
  },

  endTime: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'end_time'
  },

  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Duration in seconds'
  },

  // Session Stats
  cardsStudied: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'cards_studied',
    validate: {
      min: 0
    }
  },

  cardsCorrect: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'cards_correct',
    validate: {
      min: 0
    }
  },

  cardsIncorrect: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'cards_incorrect',
    validate: {
      min: 0
    }
  },

  accuracy: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    },
    comment: 'Accuracy percentage'
  },

  // XP and Coins Earned
  xpEarned: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'xp_earned',
    validate: {
      min: 0
    }
  },

  coinsEarned: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'coins_earned',
    validate: {
      min: 0
    }
  },

  // Session Status
  isCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_completed'
  },

  isCancelled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_cancelled'
  },

  // Notes
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  // Timestamps (createdAt and updatedAt are added automatically)

}, {
  tableName: 'study_sessions',
  timestamps: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['course_id']
    },
    {
      fields: ['scheduled_date']
    },
    {
      fields: ['is_completed']
    }
  ]
});

module.exports = StudySession;
