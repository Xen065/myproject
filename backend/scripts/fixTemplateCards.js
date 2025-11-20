/**
 * Fix Template Cards - Update userId from null to course.createdBy
 */

require('dotenv').config();
const { Card, Course } = require('../models');

async function fixTemplateCards() {
  try {
    console.log('Fixing template cards...\n');

    // Find all cards with userId = null
    const nullCards = await Card.findAll({
      where: { userId: null },
      include: [{ model: Course, as: 'course' }]
    });

    console.log(`Found ${nullCards.length} cards with userId = null\n`);

    let updated = 0;
    for (const card of nullCards) {
      if (card.course && card.course.createdBy) {
        await card.update({ userId: card.course.createdBy });
        console.log(`✓ Updated card "${card.question.substring(0, 50)}..." for course "${card.course.title}"`);
        updated++;
      } else {
        console.log(`⚠ Skipped card "${card.question.substring(0, 50)}..." - no course creator`);
      }
    }

    console.log(`\n✅ Fixed ${updated} template cards`);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

fixTemplateCards()
  .then(() => {
    console.log('\n✅ Script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
