/**
 * Create English Vocabulary Course with SM-2 Spaced Repetition
 * This script creates a comprehensive English vocabulary course
 */

require('dotenv').config();
const { User, Course, Card } = require('../models');

const vocabularyWords = [
  {
    question: "What does 'ubiquitous' mean?",
    answer: "Present, appearing, or found everywhere",
    hint: "Think about something that's everywhere",
    explanation: "Ubiquitous (adjective) - from Latin 'ubique' meaning 'everywhere'. Example: Smartphones have become ubiquitous in modern society."
  },
  {
    question: "What does 'eloquent' mean?",
    answer: "Fluent or persuasive in speaking or writing",
    hint: "Related to speaking well",
    explanation: "Eloquent (adjective) - expressing yourself readily, clearly, and effectively. Example: The speaker gave an eloquent speech that moved the audience."
  },
  {
    question: "What does 'ephemeral' mean?",
    answer: "Lasting for a very short time",
    hint: "Think of something temporary",
    explanation: "Ephemeral (adjective) - from Greek 'ephemeros' meaning 'lasting only a day'. Example: The beauty of cherry blossoms is ephemeral, lasting only a few weeks."
  },
  {
    question: "What does 'meticulous' mean?",
    answer: "Showing great attention to detail; very careful and precise",
    hint: "Someone who pays close attention to small details",
    explanation: "Meticulous (adjective) - from Latin 'metus' meaning 'fear'. Example: She was meticulous in her research, checking every source twice."
  },
  {
    question: "What does 'pragmatic' mean?",
    answer: "Dealing with things sensibly and realistically in a practical way",
    hint: "Practical rather than idealistic",
    explanation: "Pragmatic (adjective) - from Greek 'pragma' meaning 'deed, act'. Example: We need to take a pragmatic approach to solving this problem."
  },
  {
    question: "What does 'resilient' mean?",
    answer: "Able to recover quickly from difficulties; tough",
    hint: "Bouncing back from adversity",
    explanation: "Resilient (adjective) - from Latin 'resilire' meaning 'to rebound'. Example: Children are often more resilient than adults when facing challenges."
  },
  {
    question: "What does 'ambiguous' mean?",
    answer: "Open to more than one interpretation; unclear or inexact",
    hint: "Not clear or having multiple meanings",
    explanation: "Ambiguous (adjective) - from Latin 'ambiguus' meaning 'doubtful'. Example: His ambiguous statement left everyone confused about his true intentions."
  },
  {
    question: "What does 'benevolent' mean?",
    answer: "Well-meaning and kindly; showing goodwill",
    hint: "Kind and generous",
    explanation: "Benevolent (adjective) - from Latin 'bene' (well) + 'volens' (wishing). Example: The benevolent millionaire donated half his fortune to charity."
  },
  {
    question: "What does 'candid' mean?",
    answer: "Truthful and straightforward; frank",
    hint: "Honest and direct",
    explanation: "Candid (adjective) - from Latin 'candidus' meaning 'white, pure'. Example: I appreciate your candid feedback on my presentation."
  },
  {
    question: "What does 'diligent' mean?",
    answer: "Having or showing care and conscientiousness in one's work or duties",
    hint: "Hardworking and thorough",
    explanation: "Diligent (adjective) - from Latin 'diligere' meaning 'to value highly, take delight in'. Example: Her diligent study habits led to excellent grades."
  },
  {
    question: "What does 'exemplary' mean?",
    answer: "Serving as a desirable model; representing the best of its kind",
    hint: "Outstanding, serving as an example",
    explanation: "Exemplary (adjective) - from Latin 'exemplum' meaning 'example'. Example: His exemplary behavior earned him a leadership position."
  },
  {
    question: "What does 'frugal' mean?",
    answer: "Sparing or economical with regard to money or food",
    hint: "Careful with spending money",
    explanation: "Frugal (adjective) - from Latin 'frux' meaning 'fruit, value'. Example: Living a frugal lifestyle helped her save enough money to buy a house."
  },
  {
    question: "What does 'gregarious' mean?",
    answer: "Fond of company; sociable",
    hint: "Someone who enjoys being around people",
    explanation: "Gregarious (adjective) - from Latin 'grex' meaning 'flock'. Example: His gregarious nature made him popular at every party."
  },
  {
    question: "What does 'imminent' mean?",
    answer: "About to happen; impending",
    hint: "Something that will happen very soon",
    explanation: "Imminent (adjective) - from Latin 'imminere' meaning 'to overhang, be near'. Example: Dark clouds warned of an imminent storm."
  },
  {
    question: "What does 'innovative' mean?",
    answer: "Featuring new methods; advanced and original",
    hint: "Creative and new",
    explanation: "Innovative (adjective) - from Latin 'innovare' meaning 'to renew, restore'. Example: The company's innovative approach revolutionized the industry."
  },
  {
    question: "What does 'lucid' mean?",
    answer: "Expressed clearly; easy to understand",
    hint: "Clear and easy to comprehend",
    explanation: "Lucid (adjective) - from Latin 'lucidus' meaning 'light, clear'. Example: The professor's lucid explanation helped students grasp the complex concept."
  },
  {
    question: "What does 'nostalgia' mean?",
    answer: "A sentimental longing for the past",
    hint: "Missing the past",
    explanation: "Nostalgia (noun) - from Greek 'nostos' (return home) + 'algos' (pain). Example: Looking at old photos filled him with nostalgia for his childhood."
  },
  {
    question: "What does 'obscure' mean?",
    answer: "Not discovered or known about; uncertain",
    hint: "Hidden, unclear, or not well-known",
    explanation: "Obscure (adjective) - from Latin 'obscurus' meaning 'dark, dim'. Example: The meaning of the ancient text remains obscure to scholars."
  },
  {
    question: "What does 'persuasive' mean?",
    answer: "Good at convincing someone to do or believe something",
    hint: "Able to convince others",
    explanation: "Persuasive (adjective) - from Latin 'persuadere' meaning 'to convince'. Example: Her persuasive arguments won over the skeptical audience."
  },
  {
    question: "What does 'quaint' mean?",
    answer: "Attractively unusual or old-fashioned",
    hint: "Charmingly old-fashioned",
    explanation: "Quaint (adjective) - from Old French 'cointe' meaning 'clever, knowing'. Example: We stayed in a quaint cottage in the countryside."
  },
  {
    question: "What does 'redundant' mean?",
    answer: "Not or no longer needed or useful; superfluous",
    hint: "Unnecessary or repetitive",
    explanation: "Redundant (adjective) - from Latin 'redundare' meaning 'to overflow'. Example: The extra information in the report was redundant and could be removed."
  },
  {
    question: "What does 'serene' mean?",
    answer: "Calm, peaceful, and untroubled",
    hint: "Peaceful and calm",
    explanation: "Serene (adjective) - from Latin 'serenus' meaning 'clear, unclouded'. Example: The serene lake reflected the mountains perfectly."
  },
  {
    question: "What does 'tenacious' mean?",
    answer: "Tending to keep a firm hold; persistent",
    hint: "Holding on firmly, not giving up",
    explanation: "Tenacious (adjective) - from Latin 'tenax' meaning 'holding fast'. Example: Her tenacious spirit helped her overcome many obstacles."
  },
  {
    question: "What does 'versatile' mean?",
    answer: "Able to adapt or be adapted to many different functions",
    hint: "Flexible and adaptable",
    explanation: "Versatile (adjective) - from Latin 'versatilis' meaning 'turning, revolving'. Example: A versatile actor can play many different types of roles."
  },
  {
    question: "What does 'whimsical' mean?",
    answer: "Playfully quaint or fanciful, especially in an appealing way",
    hint: "Playful and imaginative",
    explanation: "Whimsical (adjective) - from 'whim' meaning 'sudden idea'. Example: The artist's whimsical illustrations delighted children and adults alike."
  },
  {
    question: "What does 'zealous' mean?",
    answer: "Having or showing great energy or enthusiasm in pursuit of a cause",
    hint: "Very enthusiastic and passionate",
    explanation: "Zealous (adjective) - from Greek 'zelos' meaning 'zeal, ardor'. Example: She was a zealous advocate for environmental protection."
  },
  {
    question: "What does 'aesthetic' mean?",
    answer: "Concerned with beauty or the appreciation of beauty",
    hint: "Related to beauty or art",
    explanation: "Aesthetic (adjective) - from Greek 'aisthetos' meaning 'perceptible'. Example: The building has great aesthetic appeal with its modern design."
  },
  {
    question: "What does 'comprehensive' mean?",
    answer: "Complete; including all or nearly all elements or aspects",
    hint: "Thorough and complete",
    explanation: "Comprehensive (adjective) - from Latin 'comprehendere' meaning 'to grasp'. Example: The book provides a comprehensive overview of world history."
  },
  {
    question: "What does 'cynical' mean?",
    answer: "Believing that people are motivated purely by self-interest; distrustful",
    hint: "Pessimistic about human nature",
    explanation: "Cynical (adjective) - from Greek 'kynikos' meaning 'dog-like'. Example: After years in politics, he became cynical about politicians' promises."
  },
  {
    question: "What does 'eloquence' mean?",
    answer: "Fluent or persuasive speaking or writing",
    hint: "The quality of being eloquent",
    explanation: "Eloquence (noun) - the ability to speak or write effectively. Example: Her eloquence as a speaker made her a sought-after keynote presenter."
  }
];

