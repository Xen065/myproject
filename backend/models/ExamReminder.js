const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ExamReminder = sequelize.define('ExamReminder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Courses',
      key: 'id'
    }
  },
  examTitle: {
    type: DataTypes.STRING,
    allowNull: false
  },
  examDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  examTime: {
    type: DataTypes.TIME,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  examType: {
    type: DataTypes.ENUM('midterm', 'final', 'quiz', 'test', 'assignment', 'presentation', 'other'),
    defaultValue: 'test'
  },
  duration: {
    type: DataTypes.INTEGER, // in minutes
    allowNull: true
  },
  reminderDays: {
    type: DataTypes.JSON, // e.g., [1, 3, 7] for 1 day, 3 days, 7 days before
    defaultValue: [1, 7]
  },
  remindersSent: {
    type: DataTypes.JSON, // track which reminders have been sent
    defaultValue: []
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isPassed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  attachments: {
    type: DataTypes.JSON, // store file paths or URLs
    defaultValue: []
  },
  color: {
    type: DataTypes.STRING, // for calendar color coding
    defaultValue: '#f5576c'
  },
  notificationEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  tableName: 'exam_reminders'
});

module.exports = ExamReminder;
