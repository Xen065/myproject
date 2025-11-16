package com.edumaster.data.content

import com.edumaster.data.models.Card
import com.edumaster.data.models.Course
import java.util.Date

object ContentData {

    fun getAllCourses(): List<Course> {
        return listOf(
            // Owned Courses
            Course(
                id = 1,
                name = "English Vocabulary Builder",
                description = "Master 500+ advanced English words to enhance your communication skills and excel in competitive exams like IELTS, TOEFL, GRE, and SAT",
                category = "Vocabulary",
                icon = "📖",
                isOwned = true,
                totalCards = 100,
                cardsCompleted = 12,
                cardsDue = 15,
                rating = 4.8f,
                totalRatings = 234
            ),
            Course(
                id = 2,
                name = "World History Essentials",
                description = "Explore major historical events, civilizations, and figures from ancient times to the modern era. Perfect for students and history enthusiasts",
                category = "History",
                icon = "📜",
                isOwned = true,
                totalCards = 80,
                cardsCompleted = 8,
                cardsDue = 12,
                rating = 4.7f,
                totalRatings = 156
            ),
            Course(
                id = 3,
                name = "General Science Fundamentals",
                description = "Essential science concepts covering Physics, Chemistry, and Biology for competitive exams and general knowledge",
                category = "Science",
                icon = "🔬",
                isOwned = true,
                totalCards = 90,
                cardsCompleted = 5,
                cardsDue = 10,
                rating = 4.9f,
                totalRatings = 189
            ),

            // Premium Courses (For Purchase)
            Course(
                id = 4,
                name = "Python Programming Basics",
                description = "Learn Python from scratch with 60+ coding concepts, syntax, and practice problems. Perfect for beginners",
                category = "Programming",
                icon = "🐍",
                price = 500,
                isOwned = false,
                totalCards = 60,
                rating = 4.9f,
                totalRatings = 412
            ),
            Course(
                id = 5,
                name = "Mathematics Mastery",
                description = "Master algebra, geometry, trigonometry, and calculus concepts with step-by-step solutions and practice problems",
                category = "Math",
                icon = "➗",
                price = 450,
                isOwned = false,
                totalCards = 75,
                rating = 4.8f,
                totalRatings = 298
            ),
            Course(
                id = 6,
                name = "World Geography Pro",
                description = "Learn countries, capitals, flags, major landmarks, and geographical features across all continents",
                category = "Geography",
                icon = "🗺️",
                price = 350,
                isOwned = false,
                totalCards = 70,
                rating = 4.6f,
                totalRatings = 201
            ),
            Course(
                id = 7,
                name = "Spanish for Beginners",
                description = "Start your Spanish journey with essential vocabulary, phrases, and grammar fundamentals",
                category = "Languages",
                icon = "🇪🇸",
                price = 550,
                isOwned = false,
                totalCards = 65,
                rating = 4.7f,
                totalRatings = 178
            ),
            Course(
                id = 8,
                name = "Business Economics",
                description = "Understand key economic concepts, market structures, and business principles for competitive exams",
                category = "Economics",
                icon = "💼",
                price = 400,
                isOwned = false,
                totalCards = 55,
                rating = 4.5f,
                totalRatings = 156
            )
        )
    }

    fun getAllCards(): List<Card> {
        return getEnglishVocabularyCards() +
                HistoryContent.getWorldHistoryCards() +
                ScienceContent.getGeneralScienceCards() +
                getPremiumCourseCards()
    }

