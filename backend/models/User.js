/**
 * ============================================
 * User Model
 * ============================================
 * Represents a student/user in the system
 */

const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // Basic Information
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50],
      isAlphanumeric: true
    }
  },

  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },

  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },

  fullName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'full_name'
  },

  // Profile Information
  avatar: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: null
  },

  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  // Gamification
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },

  experiencePoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'experience_points',
    validate: {
      min: 0
    }
  },

  coins: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },

  // Streak Tracking
  currentStreak: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'current_streak',
    validate: {
      min: 0
    }
  },

  longestStreak: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'longest_streak',
    validate: {
      min: 0
    }
  },

  lastStudyDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_study_date'
  },

  // Study Settings
  frequencyMode: {
    type: DataTypes.ENUM('intensive', 'normal', 'relaxed'),
    defaultValue: 'normal',
    field: 'frequency_mode',
    allowNull: false,
    validate: {
      isIn: [['intensive', 'normal', 'relaxed']]
    }
  },

  // RBAC - Role-Based Access Control
  role: {
    type: DataTypes.ENUM('student', 'teacher', 'admin', 'super_admin'),
    defaultValue: 'student',
    allowNull: false,
    validate: {
      isIn: [['student', 'teacher', 'admin', 'super_admin']]
    }
  },

  roleChangedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'role_changed_at'
  },

  roleChangedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'role_changed_by',
    references: {
      model: 'users',
      key: 'id'
    }
  },

  // Account Status
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },

  isEmailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_email_verified'
  },

  // Timestamps (createdAt and updatedAt are added automatically by Sequelize)

}, {
  tableName: 'users',
  timestamps: true,

  // Hooks (functions that run before/after certain actions)
  hooks: {
    // Hash password before saving user
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },

    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

/**
 * Instance method to compare password
 * @param {string} enteredPassword - Password to compare
 * @returns {Promise<boolean>} - True if password matches
 */
User.prototype.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Instance method to get public profile (without sensitive data)
 * @returns {Object} - Public user profile
 */
User.prototype.getPublicProfile = function() {
  const { password, ...publicData } = this.toJSON();
  return publicData;
};

/**
 * Instance method to check if user has a specific role
 * @param {string|string[]} roles - Role(s) to check
 * @returns {boolean} - True if user has the role
 */
User.prototype.hasRole = function(roles) {
  if (Array.isArray(roles)) {
    return roles.includes(this.role);
  }
  return this.role === roles;
};

/**
 * Instance method to check if user is admin or above
 * @returns {boolean}
 */
User.prototype.isAdmin = function() {
  return ['admin', 'super_admin'].includes(this.role);
};

/**
 * Instance method to check if user is super admin
 * @returns {boolean}
 */
User.prototype.isSuperAdmin = function() {
  return this.role === 'super_admin';
};

module.exports = User;
