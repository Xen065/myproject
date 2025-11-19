/**
 * ============================================
 * Course Model
 * ============================================
 * Represents a course/subject that contains flashcards
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // Course Information
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [3, 100]
    }
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  icon: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: '📚',
    comment: 'Emoji or icon name'
  },

  color: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: '#6366F1',
    validate: {
      is: /^#[0-9A-F]{6}$/i  // Hex color code validation
    }
  },

  // Course Metadata
  category: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'General'
  },

  difficulty: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    allowNull: true,
    defaultValue: null
  },

  language: {
    type: DataTypes.STRING(20),
    defaultValue: 'English'
  },

  // Course Stats
  totalCards: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_cards',
    validate: {
      min: 0
    }
  },

  activeCards: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'active_cards',
    validate: {
      min: 0
    }
  },

  // Pricing
  price: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    },
    comment: 'Price in coins (0 for free courses)'
  },

  isFree: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_free'
  },

  // Publishing Status
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_published'
  },

  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_featured'
  },

  // Creator Information
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'created_by',
    references: {
      model: 'users',
      key: 'id'
    }
  },

  // Enrollment Stats
  enrollmentCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'enrollment_count',
    validate: {
      min: 0
    }
  },

  // Timestamps (createdAt and updatedAt are added automatically)

}, {
  tableName: 'courses',
  timestamps: true,
  indexes: [
    {
      fields: ['category']
    },
    {
      fields: ['is_published']
    },
    {
      fields: ['is_featured']
    }
  ]
});

module.exports = Course;