    // Sample cards for premium courses (for preview)
    private fun getPremiumCourseCards(): List<Card> {
        val cards = mutableListOf<Card>()

        // Python Programming (5 sample cards)
        cards.add(Card(courseId = 4, question = "What is a variable in Python?", answer = "A variable is a container for storing data values. In Python, you don't need to declare the variable type.", hint = "Data container", category = "Programming"))
        cards.add(Card(courseId = 4, question = "How do you print 'Hello World' in Python?", answer = "print('Hello World')", hint = "print() function", category = "Programming"))
        cards.add(Card(courseId = 4, question = "What is a list in Python?", answer = "A list is an ordered, mutable collection that can hold items of different types, created using square brackets []", hint = "Ordered collection", category = "Programming"))
        cards.add(Card(courseId = 4, question = "What is the difference between '==' and 'is' in Python?", answer = "'==' checks if values are equal, while 'is' checks if two variables point to the same object in memory", hint = "Value vs identity", category = "Programming"))
        cards.add(Card(courseId = 4, question = "What is a function in Python?", answer = "A function is a reusable block of code that performs a specific task, defined using the 'def' keyword", hint = "Reusable code block", category = "Programming"))

        // Mathematics (5 sample cards)
        cards.add(Card(courseId = 5, question = "What is the Pythagorean theorem?", answer = "a² + b² = c² where c is the hypotenuse of a right triangle and a and b are the other two sides", hint = "Right triangle formula", category = "Math"))
        cards.add(Card(courseId = 5, question = "What is the quadratic formula?", answer = "x = (-b ± √(b² - 4ac)) / 2a for equation ax² + bx + c = 0", hint = "Solves ax² + bx + c", category = "Math"))
        cards.add(Card(courseId = 5, question = "What is the value of π (pi)?", answer = "π ≈ 3.14159... (the ratio of a circle's circumference to its diameter)", hint = "Circle constant", category = "Math"))
        cards.add(Card(courseId = 5, question = "What is the slope formula?", answer = "m = (y₂ - y₁) / (x₂ - x₁) where m is the slope and (x₁,y₁) and (x₂,y₂) are two points", hint = "Rise over run", category = "Math"))
        cards.add(Card(courseId = 5, question = "What is the area of a circle?", answer = "A = πr² where r is the radius", hint = "Pi times radius squared", category = "Math"))

        // Geography (5 sample cards)
        cards.add(Card(courseId = 6, question = "What is the capital of France?", answer = "Paris", hint = "City of Lights", category = "Geography"))
        cards.add(Card(courseId = 6, question = "What is the largest ocean on Earth?", answer = "Pacific Ocean", hint = "Covers about 30% of Earth's surface", category = "Geography"))
        cards.add(Card(courseId = 6, question = "What is the tallest mountain in the world?", answer = "Mount Everest (8,849 meters or 29,032 feet)", hint = "In the Himalayas", category = "Geography"))
        cards.add(Card(courseId = 6, question = "What is the longest river in the world?", answer = "Nile River (approximately 6,650 km)", hint = "Flows through Egypt", category = "Geography"))
        cards.add(Card(courseId = 6, question = "How many continents are there?", answer = "Seven: Africa, Antarctica, Asia, Europe, North America, Oceania (Australia), and South America", hint = "Seven landmasses", category = "Geography"))

        // Spanish (5 sample cards)
        cards.add(Card(courseId = 7, question = "How do you say 'Hello' in Spanish?", answer = "Hola", hint = "Greeting", category = "Languages"))
        cards.add(Card(courseId = 7, question = "How do you say 'Thank you' in Spanish?", answer = "Gracias", hint = "Show appreciation", category = "Languages"))
        cards.add(Card(courseId = 7, question = "What does 'Buenos días' mean?", answer = "Good morning", hint = "Morning greeting", category = "Languages"))
        cards.add(Card(courseId = 7, question = "How do you say 'Goodbye' in Spanish?", answer = "Adiós", hint = "Farewell", category = "Languages"))
        cards.add(Card(courseId = 7, question = "What does '¿Cómo estás?' mean?", answer = "How are you?", hint = "Asking about wellbeing", category = "Languages"))

        // Economics (5 sample cards)
        cards.add(Card(courseId = 8, question = "What is GDP?", answer = "GDP (Gross Domestic Product) is the total monetary value of all goods and services produced within a country in a specific time period", hint = "Country's economic output", category = "Economics"))
        cards.add(Card(courseId = 8, question = "What is supply and demand?", answer = "Supply and demand is an economic model where the price of a product is determined by the relationship between its availability (supply) and consumers' desire for it (demand)", hint = "Price determination", category = "Economics"))
        cards.add(Card(courseId = 8, question = "What is inflation?", answer = "Inflation is the rate at which the general level of prices for goods and services rises, eroding purchasing power", hint = "Rising prices", category = "Economics"))
        cards.add(Card(courseId = 8, question = "What is a monopoly?", answer = "A monopoly exists when a specific person or enterprise is the only supplier of a particular good or service", hint = "Single seller", category = "Economics"))
        cards.add(Card(courseId = 8, question = "What is opportunity cost?", answer = "Opportunity cost is the loss of potential gain from other alternatives when one alternative is chosen", hint = "Trade-off", category = "Economics"))

        return cards
    }

