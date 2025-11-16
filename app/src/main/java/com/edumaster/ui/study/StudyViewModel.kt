package com.edumaster.ui.study

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.edumaster.data.models.Card
import com.edumaster.data.models.StudySession
import com.edumaster.data.repository.EduMasterRepository
import kotlinx.coroutines.launch
import java.util.Date

class StudyViewModel(private val repository: EduMasterRepository) : ViewModel() {

    // Current session state
    private val _currentCard = MutableLiveData<Card?>()
    val currentCard: LiveData<Card?> = _currentCard

    private val _cardsRemaining = MutableLiveData<List<Card>>(emptyList())
    val cardsRemaining: LiveData<List<Card>> = _cardsRemaining

    private val _showAnswer = MutableLiveData(false)
    val showAnswer: LiveData<Boolean> = _showAnswer

    private val _sessionComplete = MutableLiveData(false)
    val sessionComplete: LiveData<Boolean> = _sessionComplete

    // Session statistics
    private val _cardsReviewed = MutableLiveData(0)
    val cardsReviewed: LiveData<Int> = _cardsReviewed

    private val _cardsCorrect = MutableLiveData(0)
    val cardsCorrect: LiveData<Int> = _cardsCorrect

    private val _sessionStartTime = MutableLiveData<Long>()
    private val _totalCards = MutableLiveData(0)
    val totalCards: LiveData<Int> = _totalCards

    private val _xpEarned = MutableLiveData(0)
    val xpEarned: LiveData<Int> = _xpEarned

    private val _coinsEarned = MutableLiveData(0)
    val coinsEarned: LiveData<Int> = _coinsEarned

    // Progress percentage
    private val _progress = MutableLiveData(0)
    val progress: LiveData<Int> = _progress

    /**
     * Start a study session with due cards
     */
    fun startStudySession(courseId: Long? = null) {
        viewModelScope.launch {
            _sessionStartTime.value = System.currentTimeMillis()
            _cardsReviewed.value = 0
            _cardsCorrect.value = 0
            _xpEarned.value = 0
            _coinsEarned.value = 0
            _sessionComplete.value = false

            // Load due cards
            val dueCardsLiveData = if (courseId != null) {
                repository.getDueCardsByCourse(courseId, Date())
            } else {
                repository.getDueCards(Date())
            }

            dueCardsLiveData.observeForever { cards ->
                if (cards.isNotEmpty()) {
                    _cardsRemaining.value = cards.toMutableList()
                    _totalCards.value = cards.size
                    loadNextCard()
                } else {
                    // No cards to study
                    _sessionComplete.value = true
                }
            }
        }
    }

    /**
     * Load the next card from the remaining cards list
     */
    private fun loadNextCard() {
        val remaining = _cardsRemaining.value ?: emptyList()
        if (remaining.isNotEmpty()) {
            _currentCard.value = remaining.first()
            _showAnswer.value = false
            updateProgress()
        } else {
            completeSession()
        }
    }

    /**
     * Toggle showing the answer for the current card
     */
    fun toggleAnswer() {
        _showAnswer.value = !(_showAnswer.value ?: false)
    }

    /**
     * Review the current card with a quality rating (1-4)
     * 1 = Wrong, 2 = Hard, 3 = Good, 4 = Easy
     */
    fun reviewCard(quality: Int) {
        val card = _currentCard.value ?: return

        viewModelScope.launch {
            // Update card using SM-2 algorithm
            repository.reviewCard(card, quality)

            // Update session stats
            val reviewed = (_cardsReviewed.value ?: 0) + 1
            _cardsReviewed.value = reviewed

            if (quality >= 3) {
                _cardsCorrect.value = (_cardsCorrect.value ?: 0) + 1
            }

            // Calculate rewards (matching repository logic)
            _xpEarned.value = (_xpEarned.value ?: 0) + (quality * 5)
            _coinsEarned.value = (_coinsEarned.value ?: 0) + (quality * 2)

            // Remove card from remaining and load next
            val remaining = _cardsRemaining.value?.toMutableList() ?: mutableListOf()
            remaining.removeAt(0)
            _cardsRemaining.value = remaining

            loadNextCard()
        }
    }

    /**
     * Update progress percentage
     */
    private fun updateProgress() {
        val total = _totalCards.value ?: 0
        val reviewed = _cardsReviewed.value ?: 0

        _progress.value = if (total > 0) {
            (reviewed.toFloat() / total * 100).toInt()
        } else {
            0
        }
    }

    /**
     * Complete the study session and save statistics
     */
    private fun completeSession() {
        viewModelScope.launch {
            _sessionComplete.value = true

            val startTime = _sessionStartTime.value ?: System.currentTimeMillis()
            val duration = ((System.currentTimeMillis() - startTime) / 1000).toInt() // seconds
            val reviewed = _cardsReviewed.value ?: 0
            val correct = _cardsCorrect.value ?: 0

            // Save study session to database
            val session = StudySession(
                courseId = null, // All courses
                startTime = Date(startTime),
                endTime = Date(),
                cardsReviewed = reviewed,
                cardsCorrect = correct,
                duration = duration,
                isCompleted = true
            )

            repository.insertSession(session)
        }
    }

    /**
     * Skip the current card (review with lowest quality)
     */
    fun skipCard() {
        reviewCard(1)
    }

    /**
     * Get session accuracy percentage
     */
    fun getAccuracy(): Int {
        val reviewed = _cardsReviewed.value ?: 0
        val correct = _cardsCorrect.value ?: 0
        return if (reviewed > 0) {
            (correct.toFloat() / reviewed * 100).toInt()
        } else {
            0
        }
    }

    /**
     * Get session duration in seconds
     */
    fun getSessionDuration(): Int {
        val startTime = _sessionStartTime.value ?: System.currentTimeMillis()
        return ((System.currentTimeMillis() - startTime) / 1000).toInt()
    }

    /**
     * Reset session state
     */
    fun resetSession() {
        _currentCard.value = null
        _cardsRemaining.value = emptyList()
        _showAnswer.value = false
        _sessionComplete.value = false
        _cardsReviewed.value = 0
        _cardsCorrect.value = 0
        _totalCards.value = 0
        _xpEarned.value = 0
        _coinsEarned.value = 0
        _progress.value = 0
    }
}
