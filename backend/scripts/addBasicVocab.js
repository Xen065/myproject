/**
 * Add Basic English Vocabulary to Course ID 1
 */

require('dotenv').config();
const { User, Course, Card } = require('../models');

const basicVocabulary = [
  {
    question: "What does 'accept' mean?",
    answer: "To receive or take something offered",
    hint: "To say yes to something",
    explanation: "Accept (verb) - to receive willingly. Example: I accept your invitation to the party."
  },
  {
    question: "What does 'achieve' mean?",
    answer: "To successfully complete or accomplish something",
    hint: "To reach a goal",
    explanation: "Achieve (verb) - to successfully bring about or reach a desired objective. Example: She achieved her goal of becoming a doctor."
  },
  {
    question: "What does 'advantage' mean?",
    answer: "A condition or circumstance that puts one in a favorable position",
    hint: "A beneficial factor",
    explanation: "Advantage (noun) - a favorable or superior position. Example: Having experience gives you an advantage in job interviews."
  },
  {
    question: "What does 'appreciate' mean?",
    answer: "To recognize the value or significance of something",
    hint: "To be grateful for",
    explanation: "Appreciate (verb) - to recognize with gratitude. Example: I appreciate your help with this project."
  },
  {
    question: "What does 'approach' mean?",
    answer: "To come near or closer to something",
    hint: "To move toward",
    explanation: "Approach (verb) - to come near to in distance or time. Example: As we approach the deadline, we need to work faster."
  },
  {
    question: "What does 'benefit' mean?",
    answer: "An advantage or profit gained from something",
    hint: "A positive result",
    explanation: "Benefit (noun) - something that promotes well-being. Example: Exercise has many health benefits."
  },
  {
    question: "What does 'challenge' mean?",
    answer: "A difficult task that tests one's abilities",
    hint: "A demanding situation",
    explanation: "Challenge (noun) - something requiring special effort. Example: Learning a new language is a challenge."
  },
  {
    question: "What does 'communicate' mean?",
    answer: "To share or exchange information",
    hint: "To talk or convey messages",
    explanation: "Communicate (verb) - to share information, ideas, or feelings. Example: We communicate through email and phone calls."
  },
  {
    question: "What does 'consider' mean?",
    answer: "To think carefully about something",
    hint: "To contemplate",
    explanation: "Consider (verb) - to think about carefully. Example: Please consider my proposal before making a decision."
  },
  {
    question: "What does 'contribute' mean?",
    answer: "To give or add something to achieve a result",
    hint: "To help toward a goal",
    explanation: "Contribute (verb) - to give in order to help achieve something. Example: Everyone contributed money for the gift."
  },
  {
    question: "What does 'creative' mean?",
    answer: "Having the ability to create or imagine new things",
    hint: "Imaginative and original",
    explanation: "Creative (adjective) - involving imagination and original ideas. Example: She has a very creative approach to problem-solving."
  },
  {
    question: "What does 'decide' mean?",
    answer: "To make a choice or reach a conclusion",
    hint: "To make up one's mind",
    explanation: "Decide (verb) - to make a final choice. Example: I need to decide which college to attend."
  },
  {
    question: "What does 'develop' mean?",
    answer: "To grow or cause to grow gradually",
    hint: "To improve or expand",
    explanation: "Develop (verb) - to grow or cause to advance. Example: Children develop new skills as they grow."
  },
  {
    question: "What does 'discover' mean?",
    answer: "To find or learn something for the first time",
    hint: "To uncover or find",
    explanation: "Discover (verb) - to find something unexpectedly. Example: Scientists discovered a new planet."
  },
  {
    question: "What does 'effective' mean?",
    answer: "Producing the desired result; successful",
    hint: "Working well",
    explanation: "Effective (adjective) - successful in producing a result. Example: This is an effective method for learning languages."
  },
  {
    question: "What does 'encourage' mean?",
    answer: "To give support or confidence to someone",
    hint: "To motivate or inspire",
    explanation: "Encourage (verb) - to give support or hope. Example: Teachers encourage students to do their best."
  },
  {
    question: "What does 'experience' mean?",
    answer: "Knowledge or skill gained through involvement in events",
    hint: "Learning from doing",
    explanation: "Experience (noun) - practical knowledge or skill. Example: She has years of experience in teaching."
  },
  {
    question: "What does 'explain' mean?",
    answer: "To make something clear or easy to understand",
    hint: "To clarify or describe",
    explanation: "Explain (verb) - to make something clear by describing it. Example: Can you explain how this works?"
  },
  {
    question: "What does 'explore' mean?",
    answer: "To travel through or investigate something new",
    hint: "To discover or examine",
    explanation: "Explore (verb) - to travel in or through an area to learn about it. Example: We explored the city on foot."
  },
  {
    question: "What does 'focus' mean?",
    answer: "To concentrate attention or effort on something",
    hint: "To pay attention to",
    explanation: "Focus (verb) - to direct attention toward something. Example: Try to focus on your studies."
  },
  {
    question: "What does 'generate' mean?",
    answer: "To produce or create something",
    hint: "To cause to exist",
    explanation: "Generate (verb) - to cause something to arise. Example: Solar panels generate electricity."
  },
  {
    question: "What does 'improve' mean?",
    answer: "To make or become better",
    hint: "To enhance or upgrade",
    explanation: "Improve (verb) - to make something better. Example: Practice helps you improve your skills."
  },
  {
    question: "What does 'include' mean?",
    answer: "To contain or have as part of a whole",
    hint: "To comprise or encompass",
    explanation: "Include (verb) - to contain or make part of. Example: The price includes breakfast."
  },
  {
    question: "What does 'indicate' mean?",
    answer: "To show or point out something",
    hint: "To signal or suggest",
    explanation: "Indicate (verb) - to point out or show. Example: The sign indicates the direction to the exit."
  },
  {
    question: "What does 'influence' mean?",
    answer: "The power to affect someone or something",
    hint: "To have an effect on",
    explanation: "Influence (noun/verb) - the capacity to affect someone's actions. Example: Parents have a strong influence on their children."
  },
  {
    question: "What does 'maintain' mean?",
    answer: "To keep something in good condition",
    hint: "To preserve or sustain",
    explanation: "Maintain (verb) - to keep in an existing state. Example: It's important to maintain good health."
  },
  {
    question: "What does 'necessary' mean?",
    answer: "Required or needed; essential",
    hint: "Needed or essential",
    explanation: "Necessary (adjective) - required to be done. Example: Sleep is necessary for good health."
  },
  {
    question: "What does 'obtain' mean?",
    answer: "To get or acquire something",
    hint: "To gain or secure",
    explanation: "Obtain (verb) - to get or acquire. Example: You need to obtain permission before entering."
  },
  {
    question: "What does 'opportunity' mean?",
    answer: "A favorable time or situation for doing something",
    hint: "A chance",
    explanation: "Opportunity (noun) - a good chance for advancement. Example: This job is a great opportunity."
  },
  {
    question: "What does 'organize' mean?",
    answer: "To arrange systematically; to put in order",
    hint: "To arrange or structure",
    explanation: "Organize (verb) - to arrange in a structured way. Example: I need to organize my files."
  },
  {
    question: "What does 'particular' mean?",
    answer: "Specific or individual; special",
    hint: "Specific or certain",
    explanation: "Particular (adjective) - used to single out an individual. Example: I'm looking for a particular book."
  },
  {
    question: "What does 'positive' mean?",
    answer: "Constructive, optimistic, or confident",
    hint: "Good or affirmative",
    explanation: "Positive (adjective) - constructive or confident. Example: She has a positive attitude about life."
  },
  {
    question: "What does 'practice' mean?",
    answer: "To do something repeatedly to improve",
    hint: "Repeated exercise",
    explanation: "Practice (verb/noun) - repeated exercise to acquire skill. Example: Practice makes perfect."
  },
  {
    question: "What does 'prepare' mean?",
    answer: "To make ready for something",
    hint: "To get ready",
    explanation: "Prepare (verb) - to make ready beforehand. Example: I need to prepare for the exam."
  },
  {
    question: "What does 'provide' mean?",
    answer: "To supply or make available",
    hint: "To give or supply",
    explanation: "Provide (verb) - to supply or make available. Example: The company provides health insurance."
  },
  {
    question: "What does 'recognize' mean?",
    answer: "To identify someone or something from previous knowledge",
    hint: "To identify or acknowledge",
    explanation: "Recognize (verb) - to identify from past experience. Example: I didn't recognize you with your new haircut."
  },
  {
    question: "What does 'recommend' mean?",
    answer: "To suggest as being good or suitable",
    hint: "To advise or suggest",
    explanation: "Recommend (verb) - to suggest as worthy. Example: I recommend this restaurant."
  },
  {
    question: "What does 'require' mean?",
    answer: "To need something as necessary",
    hint: "To need or demand",
    explanation: "Require (verb) - to need for a purpose. Example: This job requires experience."
  },
  {
    question: "What does 'respond' mean?",
    answer: "To say or do something as a reaction",
    hint: "To answer or react",
    explanation: "Respond (verb) - to say or act in reply. Example: Please respond to my email."
  },
  {
    question: "What does 'significant' mean?",
    answer: "Important or meaningful",
    hint: "Notable or considerable",
    explanation: "Significant (adjective) - sufficiently great to be worthy of attention. Example: This is a significant achievement."
  }
];

