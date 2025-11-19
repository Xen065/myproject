/**
 * ============================================
 * Migration: Allow NULL userId for Template Cards
 * ============================================
 * Changes user_id column in cards table to allow NULL values
 * This enables template cards (created by teachers) before student enrollment
 */

require('dotenv').config();
const sequelize = require('../config/database');

async function fixCardUserIdConstraint() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully\n');

    console.log('🔄 Updating cards table to allow NULL user_id...');

    // Using raw SQL to modify the column constraint
    await sequelize.query(`
      ALTER TABLE cards
      ALTER COLUMN user_id DROP NOT NULL;
    `);

    console.log('✅ Successfully updated user_id column to allow NULL\n');

    console.log('✅ Migration complete!');
    console.log('\nTemplate cards can now be created with userId = null');
    console.log('These will be copied to students when they enroll in a course.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('\nError details:', error.message);
    process.exit(1);
  }
}

fixCardUserIdConstraint();
