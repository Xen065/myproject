/**
 * ============================================
 * AuditLog Model
 * ============================================
 * Tracks all administrative actions for security and compliance
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },

  action: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },

  resource: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: [['user', 'course', 'card', 'achievement', 'permission', 'system']]
    }
  },

  resourceId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'resource_id'
  },

  details: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },

  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: true,
    field: 'ip_address'
  },

  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'user_agent'
  },

  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  }

}, {
  tableName: 'audit_logs',
  timestamps: false, // Only createdAt, no updatedAt for audit logs
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['action'] },
    { fields: ['resource'] },
    { fields: ['created_at'] }
  ]
});

/**
 * Helper method to create audit log entry
 * @param {Object} data - Audit log data
 * @returns {Promise<AuditLog>}
 */
AuditLog.log = async function(data) {
  return await this.create({
    userId: data.userId,
    action: data.action,
    resource: data.resource,
    resourceId: data.resourceId,
    details: data.details || {},
    ipAddress: data.ipAddress,
    userAgent: data.userAgent
  });
};

module.exports = AuditLog;
