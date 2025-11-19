/**
 * Add More Vocabulary Flashcards
 * This script adds additional vocabulary words to the existing course
 */

require('dotenv').config();
const { User, Course, Card } = require('../models');

const additionalVocabulary = [
  {
    question: "What does 'audacious' mean?",
    answer: "Showing a willingness to take surprisingly bold risks",
    hint: "Think of someone who is daringly bold",
    explanation: "Audacious (adjective) - from Latin 'audax' meaning 'bold'. Example: It was an audacious plan to climb the mountain in winter."
  },
  {
    question: "What does 'brevity' mean?",
    answer: "Concise and exact use of words; shortness of time",
    hint: "The quality of being brief",
    explanation: "Brevity (noun) - from Latin 'brevis' meaning 'short'. Example: The brevity of his speech was appreciated by the audience."
  },
  {
    question: "What does 'callous' mean?",
    answer: "Showing or having an insensitive and cruel disregard for others",
    hint: "Emotionally hardened",
    explanation: "Callous (adjective) - from Latin 'callosus' meaning 'thick-skinned'. Example: His callous remarks hurt her feelings deeply."
  },
  {
    question: "What does 'debacle' mean?",
    answer: "A sudden and ignominious failure; a fiasco",
    hint: "A complete disaster or failure",
    explanation: "Debacle (noun) - from French 'débâcle' meaning 'breaking up'. Example: The product launch turned into a complete debacle."
  },
  {
    question: "What does 'eloquence' mean?",
    answer: "Fluent or persuasive speaking or writing",
    hint: "The art of effective speaking",
    explanation: "Eloquence (noun) - from Latin 'eloquentia'. Example: Her eloquence as a speaker made her a sought-after keynote presenter."
  },
  {
    question: "What does 'facetious' mean?",
    answer: "Treating serious issues with deliberately inappropriate humor",
    hint: "Joking at the wrong time",
    explanation: "Facetious (adjective) - from French 'facétieux' meaning 'jesting'. Example: His facetious comment during the meeting was poorly received."
  },
  {
    question: "What does 'garrulous' mean?",
    answer: "Excessively talkative, especially on trivial matters",
    hint: "Someone who talks too much",
    explanation: "Garrulous (adjective) - from Latin 'garrulus' meaning 'chattering'. Example: The garrulous neighbor kept me talking for an hour."
  },
  {
    question: "What does 'haughty' mean?",
    answer: "Arrogantly superior and disdainful",
    hint: "Acting proud and superior",
    explanation: "Haughty (adjective) - from Old French 'haut' meaning 'high'. Example: She had a haughty manner that made her unpopular."
  },
  {
    question: "What does 'impeccable' mean?",
    answer: "In accordance with the highest standards; faultless",
    hint: "Perfect, without flaws",
    explanation: "Impeccable (adjective) - from Latin 'impeccabilis' meaning 'not liable to sin'. Example: His impeccable manners impressed everyone."
  },
  {
    question: "What does 'juxtapose' mean?",
    answer: "To place or deal with close together for contrasting effect",
    hint: "Placing things side by side",
    explanation: "Juxtapose (verb) - from Latin 'juxta' (near) + French 'poser' (to place). Example: The artist juxtaposed light and dark colors for dramatic effect."
  },
  {
    question: "What does 'loquacious' mean?",
    answer: "Tending to talk a great deal; talkative",
    hint: "Very chatty and talkative",
    explanation: "Loquacious (adjective) - from Latin 'loquax' meaning 'talkative'. Example: My loquacious friend can talk for hours about anything."
  },
  {
    question: "What does 'mundane' mean?",
    answer: "Lacking interest or excitement; dull",
    hint: "Ordinary and boring",
    explanation: "Mundane (adjective) - from Latin 'mundanus' meaning 'worldly'. Example: She dreamed of escaping her mundane daily routine."
  },
  {
    question: "What does 'nefarious' mean?",
    answer: "Wicked or criminal; villainous",
    hint: "Evil or wicked",
    explanation: "Nefarious (adjective) - from Latin 'nefarius' meaning 'wicked'. Example: The villain had a nefarious plan to take over the city."
  },
  {
    question: "What does 'ominous' mean?",
    answer: "Giving the impression that something bad will happen",
    hint: "Threatening or foreboding",
    explanation: "Ominous (adjective) - from Latin 'ominosus' meaning 'foreboding'. Example: The dark clouds looked ominous as the storm approached."
  },
  {
    question: "What does 'pensive' mean?",
    answer: "Engaged in deep or serious thought",
    hint: "Thoughtful and reflective",
    explanation: "Pensive (adjective) - from French 'pensif' meaning 'thoughtful'. Example: She had a pensive look on her face as she gazed out the window."
  },
  {
    question: "What does 'quintessential' mean?",
    answer: "Representing the most perfect or typical example",
    hint: "The perfect example of something",
    explanation: "Quintessential (adjective) - from Latin 'quinta essentia' meaning 'fifth essence'. Example: Paris is the quintessential romantic city."
  },
  {
    question: "What does 'reticent' mean?",
    answer: "Not revealing one's thoughts or feelings readily",
    hint: "Reserved and quiet",
    explanation: "Reticent (adjective) - from Latin 'reticere' meaning 'to keep silent'. Example: He was reticent about his personal life."
  },
  {
    question: "What does 'superfluous' mean?",
    answer: "Unnecessary, especially through being more than enough",
    hint: "Extra and not needed",
    explanation: "Superfluous (adjective) - from Latin 'superfluus' meaning 'overflowing'. Example: Most of the decorations were superfluous and could be removed."
  },
  {
    question: "What does 'tangible' mean?",
    answer: "Perceptible by touch; clear and definite; real",
    hint: "Something you can touch or that is real",
    explanation: "Tangible (adjective) - from Latin 'tangibilis' meaning 'that may be touched'. Example: The company showed tangible improvements in sales."
  },
  {
    question: "What does 'ubiquitous' mean?",
    answer: "Present, appearing, or found everywhere",
    hint: "Existing everywhere at once",
    explanation: "Ubiquitous (adjective) - from Latin 'ubique' meaning 'everywhere'. Example: Coffee shops have become ubiquitous in major cities."
  },
  {
    question: "What does 'vivacious' mean?",
    answer: "Attractively lively and animated",
    hint: "Full of life and energy",
    explanation: "Vivacious (adjective) - from Latin 'vivax' meaning 'long-lived, vigorous'. Example: Her vivacious personality made her the life of the party."
  },
  {
    question: "What does 'wary' mean?",
    answer: "Feeling or showing caution about possible dangers or problems",
    hint: "Careful and cautious",
    explanation: "Wary (adjective) - from Old English 'wær' meaning 'prudent'. Example: Be wary of strangers asking for personal information."
  },
  {
    question: "What does 'zealot' mean?",
    answer: "A person who is fanatical and uncompromising in pursuit of ideals",
    hint: "An extreme enthusiast",
    explanation: "Zealot (noun) - from Greek 'zelotes' meaning 'emulator, zealous follower'. Example: He was a zealot about environmental protection."
  },
  {
    question: "What does 'abundant' mean?",
    answer: "Existing or available in large quantities; plentiful",
    hint: "More than enough",
    explanation: "Abundant (adjective) - from Latin 'abundare' meaning 'to overflow'. Example: The region has abundant natural resources."
  },
  {
    question: "What does 'capricious' mean?",
    answer: "Given to sudden and unaccountable changes of mood or behavior",
    hint: "Unpredictable and changeable",
    explanation: "Capricious (adjective) - from Italian 'capriccio' meaning 'sudden start'. Example: The weather has been capricious this spring."
  }
];

async function addMoreVocabulary() {
  try {
    console.log('Adding more vocabulary flashcards...\n');

    // Find the Advanced English Vocabulary course
    const course = await Course.findOne({
      where: {
        title: 'Advanced English Vocabulary'
      }
    });

    if (!course) {
      console.error('❌ Advanced English Vocabulary course not found. Please run createVocabCourse.js first.');
      process.exit(1);
    }

    console.log(`✅ Found course: "${course.title}" (ID: ${course.id})`);

    // Find the course creator (should be user 1)
    const user = await User.findByPk(course.createdBy);

    if (!user) {
      console.error('❌ Course creator not found.');
      process.exit(1);
    }

    console.log(`✅ Course creator: ${user.username}\n`);

    // Create flashcards
    console.log('Creating additional vocabulary flashcards...\n');

    let createdCount = 0;
    for (const word of additionalVocabulary) {
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
        tags: ['vocabulary', 'advanced', 'english']
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

    console.log(`\n✅ Successfully created ${createdCount} additional vocabulary flashcards!`);
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
addMoreVocabulary()
  .then(() => {
    console.log('✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
