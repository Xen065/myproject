/**
 * ============================================
 * Permission Model
 * ============================================
 * Represents a permission that can be assigned to roles
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Permission = sequelize.define('Permission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  category: {
    type: DataTypes.STRING(50),
    allowNull: true,
    validate: {
      isIn: [['courses', 'cards', 'users', 'achievements', 'system']]
    }
  }

}, {
  tableName: 'permissions',
  timestamps: true,
  underscored: true
});

module.exports = Permission;
