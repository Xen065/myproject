/**
 * ============================================
 * CourseModule Model
 * ============================================
 * Represents a module/section within a course
 * Used to organize course content and questions
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CourseModule = sequelize.define('CourseModule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // Module Information
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      len: [1, 200]
    }
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  // Organization
  orderIndex: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'order_index',
    comment: 'Order of module within the course'
  },

  // Relationship
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'course_id',
    references: {
      model: 'courses',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },

  // Status
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_published'
  },

  // Metadata
  icon: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: '📝',
    comment: 'Emoji or icon for the module'
  },

  // Duration estimate
  estimatedDuration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'estimated_duration',
    comment: 'Estimated time to complete in minutes'
  },

  // Timestamps (createdAt and updatedAt are added automatically)

}, {
  tableName: 'course_modules',
  timestamps: true,
  indexes: [
    {
      fields: ['course_id']
    },
    {
      fields: ['order_index']
    },
    {
      fields: ['is_published']
    }
  ]
});

module.exports = CourseModule;
