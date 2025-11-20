/**
 * ============================================
 * Migration Script: Add allow_multiple_correct Column
 * ============================================
 * This script adds the allow_multiple_correct column to the cards table
 * to support unified MCQ type with both single and multiple correct answers.
 *
 * Run this script: node backend/scripts/addAllowMultipleCorrectColumn.js
 */

require('dotenv').config();
const sequelize = require('../config/database');

async function addAllowMultipleCorrectColumn() {
  try {
    console.log('🔄 Starting migration: Adding allow_multiple_correct column...');

    // Check if column already exists
    const [results] = await sequelize.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'cards'
      AND column_name = 'allow_multiple_correct';
    `);

    if (results.length > 0) {
      console.log('✅ Column allow_multiple_correct already exists. Skipping migration.');
      return;
    }

    // Add the new column
    await sequelize.query(`
      ALTER TABLE cards
      ADD COLUMN allow_multiple_correct BOOLEAN DEFAULT false;
    `);

    console.log('✅ Successfully added allow_multiple_correct column to cards table');

    // Update existing multi_select type questions to use the new field
    const [updateResult] = await sequelize.query(`
      UPDATE cards
      SET allow_multiple_correct = true
      WHERE card_type = 'multi_select';
    `);

    console.log(`✅ Updated ${updateResult.rowCount || 0} existing multi_select questions`);

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run the migration
addAllowMultipleCorrectColumn();