async function createVocabCourse() {
  try {
    console.log('Starting English Vocabulary Course creation...\n');

    // Find the first user (or you can specify a particular user)
    const user = await User.findOne();

    if (!user) {
      console.error('❌ No users found. Please create a user first.');
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.username}`);

    // Create the English Vocabulary course
    const course = await Course.create({
      title: 'Advanced English Vocabulary',
      description: 'Master advanced English vocabulary through spaced repetition. This course uses the SM-2 algorithm to optimize your learning and ensure long-term retention of important words.',
      category: 'Language',
      difficulty: 'intermediate',
      icon: '📚',
      color: '#4CAF50',
      language: 'English',
      isFeatured: true,
      isPublished: true,
      isFree: true,
      createdBy: user.id
    });

    console.log(`✅ Created course: "${course.title}"\n`);

    // Create flashcards for each vocabulary word
    console.log('Creating vocabulary flashcards...\n');

    let createdCount = 0;
    for (const word of vocabularyWords) {
      const card = await Card.create({
        question: word.question,
        answer: word.answer,
        hint: word.hint,
        explanation: word.explanation,
        courseId: course.id,
        userId: user.id,
        cardType: 'basic',
        status: 'new',
        easeFactor: 2.5,  // SM-2 default
        interval: 0,       // SM-2 default
        repetitions: 0,    // SM-2 default
        nextReviewDate: new Date(), // Available for review immediately
        isActive: true,
        tags: ['vocabulary', 'advanced', 'english']
      });

      createdCount++;
      console.log(`  ${createdCount}. Created: ${word.question.replace("What does '", "").replace("' mean?", "")}`);
    }

    // Update course card counts
    await course.update({
      totalCards: vocabularyWords.length,
      activeCards: vocabularyWords.length
    });

    console.log(`\n✅ Successfully created ${createdCount} vocabulary flashcards!`);
    console.log(`\n📊 Course Summary:`);
    console.log(`   - Course ID: ${course.id}`);
    console.log(`   - Title: ${course.title}`);
    console.log(`   - Category: ${course.category}`);
    console.log(`   - Difficulty: ${course.difficulty}`);
    console.log(`   - Total Cards: ${vocabularyWords.length}`);
    console.log(`   - Featured: Yes`);
    console.log(`\n🎓 The SM-2 spaced repetition algorithm will:`);
    console.log(`   - Schedule reviews based on your performance`);
    console.log(`   - Increase intervals for well-known words`);
    console.log(`   - Review difficult words more frequently`);
    console.log(`   - Optimize long-term retention\n`);

  } catch (error) {
    console.error('❌ Error creating vocabulary course:', error);
    throw error;
  }
}

// Run the script
createVocabCourse()
  .then(() => {
    console.log('✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
