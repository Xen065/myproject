/**
 * ============================================
 * Migration: Add frequencyMode Column to Users Table
 * ============================================
 * Adds the frequencyMode column to support flashcard frequency settings
 */

require('dotenv').config();
const sequelize = require('../config/database');
const { User } = require('../models');

async function addFrequencyModeColumn() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    console.log('🔄 Adding frequencyMode column to users table...');

    // Sync only the User model with alter: true to add the new column
    await User.sync({ alter: true });

    console.log('✅ frequencyMode column added successfully');

    // Update existing users to have default 'normal' frequency mode
    const updateCount = await User.update(
      { frequencyMode: 'normal' },
      {
        where: { frequencyMode: null }
      }
    );

    console.log(`✅ Updated ${updateCount[0]} existing users with default frequency mode`);
    console.log('');
    console.log('✅ Migration complete!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

addFrequencyModeColumn();
