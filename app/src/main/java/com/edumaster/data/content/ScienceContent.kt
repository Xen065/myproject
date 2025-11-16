package com.edumaster.data.content

import com.edumaster.data.models.Card

object ScienceContent {

    fun getGeneralScienceCards(): List<Card> {
        val cards = mutableListOf<Card>()

        val scienceData = listOf(
            // Physics (25 cards)
            Triple(
                "What is Newton's First Law of Motion?",
                "An object at rest stays at rest and an object in motion stays in motion with the same speed and in the same direction unless acted upon by an unbalanced force (Law of Inertia)",
                "Law of Inertia"
            ),
            Triple(
                "What is the speed of light?",
                "The speed of light in vacuum is approximately 299,792,458 meters per second (about 300,000 km/s or 186,000 miles/s)",
                "3 x 10^8 m/s"
            ),
            Triple(
                "What is gravity?",
                "Gravity is a force of attraction between all objects with mass. On Earth, it gives weight to physical objects and causes them to fall toward the ground when dropped",
                "Force of attraction"
            ),
            Triple(
                "What is the formula for kinetic energy?",
                "KE = 1/2 × m × v² where m is mass and v is velocity",
                "Half mass times velocity squared"
            ),
            Triple(
                "What are the three states of matter?",
                "The three common states of matter are solid, liquid, and gas. (Plasma is sometimes considered a fourth state)",
                "Solid, liquid, gas"
            ),
            Triple(
                "What is electric current?",
                "Electric current is the flow of electric charge, typically measured in amperes (A). It flows from positive to negative terminal",
                "Flow of electrons"
            ),
            Triple(
                "What is Ohm's Law?",
                "Ohm's Law states that V = I × R, where V is voltage, I is current, and R is resistance",
                "V equals I times R"
            ),
            Triple(
                "What is the difference between AC and DC current?",
                "AC (Alternating Current) reverses direction periodically, while DC (Direct Current) flows in one direction constantly",
                "Direction of flow"
            ),
            Triple(
                "What is refraction?",
                "Refraction is the bending of light as it passes from one medium to another of different density",
                "Bending of light"
            ),
            Triple(
                "What is the law of conservation of energy?",
                "Energy cannot be created or destroyed, only transformed from one form to another",
                "Energy is conserved"
            ),

            // Chemistry (30 cards)
            Triple(
                "What is the periodic table?",
                "The periodic table is a tabular arrangement of chemical elements organized by atomic number, electron configuration, and recurring chemical properties",
                "Element organization"
            ),
            Triple(
                "What is an atom?",
                "An atom is the smallest unit of matter that retains the properties of an element, consisting of a nucleus (protons and neutrons) surrounded by electrons",
                "Smallest unit"
            ),
            Triple(
                "What is pH?",
                "pH is a measure of acidity or alkalinity of a solution, ranging from 0 (most acidic) to 14 (most alkaline), with 7 being neutral",
                "Acidity measure"
            ),
            Triple(
                "What is photosynthesis?",
                "Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to produce glucose (food) and oxygen",
                "Plants make food"
            ),
            Triple(
                "What is the chemical formula for water?",
                "H₂O - two hydrogen atoms bonded to one oxygen atom",
                "Two hydrogen, one oxygen"
            ),
            Triple(
                "What is an acid?",
                "An acid is a substance that donates hydrogen ions (H+) in solution and has a pH less than 7",
                "Donates H+ ions"
            ),
            Triple(
                "What is a base?",
                "A base is a substance that accepts hydrogen ions or donates hydroxide ions (OH-) and has a pH greater than 7",
                "Accepts H+ ions"
            ),
            Triple(
                "What is oxidation?",
                "Oxidation is the loss of electrons by a molecule, atom, or ion",
                "Loss of electrons"
            ),
            Triple(
                "What is reduction?",
                "Reduction is the gain of electrons by a molecule, atom, or ion",
                "Gain of electrons"
            ),
            Triple(
                "What are the noble gases?",
                "Noble gases are Group 18 elements: Helium, Neon, Argon, Krypton, Xenon, and Radon. They are chemically inert",
                "Group 18 elements"
            ),
            Triple(
                "What is a covalent bond?",
                "A covalent bond is a chemical bond formed by sharing electrons between atoms",
                "Shared electrons"
            ),
            Triple(
                "What is an ionic bond?",
                "An ionic bond is a chemical bond formed by the transfer of electrons from one atom to another, creating ions",
                "Transferred electrons"
            ),
            Triple(
                "What is Avogadro's number?",
                "Avogadro's number is 6.022 × 10²³, representing the number of particles in one mole of a substance",
                "6.022 × 10²³"
            ),
            Triple(
                "What is a catalyst?",
                "A catalyst is a substance that speeds up a chemical reaction without being consumed in the process",
                "Speeds up reactions"
            ),
            Triple(
                "What is the chemical symbol for gold?",
                "Au (from the Latin 'aurum')",
                "Au"
            ),

            // Biology (35 cards)
            Triple(
                "What is DNA?",
                "DNA (Deoxyribonucleic Acid) is a molecule that carries genetic instructions for development, functioning, and reproduction of all living organisms",
                "Genetic blueprint"
            ),
            Triple(
                "What is a cell?",
                "A cell is the basic structural and functional unit of all living organisms",
                "Basic unit of life"
            ),
            Triple(
                "What is mitosis?",
                "Mitosis is cell division that produces two identical daughter cells with the same number of chromosomes as the parent cell",
                "Cell division"
            ),
            Triple(
                "What is meiosis?",
                "Meiosis is a type of cell division that reduces chromosome number by half, producing four gametes (sex cells)",
                "Makes sex cells"
            ),
            Triple(
                "What is evolution?",
                "Evolution is the process by which species change over time through natural selection and genetic variation",
                "Species change"
            ),
            Triple(
                "What is cellular respiration?",
                "Cellular respiration is the process by which cells break down glucose to produce ATP (energy), using oxygen and producing carbon dioxide and water",
                "Cell energy production"
            ),
            Triple(
                "What are chromosomes?",
                "Chromosomes are thread-like structures made of DNA and proteins that carry genetic information",
                "DNA packages"
            ),
            Triple(
                "What is an ecosystem?",
                "An ecosystem is a community of living organisms interacting with their physical environment",
                "Living community"
            ),
            Triple(
                "What is natural selection?",
                "Natural selection is the process where organisms better adapted to their environment tend to survive and produce more offspring",
                "Survival of fittest"
            ),
            Triple(
                "What is the difference between DNA and RNA?",
                "DNA is double-stranded and contains deoxyribose sugar, while RNA is single-stranded and contains ribose sugar. DNA uses thymine; RNA uses uracil",
                "Structure and sugar"
            ),
            Triple(
                "What is homeostasis?",
                "Homeostasis is the ability of an organism to maintain stable internal conditions despite external changes",
                "Internal balance"
            ),
            Triple(
                "What is the circulatory system?",
                "The circulatory system transports blood, nutrients, oxygen, and waste products throughout the body using the heart and blood vessels",
                "Blood transport"
            ),
            Triple(
                "What is a food chain?",
                "A food chain is a linear sequence showing how energy and nutrients pass from one organism to another",
                "Energy transfer"
            ),
            Triple(
                "What are enzymes?",
                "Enzymes are biological catalysts that speed up chemical reactions in living organisms",
                "Biological catalysts"
            ),
            Triple(
                "What is biodiversity?",
                "Biodiversity is the variety of life in a particular habitat or ecosystem",
                "Variety of life"
            ),
            Triple(
                "What is osmosis?",
                "Osmosis is the movement of water molecules across a semipermeable membrane from an area of high concentration to low concentration",
                "Water movement"
            ),
            Triple(
                "What is diffusion?",
                "Diffusion is the movement of molecules from an area of high concentration to an area of low concentration",
                "Molecule movement"
            ),
            Triple(
                "What is the human heart?",
                "The human heart is a muscular organ that pumps blood throughout the body, consisting of four chambers: two atria and two ventricles",
                "Blood pump"
            ),
            Triple(
                "What is immunity?",
                "Immunity is the body's ability to resist or eliminate harmful pathogens and foreign substances",
                "Disease resistance"
            ),
            Triple(
                "What is taxonomy?",
                "Taxonomy is the science of classifying and naming organisms",
                "Classification science"
            )
        )

        scienceData.forEachIndexed { index, (question, answer, hint) ->
            cards.add(Card(
                courseId = 3,
                question = question,
                answer = answer,
                hint = hint,
                category = "Science"
            ))
        }

        return cards
    }
}