    // COURSE 1: English Vocabulary (100 cards)
    private fun getEnglishVocabularyCards(): List<Card> {
        val cards = mutableListOf<Card>()
        val vocabData = listOf(
            Triple("Ephemeral", "Lasting for a very short time; transitory", "Think of something temporary"),
            Triple("Ubiquitous", "Present, appearing, or found everywhere", "Something very common"),
            Triple("Eloquent", "Fluent and persuasive in speaking or writing", "Skilled speaker"),
            Triple("Ambiguous", "Open to more than one interpretation; unclear", "Has multiple meanings"),
            Triple("Benevolent", "Well-meaning and kindly", "Kind and charitable"),
            Triple("Candid", "Truthful and straightforward; frank", "Honest and direct"),
            Triple("Diligent", "Having or showing care in one's work or duties", "Hardworking"),
            Triple("Euphoria", "A feeling of intense happiness and excitement", "Extreme joy"),
            Triple("Frugal", "Sparing or economical; avoiding waste", "Thrifty"),
            Triple("Gregarious", "Fond of company; sociable", "Outgoing person"),
            Triple("Meticulous", "Showing great attention to detail; very careful", "Extremely precise"),
            Triple("Nostalgic", "A sentimental longing for the past", "Missing old times"),
            Triple("Optimistic", "Hopeful and confident about the future", "Positive outlook"),
            Triple("Pragmatic", "Dealing with things sensibly and realistically", "Practical approach"),
            Triple("Resilient", "Able to withstand or recover quickly from difficulties", "Bounces back"),
            Triple("Verbose", "Using more words than needed; wordy", "Too talkative"),
            Triple("Zealous", "Having great energy or enthusiasm", "Very passionate"),
            Triple("Adversity", "Difficulties; misfortune", "Hard times"),
            Triple("Contemplate", "To think about carefully; consider", "Deep thought"),
            Triple("Deliberate", "Done consciously and intentionally", "On purpose"),
            Triple("Tenacious", "Not easily letting go; persistent", "Very determined"),
            Triple("Articulate", "Having or showing clear expression", "Well-spoken"),
            Triple("Brevity", "Concise and exact use of words", "Shortness"),
            Triple("Compassion", "Sympathetic concern for others' suffering", "Deep empathy"),
            Triple("Exquisite", "Extremely beautiful and delicate", "Refined beauty"),
            Triple("Integrity", "Quality of being honest and having strong moral principles", "Strong ethics"),
            Triple("Eloquence", "Fluent or persuasive speaking or writing", "Powerful speech"),
            Triple("Paradox", "A seemingly contradictory statement that may be true", "Contradictory truth"),
            Triple("Serendipity", "The occurrence of events by chance in a happy way", "Lucky accident"),
            Triple("Vindicate", "Clear of blame or suspicion; prove to be right", "Prove innocent"),
            Triple("Alacrity", "Brisk and cheerful readiness", "Eager willingness"),
            Triple("Benign", "Gentle and kindly; not harmful", "Harmless"),
            Triple("Connoisseur", "An expert judge in matters of taste", "Expert evaluator"),
            Triple("Disparate", "Essentially different in kind; incomparable", "Very different"),
            Triple("Eloquence", "Fluent or persuasive in speaking or writing", "Articulate expression"),
            Triple("Facetious", "Treating serious issues with inappropriate humor", "Joking at wrong time"),
            Triple("Grandiose", "Impressive or magnificent in appearance", "Grand scale"),
            Triple("Hypothesis", "A proposed explanation for a phenomenon", "Scientific guess"),
            Triple("Immaculate", "Perfectly clean or neat; without fault", "Spotless"),
            Triple("Juxtapose", "Place close together for contrasting effect", "Side by side comparison"),
            Triple("Laudable", "Deserving praise and commendation", "Praiseworthy"),
            Triple("Magnanimous", "Generous or forgiving toward a rival", "Noble generosity"),
            Triple("Novice", "A person new to an activity", "Beginner"),
            Triple("Obsolete", "No longer in use; out of date", "Outdated"),
            Triple("Prudent", "Acting with care and thought for the future", "Wise and careful"),
            Triple("Quandary", "A state of perplexity or uncertainty", "Difficult dilemma"),
            Triple("Reciprocate", "Respond to an action by making a corresponding one", "Return the favor"),
            Triple("Scrutinize", "Examine closely and thoroughly", "Inspect carefully"),
            Triple("Tangible", "Perceptible by touch; clear and definite", "Real and touchable"),
            Triple("Unanimous", "Fully in agreement", "Complete agreement"),
            Triple("Versatile", "Able to adapt or be adapted to many functions", "Multi-talented"),
            Triple("Whimsical", "Playfully quaint or fanciful", "Playful and quirky"),
            Triple("Exemplary", "Serving as a desirable model; excellent", "Perfect example"),
            Triple("Yearning", "A feeling of intense longing", "Deep desire"),
            Triple("Zealot", "A person with fanatical enthusiasm", "Extreme enthusiast"),
            Triple("Aberration", "A departure from what is normal or expected", "Deviation"),
            Triple("Cacophony", "A harsh, discordant mixture of sounds", "Loud noise"),
            Triple("Dexterity", "Skill in performing tasks with hands", "Manual skill"),
            Triple("Ebullient", "Cheerful and full of energy", "Bubbling enthusiasm"),
            Triple("Fallacious", "Based on a mistaken belief; deceptive", "Misleading logic"),
            Triple("Garrulous", "Excessively talkative on trivial matters", "Very chatty"),
            Triple("Harbinger", "A person or thing that announces the approach", "Herald"),
            Triple("Impeccable", "In accordance with standards; flawless", "Without fault"),
            Triple("Jovial", "Cheerful and friendly", "Jolly"),
            Triple("Keen", "Having sharp judgment; eager", "Sharp and eager"),
            Triple("Lethargic", "Sluggish and apathetic; lacking energy", "Very tired"),
            Triple("Mundane", "Lacking interest or excitement; ordinary", "Boring routine"),
            Triple("Nonchalant", "Feeling or appearing casually calm", "Relaxed"),
            Triple("Ominous", "Giving the impression that something bad will happen", "Threatening"),
            Triple("Pensive", "Engaged in deep or serious thought", "Thoughtful"),
            Triple("Querulous", "Complaining in a petulant manner", "Whiny"),
            Triple("Rambunctious", "Uncontrollably exuberant; boisterous", "Wild and noisy"),
            Triple("Succinct", "Brief and clearly expressed", "Concise"),
            Triple("Trepidation", "A feeling of fear about something", "Anxiety"),
            Triple("Urbane", "Suave, courteous, and refined", "Sophisticated"),
            Triple("Vehement", "Showing strong feeling; forceful", "Passionate"),
            Triple("Wary", "Feeling or showing caution", "Careful"),
            Triple("Xenophobia", "Dislike of people from other countries", "Fear of foreigners"),
            Triple("Yoke", "A wooden crosspiece for oxen; burden", "Heavy burden"),
            Triple("Zeal", "Great energy or enthusiasm", "Passion"),
            Triple("Aesthetic", "Concerned with beauty or appreciation of beauty", "Artistic beauty"),
            Triple("Belligerent", "Hostile and aggressive", "Ready to fight"),
            Triple("Copious", "Abundant in supply or quantity", "Plentiful"),
            Triple("Dogmatic", "Inclined to lay down principles as incontrovertibly true", "Stubborn beliefs"),
            Triple("Eclectic", "Deriving ideas from various sources", "Mixed styles"),
            Triple("Fervid", "Intensely enthusiastic or passionate", "Very passionate"),
            Triple("Gratuitous", "Uncalled for; lacking good reason", "Unnecessary"),
            Triple("Haughty", "Arrogantly superior and disdainful", "Proud and snobbish"),
            Triple("Indolent", "Wanting to avoid activity; lazy", "Very lazy"),
            Triple("Judicious", "Having good judgment; wise", "Wise decision"),
            Triple("Kindle", "Light or set on fire; arouse interest", "Spark"),
            Triple("Lucid", "Expressed clearly; easy to understand", "Crystal clear"),
            Triple("Malleable", "Able to be shaped; easily influenced", "Flexible"),
            Triple("Nebulous", "Unclear or vague", "Hazy"),
            Triple("Opulent", "Ostentatiously rich and luxurious", "Very wealthy"),
            Triple("Pernicious", "Having a harmful effect", "Destructive"),
            Triple("Quintessential", "Representing the most perfect example", "Perfect example"),
            Triple("Robust", "Strong and healthy; vigorous", "Strong"),
            Triple("Sagacious", "Having good judgment; wise", "Very wise"),
            Triple("Taciturn", "Reserved or uncommunicative in speech", "Quiet")
        )

        vocabData.forEachIndexed { index, (word, definition, hint) ->
            cards.add(Card(
                courseId = 1,
                question = "What is the meaning of '$word'?",
                answer = definition,
                hint = hint,
                category = "Vocabulary"
            ))
        }

        return cards
    }
}
