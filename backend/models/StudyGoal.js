const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StudyGoal = sequelize.define('StudyGoal', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'course_id',
    references: {
      model: 'courses',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  goalType: {
    type: DataTypes.ENUM(
      'daily_time',        // Daily study time goal (in minutes)
      'weekly_time',       // Weekly study time goal (in minutes)
      'daily_cards',       // Daily cards reviewed goal
      'weekly_cards',      // Weekly cards reviewed goal
      'daily_tasks',       // Daily tasks completed goal
      'weekly_tasks',      // Weekly tasks completed goal
      'course_mastery',    // Master X cards in a course
      'accuracy_target',   // Achieve X% accuracy
      'streak_milestone',  // Achieve X day streak
      'exam_preparation',  // Complete prep milestones for exam
      'custom'             // Custom user-defined goal
    ),
    allowNull: false,
    defaultValue: 'custom',
    field: 'goal_type'
  },
  targetValue: {
    type: DataTypes.FLOAT,
    allowNull: false,
    field: 'target_value',
    comment: 'The target value to achieve (e.g., 120 for 120 minutes, 50 for 50 cards)'
  },
  currentProgress: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
    field: 'current_progress',
    comment: 'Current progress toward the goal'
  },
  unit: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'units',
    comment: 'Unit of measurement (minutes, cards, tasks, percentage, days, etc.)'
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'start_date'
  },
  deadline: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Optional deadline for the goal'
  },
  isCompleted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_completed'
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'completed_at'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active',
    comment: 'Whether the goal is currently active'
  },
  isRecurring: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_recurring',
    comment: 'Whether the goal resets periodically (e.g., daily, weekly)'
  },
  recurringPeriod: {
    type: DataTypes.ENUM('daily', 'weekly', 'monthly'),
    allowNull: true,
    field: 'recurring_period',
    comment: 'Period for recurring goals'
  },
  lastResetDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'last_reset_date',
    comment: 'When the goal was last reset (for recurring goals)'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    allowNull: false,
    defaultValue: 'medium'
  },
  color: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: '#3b82f6',
    comment: 'Color for visual representation'
  },
  icon: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Icon or emoji for the goal'
  },
  xpReward: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'xp_reward',
    comment: 'XP earned upon goal completion'
  },
  coinReward: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'coin_reward',
    comment: 'Coins earned upon goal completion'
  },
  milestones: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of milestone checkpoints with progress percentages'
  },
  reminderEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'reminder_enabled'
  },
  reminderTime: {
    type: DataTypes.TIME,
    allowNull: true,
    field: 'reminder_time',
    comment: 'Time of day for goal reminder'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'study_goals',
  underscored: true,
  timestamps: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['course_id']
    },
    {
      fields: ['goal_type']
    },
    {
      fields: ['is_completed']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['deadline']
    }
  ]
});

// Instance method to calculate progress percentage
StudyGoal.prototype.getProgressPercentage = function() {
  if (this.targetValue === 0) return 0;
  return Math.min((this.currentProgress / this.targetValue) * 100, 100);
};

// Instance method to check if goal is achieved
StudyGoal.prototype.checkCompletion = async function() {
  if (this.currentProgress >= this.targetValue && !this.isCompleted) {
    this.isCompleted = true;
    this.completedAt = new Date();
    await this.save();
    return true;
  }
  return false;
};

// Instance method to reset recurring goal
StudyGoal.prototype.resetIfNeeded = async function() {
  if (!this.isRecurring || !this.recurringPeriod) return false;

  const now = new Date();
  const lastReset = this.lastResetDate ? new Date(this.lastResetDate) : new Date(this.startDate);

  let shouldReset = false;

  if (this.recurringPeriod === 'daily') {
    const daysDiff = Math.floor((now - lastReset) / (1000 * 60 * 60 * 24));
    shouldReset = daysDiff >= 1;
  } else if (this.recurringPeriod === 'weekly') {
    const daysDiff = Math.floor((now - lastReset) / (1000 * 60 * 60 * 24));
    shouldReset = daysDiff >= 7;
  } else if (this.recurringPeriod === 'monthly') {
    shouldReset = now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear();
  }

  if (shouldReset) {
    this.currentProgress = 0;
    this.isCompleted = false;
    this.completedAt = null;
    this.lastResetDate = now.toISOString().split('T')[0];
    await this.save();
    return true;
  }

  return false;
};

// Instance method to update progress
StudyGoal.prototype.updateProgress = async function(increment) {
  this.currentProgress += increment;
  if (this.currentProgress < 0) this.currentProgress = 0;

  await this.save();
  return await this.checkCompletion();
};

module.exports = StudyGoal;
