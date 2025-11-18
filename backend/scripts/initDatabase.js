/**
 * ============================================
 * Database Initialization Script
 * ============================================
 * Creates all database tables
 */

require('dotenv').config();
const sequelize = require('../config/database');
const models = require('../models');

async function initDatabase() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    console.log('🔄 Creating tables...');

    // Force: true will drop existing tables and recreate them
    // Use { force: false, alter: true } for production to preserve data
    await sequelize.sync({ force: true });

    console.log('✅ All tables created successfully');
    console.log('');
    console.log('📋 Created tables:');
    console.log('   - users');
    console.log('   - courses');
    console.log('   - cards');
    console.log('   - study_sessions');
    console.log('   - achievements');
    console.log('   - user_achievements');
    console.log('   - user_courses');
    console.log('');
    console.log('✅ Database initialization complete!');
    console.log('💡 Run "npm run seed" to add sample data');

    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initDatabase();