async function addBasicVocab() {
  try {
    console.log('Adding basic vocabulary to English Vocabulary course...\n');

    // Find the English Vocabulary course
    const course = await Course.findByPk(1);

    if (!course) {
      console.error('❌ English Vocabulary course not found.');
      process.exit(1);
    }

    console.log(`✅ Found course: "${course.title}" (ID: ${course.id})`);

    // Update course creator if not set
    if (!course.createdBy) {
      const user = await User.findByPk(1);
      if (user) {
        await course.update({ createdBy: user.id });
        console.log(`✅ Set course creator to: ${user.username}\n`);
      }
    }

    const user = await User.findByPk(course.createdBy || 1);

    console.log('Creating basic vocabulary flashcards...\n');

    let createdCount = 0;
    for (const word of basicVocabulary) {
      const card = await Card.create({
        question: word.question,
        answer: word.answer,
        hint: word.hint,
        explanation: word.explanation,
        courseId: course.id,
        userId: user.id,
        cardType: 'basic',
        status: 'new',
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReviewDate: new Date(),
        isActive: true,
        tags: ['vocabulary', 'basic', 'english']
      });

      createdCount++;
      console.log(`  ${createdCount}. Created: ${word.question.replace("What does '", "").replace("' mean?", "")}`);
    }

    // Update course card counts
    const totalCards = await Card.count({
      where: {
        courseId: course.id,
        userId: user.id,
        isActive: true
      }
    });

    await course.update({
      totalCards: totalCards,
      activeCards: totalCards
    });

    console.log(`\n✅ Successfully created ${createdCount} basic vocabulary flashcards!`);
    console.log(`\n📊 Updated Course Summary:`);
    console.log(`   - Course ID: ${course.id}`);
    console.log(`   - Title: ${course.title}`);
    console.log(`   - Total Cards: ${totalCards}`);
    console.log(`   - New Cards Added: ${createdCount}\n`);

  } catch (error) {
    console.error('❌ Error adding vocabulary:', error);
    throw error;
  }
}

// Run the script
addBasicVocab()
  .then(() => {
    console.log('✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
