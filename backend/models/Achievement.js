/**
 * ============================================
 * Achievement Model
 * ============================================
 * Gamification achievements for motivation
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Achievement = sequelize.define('Achievement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // Achievement Information
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [3, 100]
    }
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },

  icon: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: '🏆',
    comment: 'Emoji or icon name'
  },

  // Achievement Type
  category: {
    type: DataTypes.ENUM('streak', 'cards', 'courses', 'accuracy', 'time', 'special'),
    defaultValue: 'special'
  },

  // Requirements
  requirement: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Number required to unlock (e.g., 7 for 7-day streak)'
  },

  requirementText: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'requirement_text',
    comment: 'Human-readable requirement description'
  },

  // Rewards
  xpReward: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'xp_reward',
    validate: {
      min: 0
    }
  },

  coinReward: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'coin_reward',
    validate: {
      min: 0
    }
  },

  // Achievement Properties
  rarity: {
    type: DataTypes.ENUM('common', 'rare', 'epic', 'legendary'),
    defaultValue: 'common'
  },

  isHidden: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_hidden',
    comment: 'Hidden until unlocked'
  },

  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },

  // Ordering
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'sort_order'
  },

  // Timestamps (createdAt and updatedAt are added automatically)

}, {
  tableName: 'achievements',
  timestamps: true,
  indexes: [
    {
      fields: ['category']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['sort_order']
    }
  ]
});

module.exports = Achievement;
