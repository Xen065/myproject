/**
 * ============================================
 * RolePermission Model
 * ============================================
 * Junction table linking roles to permissions
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RolePermission = sequelize.define('RolePermission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  role: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [['student', 'teacher', 'admin', 'super_admin']]
    }
  },

  permission: {
    type: DataTypes.STRING(100),
    allowNull: false
  }

}, {
  tableName: 'role_permissions',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['role', 'permission']
    }
  ]
});

module.exports = RolePermission;
