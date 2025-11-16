package com.edumaster.data.content

import com.edumaster.data.models.Card

object HistoryContent {

    fun getWorldHistoryCards(): List<Card> {
        val cards = mutableListOf<Card>()

        val historyData = listOf(
            Triple(
                "When did World War I begin?",
                "World War I began on July 28, 1914, triggered by the assassination of Archduke Franz Ferdinand of Austria",
                "Archduke assassination"
            ),
            Triple(
                "Who was the first President of the United States?",
                "George Washington (1789-1797) was the first President of the United States",
                "Father of the nation"
            ),
            Triple(
                "What year did the French Revolution begin?",
                "The French Revolution began in 1789 with the storming of the Bastille on July 14",
                "Bastille Day"
            ),
            Triple(
                "Who was Julius Caesar?",
                "Julius Caesar was a Roman military general and statesman who played a critical role in the fall of the Roman Republic and rise of the Roman Empire",
                "Roman general"
            ),
            Triple(
                "What was the Renaissance?",
                "The Renaissance was a period of European cultural, artistic, political and economic 'rebirth' following the Middle Ages (14th to 17th century)",
                "Cultural rebirth"
            ),
            Triple(
                "When did World War II end?",
                "World War II ended on September 2, 1945, when Japan formally surrendered after atomic bombs were dropped on Hiroshima and Nagasaki",
                "Atomic bombs"
            ),
            Triple(
                "Who wrote the Declaration of Independence?",
                "Thomas Jefferson was the principal author of the Declaration of Independence in 1776",
                "Third US President"
            ),
            Triple(
                "What was the Cold War?",
                "The Cold War (1947-1991) was a period of geopolitical tension between the United States and the Soviet Union and their respective allies",
                "US vs USSR"
            ),
            Triple(
                "Who was Cleopatra?",
                "Cleopatra VII was the last active ruler of ancient Egypt, known for her intelligence, political acumen, and relationships with Julius Caesar and Mark Antony",
                "Egyptian queen"
            ),
            Triple(
                "What was the Industrial Revolution?",
                "The Industrial Revolution (1760-1840) was a period of major industrialization and innovation that transformed largely rural, agrarian societies into industrial and urban ones",
                "Machines replace manual labor"
            ),
            Triple(
                "When did Christopher Columbus reach the Americas?",
                "Christopher Columbus first reached the Americas on October 12, 1492, landing in the Bahamas",
                "1492 voyage"
            ),
            Triple(
                "Who was Napoleon Bonaparte?",
                "Napoleon Bonaparte was a French military and political leader who rose to prominence during the French Revolution and became Emperor of France (1804-1814)",
                "French emperor"
            ),
            Triple(
                "What was the Black Death?",
                "The Black Death was one of the most devastating pandemics in history, peaking in Europe from 1347 to 1353 and killing an estimated 75-200 million people",
                "Medieval plague"
            ),
            Triple(
                "When did India gain independence?",
                "India gained independence from British rule on August 15, 1947",
                "Led by Gandhi"
            ),
            Triple(
                "What was the Silk Road?",
                "The Silk Road was an ancient network of trade routes connecting the East and West, facilitating cultural, commercial, and technological exchange between Asia, Africa, and Europe",
                "Ancient trade route"
            ),
            Triple(
                "Who was Alexander the Great?",
                "Alexander the Great was a king of ancient Macedonia who created one of the largest empires in history, stretching from Greece to India (356-323 BCE)",
                "Macedonian conqueror"
            ),
            Triple(
                "What were the Crusades?",
                "The Crusades were a series of religious wars (1096-1291) sanctioned by the Latin Church in the medieval period, primarily aimed at recovering Jerusalem from Islamic rule",
                "Religious wars"
            ),
            Triple(
                "When did the Berlin Wall fall?",
                "The Berlin Wall fell on November 9, 1989, marking the beginning of German reunification and the end of the Cold War era",
                "End of Cold War"
            ),
            Triple(
                "Who was Martin Luther King Jr.?",
                "Martin Luther King Jr. was an American Baptist minister and civil rights activist who played a key role in the American civil rights movement from the mid-1950s until his assassination in 1968",
                "I Have a Dream"
            ),
            Triple(
                "What was the Magna Carta?",
                "The Magna Carta, signed in 1215, was a charter of rights agreed to by King John of England that established the principle that everyone is subject to the law, even the king",
                "Limited king's power"
            ),
            Triple(
                "When did the American Civil War take place?",
                "The American Civil War took place from 1861 to 1865 between the Union (North) and the Confederacy (South)",
                "North vs South"
            ),
            Triple(
                "Who was Mahatma Gandhi?",
                "Mahatma Gandhi was an Indian lawyer and anti-colonial nationalist who employed nonviolent resistance to lead India to independence from British rule",
                "Father of India"
            ),
            Triple(
                "What was the Treaty of Versailles?",
                "The Treaty of Versailles (1919) was the peace treaty that ended World War I, imposing harsh penalties on Germany",
                "End of WWI"
            ),
            Triple(
                "When did the Roman Empire fall?",
                "The Western Roman Empire fell in 476 CE when the Germanic chieftain Odoacer deposed Emperor Romulus Augustulus",
                "476 CE"
            ),
            Triple(
                "Who discovered penicillin?",
                "Alexander Fleming discovered penicillin in 1928, revolutionizing medicine",
                "Scottish scientist"
            ),
            Triple(
                "What was the Great Depression?",
                "The Great Depression was a severe worldwide economic depression that lasted from 1929 to 1939, beginning with the stock market crash of October 1929",
                "Economic collapse"
            ),
            Triple(
                "Who was Winston Churchill?",
                "Winston Churchill was the British Prime Minister during World War II, known for his leadership and inspirational speeches during Britain's darkest hour",
                "British PM"
            ),
            Triple(
                "What was Apartheid?",
                "Apartheid was a system of institutionalized racial segregation in South Africa from 1948 to 1991",
                "South African segregation"
            ),
            Triple(
                "When did the Space Age begin?",
                "The Space Age began on October 4, 1957, when the Soviet Union launched Sputnik 1, the first artificial satellite",
                "Sputnik launch"
            ),
            Triple(
                "Who was Joan of Arc?",
                "Joan of Arc was a French peasant girl who led the French army to victory during the Hundred Years' War and was later canonized as a saint",
                "French heroine"
            ),
            Triple(
                "What was the Holocaust?",
                "The Holocaust was the genocide of European Jews during World War II, in which approximately six million Jews were systematically murdered by Nazi Germany",
                "Nazi genocide"
            ),
            Triple(
                "When did humans first land on the Moon?",
                "Humans first landed on the Moon on July 20, 1969, during NASA's Apollo 11 mission",
                "Neil Armstrong"
            ),
            Triple(
                "Who was Genghis Khan?",
                "Genghis Khan was the founder and first Great Khan of the Mongol Empire, which became the largest contiguous empire in history after his death",
                "Mongol emperor"
            ),
            Triple(
                "What was the Enlightenment?",
                "The Enlightenment was an 18th-century intellectual movement emphasizing reason, individualism, and skepticism of traditional authority",
                "Age of Reason"
            ),
            Triple(
                "When did the Titanic sink?",
                "The RMS Titanic sank on April 15, 1912, after hitting an iceberg during its maiden voyage",
                "Unsinkable ship"
            ),
            Triple(
                "Who was Vladimir Lenin?",
                "Vladimir Lenin was a Russian revolutionary and political theorist who led the Bolshevik Revolution of 1917 and became the first leader of the Soviet Union",
                "Communist leader"
            ),
            Triple(
                "What was the Ottoman Empire?",
                "The Ottoman Empire was a powerful Islamic empire that controlled much of Southeast Europe, Western Asia, and North Africa from the 14th to early 20th century",
                "Turkish empire"
            ),
            Triple(
                "When did the Vietnam War end?",
                "The Vietnam War ended on April 30, 1975, with the fall of Saigon",
                "Fall of Saigon"
            ),
            Triple(
                "Who was Nelson Mandela?",
                "Nelson Mandela was a South African anti-apartheid revolutionary who served as President of South Africa from 1994 to 1999, becoming the country's first black head of state",
                "Anti-apartheid leader"
            ),
            Triple(
                "What was the Printing Press?",
                "The printing press, invented by Johannes Gutenberg around 1440, revolutionized the production of books and the spread of knowledge",
                "Gutenberg's invention"
            )
        )

        historyData.forEachIndexed { index, (question, answer, hint) ->
            cards.add(Card(
                courseId = 2,
                question = question,
                answer = answer,
                hint = hint,
                category = "History"
            ))
        }

        return cards
    }
}
