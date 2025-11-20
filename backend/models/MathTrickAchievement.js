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
  tableName: 'math_trick_achievements',
  underscored: true,
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'badge_name']
    }
  ]
});

module.exports = MathTrickAchievement;
