/**
 * ============================================
 * Models Index
 * ============================================
 * Exports all models and defines their relationships
 */

const User = require('./User');
const Course = require('./Course');
const Card = require('./Card');
const StudySession = require('./StudySession');
const StudyTask = require('./StudyTask');
const ExamReminder = require('./ExamReminder');
const Achievement = require('./Achievement');
const UserAchievement = require('./UserAchievement');
const UserCourse = require('./UserCourse');
const Permission = require('./Permission');
const RolePermission = require('./RolePermission');
const AuditLog = require('./AuditLog');
const CourseModule = require('./CourseModule');
const CourseContent = require('./CourseContent');

// ============================================
// Define Model Associations (Relationships)
// ============================================

// User <-> Course (Many-to-Many through UserCourse)
User.belongsToMany(Course, {
  through: UserCourse,
  foreignKey: 'userId',
  otherKey: 'courseId',
  as: 'enrolledCourses'
});

Course.belongsToMany(User, {
  through: UserCourse,
  foreignKey: 'courseId',
  otherKey: 'userId',
  as: 'enrolledStudents'
});

// User -> UserCourse
User.hasMany(UserCourse, {
  foreignKey: 'userId',
  as: 'courseEnrollments'
});

UserCourse.belongsTo(User, {
  foreignKey: 'userId'
});

// Course -> UserCourse
Course.hasMany(UserCourse, {
  foreignKey: 'courseId',
  as: 'enrollments'
});

UserCourse.belongsTo(Course, {
  foreignKey: 'courseId'
});

// User -> Card (One-to-Many)
User.hasMany(Card, {
  foreignKey: 'userId',
  as: 'cards'
});

Card.belongsTo(User, {
  foreignKey: 'userId',
  as: 'student'
});

// Course -> Card (One-to-Many)
Course.hasMany(Card, {
  foreignKey: 'courseId',
  as: 'cards'
});

Card.belongsTo(Course, {
  foreignKey: 'courseId',
  as: 'course'
});

// User -> StudySession (One-to-Many)
User.hasMany(StudySession, {
  foreignKey: 'userId',
  as: 'studySessions'
});

StudySession.belongsTo(User, {
  foreignKey: 'userId',
  as: 'student'
});

// Course -> StudySession (One-to-Many)
Course.hasMany(StudySession, {
  foreignKey: 'courseId',
  as: 'studySessions'
});

StudySession.belongsTo(Course, {
  foreignKey: 'courseId',
  as: 'course'
});

// User <-> Achievement (Many-to-Many through UserAchievement)
User.belongsToMany(Achievement, {
  through: UserAchievement,
  foreignKey: 'userId',
  otherKey: 'achievementId',
  as: 'achievements'
});

Achievement.belongsToMany(User, {
  through: UserAchievement,
  foreignKey: 'achievementId',
  otherKey: 'userId',
  as: 'users'
});

// User -> UserAchievement
User.hasMany(UserAchievement, {
  foreignKey: 'userId',
  as: 'achievementProgress'
});

UserAchievement.belongsTo(User, {
  foreignKey: 'userId'
});

// Achievement -> UserAchievement
Achievement.hasMany(UserAchievement, {
  foreignKey: 'achievementId',
  as: 'userProgress'
});

UserAchievement.belongsTo(Achievement, {
  foreignKey: 'achievementId'
});

// Course creator relationship
Course.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator'
});

User.hasMany(Course, {
  foreignKey: 'createdBy',
  as: 'createdCourses'
});

// User -> AuditLog (One-to-Many)
User.hasMany(AuditLog, {
  foreignKey: 'userId',
  as: 'auditLogs'
});

AuditLog.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// User self-reference for role changes
User.belongsTo(User, {
  foreignKey: 'roleChangedBy',
  as: 'roleChanger'
});

// Course -> CourseModule (One-to-Many)
Course.hasMany(CourseModule, {
  foreignKey: 'courseId',
  as: 'modules',
  onDelete: 'CASCADE'
});

CourseModule.belongsTo(Course, {
  foreignKey: 'courseId',
  as: 'course'
});

// Course -> CourseContent (One-to-Many)
Course.hasMany(CourseContent, {
  foreignKey: 'courseId',
  as: 'contents',
  onDelete: 'CASCADE'
});

CourseContent.belongsTo(Course, {
  foreignKey: 'courseId',
  as: 'course'
});

// CourseModule -> CourseContent (One-to-Many)
CourseModule.hasMany(CourseContent, {
  foreignKey: 'moduleId',
  as: 'contents',
  onDelete: 'SET NULL'
});

CourseContent.belongsTo(CourseModule, {
  foreignKey: 'moduleId',
  as: 'module'
});

// CourseModule -> Card (One-to-Many) - Questions can belong to modules
CourseModule.hasMany(Card, {
  foreignKey: 'moduleId',
  as: 'questions',
  onDelete: 'SET NULL'
});

Card.belongsTo(CourseModule, {
  foreignKey: 'moduleId',
  as: 'module'
});

// User -> StudyTask (One-to-Many)
User.hasMany(StudyTask, {
  foreignKey: 'userId',
  as: 'studyTasks'
});

StudyTask.belongsTo(User, {
  foreignKey: 'userId',
  as: 'student'
});

// Course -> StudyTask (One-to-Many)
Course.hasMany(StudyTask, {
  foreignKey: 'courseId',
  as: 'tasks'
});

StudyTask.belongsTo(Course, {
  foreignKey: 'courseId',
  as: 'course'
});

// User -> ExamReminder (One-to-Many)
User.hasMany(ExamReminder, {
  foreignKey: 'userId',
  as: 'examReminders'
});

ExamReminder.belongsTo(User, {
  foreignKey: 'userId',
  as: 'student'
});

// Course -> ExamReminder (One-to-Many)
Course.hasMany(ExamReminder, {
  foreignKey: 'courseId',
  as: 'exams'
});

ExamReminder.belongsTo(Course, {
  foreignKey: 'courseId',
  as: 'course'
});

// ============================================
// Export all models
// ============================================

module.exports = {
  User,
  Course,
  Card,
  StudySession,
  StudyTask,
  ExamReminder,
  Achievement,
  UserAchievement,
  UserCourse,
  Permission,
  RolePermission,
  AuditLog,
  CourseModule,
  CourseContent
};
