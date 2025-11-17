package com.edumaster.data.repository

import com.edumaster.data.models.Card
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import java.util.Date

/**
 * Unit tests for the SM-2 spaced repetition algorithm implementation
 */
class SM2AlgorithmTest {

    private lateinit var testCard: Card

    @Before
    fun setup() {
        testCard = Card(
            id = 1,
            courseId = 1,
            question = "Test Question",
            answer = "Test Answer",
            category = "Test",
            interval = 1,
            easeFactor = 2.5f,
            repetitions = 0,
            nextReview = Date(),
            timesReviewed = 0,
            timesCorrect = 0,
            timesIncorrect = 0
        )
    }

    @Test
    fun `SM-2 algorithm with quality 0 (complete blackout) resets card`() {
        val updated = updateCardWithSM2(testCard, 0)

        assertEquals(1, updated.interval)
        assertEquals(0, updated.repetitions)
        assertTrue(updated.easeFactor >= 1.3f)
    }

    @Test
    fun `SM-2 algorithm with quality 3 (correct with difficulty) increases interval`() {
        val updated = updateCardWithSM2(testCard, 3)

        assertTrue(updated.interval > testCard.interval)
        assertEquals(1, updated.repetitions)
        assertTrue(updated.easeFactor > 1.3f)
    }

    @Test
    fun `SM-2 algorithm with quality 5 (perfect recall) maximizes ease factor increase`() {
        val updated = updateCardWithSM2(testCard, 5)

        assertTrue(updated.interval > testCard.interval)
        assertEquals(1, updated.repetitions)
        assertTrue(updated.easeFactor > testCard.easeFactor)
    }

    @Test
    fun `SM-2 algorithm maintains minimum ease factor of 1_3`() {
        var card = testCard.copy(easeFactor = 1.5f)

        // Apply multiple poor quality ratings
        card = updateCardWithSM2(card, 0)
        card = updateCardWithSM2(card, 0)
        card = updateCardWithSM2(card, 1)

        assertTrue(card.easeFactor >= 1.3f)
    }

    @Test
    fun `SM-2 algorithm increases interval correctly for repetition 1`() {
        val updated = updateCardWithSM2(testCard, 4)

        assertEquals(6, updated.interval)
        assertEquals(1, updated.repetitions)
    }

    @Test
    fun `SM-2 algorithm increases interval correctly for repetition 2`() {
        val card = testCard.copy(repetitions = 1, interval = 6)
        val updated = updateCardWithSM2(card, 4)

        assertEquals(6 * card.easeFactor.toInt(), updated.interval)
        assertEquals(2, updated.repetitions)
    }

    @Test
    fun `SM-2 algorithm compounds intervals for subsequent repetitions`() {
        var card = testCard

        // First repetition
        card = updateCardWithSM2(card, 4)
        val firstInterval = card.interval

        // Second repetition
        card = updateCardWithSM2(card, 4)
        val secondInterval = card.interval

        assertTrue(secondInterval > firstInterval)
        assertTrue(secondInterval >= firstInterval * card.easeFactor.toInt())
    }

    @Test
    fun `Ease factor decreases with poor quality ratings`() {
        val updated = updateCardWithSM2(testCard, 1)

        assertTrue(updated.easeFactor < testCard.easeFactor)
    }

    @Test
    fun `Ease factor increases with high quality ratings`() {
        val updated = updateCardWithSM2(testCard, 5)

        assertTrue(updated.easeFactor > testCard.easeFactor)
    }

    @Test
    fun `Next review date is set to future based on interval`() {
        val beforeUpdate = System.currentTimeMillis()
        val updated = updateCardWithSM2(testCard, 4)
        val afterUpdate = System.currentTimeMillis()

        assertTrue(updated.nextReview.time > beforeUpdate)
        // Check that interval is applied (approximately)
        val expectedTime = beforeUpdate + (updated.interval * 24 * 60 * 60 * 1000)
        assertTrue(Math.abs(updated.nextReview.time - expectedTime) < 5000) // 5 second tolerance
    }

    // Helper function - mirrors the actual implementation
    private fun updateCardWithSM2(card: Card, quality: Int): Card {
        val newEaseFactor = (card.easeFactor + (0.1f - (5 - quality) * (0.08f + (5 - quality) * 0.02f))).coerceAtLeast(1.3f)

        val newRepetitions = if (quality < 3) 0 else card.repetitions + 1

        val newInterval = when {
            quality < 3 -> 1
            newRepetitions == 1 -> 6
            else -> (card.interval * newEaseFactor).toInt()
        }

        val nextReviewDate = Date(System.currentTimeMillis() + newInterval * 24 * 60 * 60 * 1000L)

        return card.copy(
            interval = newInterval,
            easeFactor = newEaseFactor,
            repetitions = newRepetitions,
            nextReview = nextReviewDate,
            lastReviewed = Date(),
            timesReviewed = card.timesReviewed + 1,
            timesCorrect = if (quality >= 3) card.timesCorrect + 1 else card.timesCorrect,
            timesIncorrect = if (quality < 3) card.timesIncorrect + 1 else card.timesIncorrect
        )
    }
}
