/**
 * Backfill Cards for Enrolled Users
 * Creates flashcards for users who are enrolled in courses but don't have cards yet
 */

require('dotenv').config();
const { User, Course, Card, UserCourse } = require('../models');

async function backfillEnrolledCards() {
  try {
    console.log('Starting card backfill for enrolled users...\n');

    // Find all active enrollments
    const enrollments = await UserCourse.findAll({
      where: { isActive: true },
      include: [
        { model: User, as: 'User' },
        { model: Course, as: 'Course' }
      ]
    });

    console.log(`Found ${enrollments.length} active enrollments\n`);

    let totalCardsCreated = 0;

    for (const enrollment of enrollments) {
      const user = enrollment.User;
      const course = enrollment.Course;

      console.log(`\nProcessing: ${user.username} → ${course.title}`);

      // Check if user already has cards for this course
      const existingCards = await Card.count({
        where: {
          userId: user.id,
          courseId: course.id,
          isActive: true
        }
      });

      if (existingCards > 0) {
        console.log(`  ✓ User already has ${existingCards} cards - skipping`);
        continue;
      }

      // Find template cards from course creator
      const templateCards = await Card.findAll({
        where: {
          courseId: course.id,
          userId: course.createdBy,
          isActive: true
        }
      });

      if (templateCards.length === 0) {
        console.log(`  ⚠ No template cards found for this course - skipping`);
        continue;
      }

      // Create cards for this user
      const newCards = [];
      for (const template of templateCards) {
        newCards.push({
          question: template.question,
          answer: template.answer,
          hint: template.hint,
          explanation: template.explanation,
          cardType: template.cardType,
          options: template.options,
          courseId: course.id,
          userId: user.id,
          status: 'new',
          easeFactor: 2.5,
          interval: 0,
          repetitions: 0,
          nextReviewDate: new Date(),
          isActive: true,
          tags: template.tags
        });
      }

      const createdCards = await Card.bulkCreate(newCards);
      console.log(`  ✅ Created ${createdCards.length} cards`);
      totalCardsCreated += createdCards.length;
    }

    console.log(`\n\n📊 Summary:`);
    console.log(`   Total enrollments processed: ${enrollments.length}`);
    console.log(`   Total cards created: ${totalCardsCreated}`);
    console.log(`\n✅ Backfill complete!\n`);

  } catch (error) {
    console.error('❌ Error during backfill:', error);
    throw error;
  }
}

// Run the script
backfillEnrolledCards()
  .then(() => {
    console.log('✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
