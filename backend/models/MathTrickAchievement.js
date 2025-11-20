const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MathTrickAchievement = sequelize.define('MathTrickAchievement', {
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
  badgeName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  badgeIcon: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('speed', 'accuracy', 'streak', 'level', 'topic', 'special'),
    allowNull: false
  },
  unlockedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true,
  tableName: 'math_trick_achievements',
  indexes: [
    {
      unique: true,
      fields: ['userId', 'badgeName']
    }
  ]
});

module.exports = MathTrickAchievement;
