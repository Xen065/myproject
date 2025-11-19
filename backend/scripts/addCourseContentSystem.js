/**
 * ============================================
 * Migration: Add Course Content and Modules System
 * ============================================
 * Creates course_modules and course_contents tables
 * Adds moduleId column to cards table
 */

require('dotenv').config();
const sequelize = require('../config/database');
const { CourseModule, CourseContent, Card } = require('../models');

async function addCourseContentSystem() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully\n');

    console.log('🔄 Creating course_modules table...');
    await CourseModule.sync({ alter: true });
    console.log('✅ course_modules table created successfully\n');

    console.log('🔄 Creating course_contents table...');
    await CourseContent.sync({ alter: true });
    console.log('✅ course_contents table created successfully\n');

    console.log('🔄 Adding moduleId column to cards table...');
    await Card.sync({ alter: true });
    console.log('✅ moduleId column added to cards table successfully\n');

    console.log('✅ Migration complete!');
    console.log('\nNew features added:');
    console.log('  - Course Modules for organizing content');
    console.log('  - Course Content for videos, PDFs, and documents');
    console.log('  - Questions can now be organized within modules');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

addCourseContentSystem();
