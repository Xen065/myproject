/**
 * ============================================
 * UserCourse Model (Junction Table)
 * ============================================
 * Tracks course enrollments and progress
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserCourse = sequelize.define('UserCourse', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // Relationships
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },

  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'course_id',
    references: {
      model: 'courses',
      key: 'id'
    }
  },

  // Enrollment Information
  enrolledAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'enrolled_at'
  },

  // Progress Tracking
  totalCards: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_cards',
    validate: {
      min: 0
    }
  },

  masteredCards: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'mastered_cards',
    validate: {
      min: 0
    }
  },

  dueCards: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'due_cards',
    validate: {
      min: 0
    }
  },

  progressPercentage: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    field: 'progress_percentage',
    validate: {
      min: 0,
      max: 100
    }
  },

  // Study Stats
  totalStudyTime: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_study_time',
    comment: 'Total study time in seconds'
  },

  lastStudiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_studied_at'
  },

  // Status
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },

  isCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_completed'
  },

  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'completed_at'
  },

  // Timestamps (createdAt and updatedAt are added automatically)

}, {
  tableName: 'user_courses',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'course_id']
    },
    {
      fields: ['is_active']
    }
  ]
});

module.exports = UserCourse;
